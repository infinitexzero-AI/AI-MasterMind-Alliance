import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useSwarmTelemetryNative } from './hooks/useSwarmTelemetryNative';

export default function App() {
  const { isConnected, messages, dispatchTask } = useSwarmTelemetryNative();
  const [command, setCommand] = useState('');

  const submitCommand = () => {
    if (command.trim()) {
      dispatchTask(command);
      setCommand('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>AILCC STEALTH {isConnected ? '⚡️' : '⚠️ OFFLINE'}</Text>
          <Text style={styles.subtitle}>// iOS MASTER BRIDGE</Text>
        </View>
        
        <ScrollView style={styles.logContainer}>
          {messages.map((msg, i) => (
            <View key={i} style={styles.logEntry}>
              <Text style={styles.timestamp}>[{new Date().toLocaleTimeString()}]</Text>
              <Text style={styles.logText}>{msg}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.omniBar}>
          <TextInput 
            style={styles.input} 
            placeholder="Dispatch directive to Swarm..." 
            placeholderTextColor="#888"
            value={command}
            onChangeText={setCommand}
            onSubmitEditing={submitCommand}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.sendButton} onPress={submitCommand}>
            <Text style={styles.sendButtonText}>SEND</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  title: { color: '#22d3ee', fontFamily: 'Courier', fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  subtitle: { color: '#52525b', fontFamily: 'Courier', fontSize: 10 },
  logContainer: { flex: 1, padding: 15 },
  logEntry: { marginBottom: 12, flexDirection: 'row' },
  timestamp: { color: '#52525b', fontFamily: 'Courier', fontSize: 11, marginRight: 8, marginTop: 2 },
  logText: { color: '#4ade80', fontFamily: 'Courier', fontSize: 13, flex: 1, lineHeight: 18 },
  omniBar: { padding: 15, borderTopWidth: 1, borderTopColor: '#27272a', flexDirection: 'row', backgroundColor: '#09090b' },
  input: { flex: 1, color: '#f8fafc', fontFamily: 'Courier', borderBottomWidth: 1, borderBottomColor: '#22d3ee', padding: 10, paddingLeft: 5 },
  sendButton: { justifyContent: 'center', marginLeft: 15, backgroundColor: '#22d3ee', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  sendButtonText: { color: '#000', fontWeight: 'bold', fontFamily: 'Courier', fontSize: 12 }
});
