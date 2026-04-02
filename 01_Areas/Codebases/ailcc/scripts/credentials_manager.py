#!/usr/bin/env python3
"""
Secure Credentials Manager for Life Library
Safely store and retrieve API keys, tokens, and credentials

Features:
- Encrypted storage using macOS Keychain
- Easy add/retrieve interface
- Support for multiple services
- Automatic integration with all scripts

Usage:
    python3 credentials_manager.py add gemini
    python3 credentials_manager.py get gemini
    python3 credentials_manager.py list
    python3 credentials_manager.py delete gemini
"""

import os
import json
import sys
import subprocess
from pathlib import Path
from typing import Optional, Dict, List
import argparse


class CredentialsManager:
    """Secure credential storage using macOS Keychain"""
    
    SERVICE_NAME = "LifeLibrary"
    
    # Supported services and their metadata
    SERVICES = {
        'gemini': {
            'name': 'Google Gemini API',
            'url': 'https://makersuite.google.com/app/apikey',
            'type': 'api_key'
        },
        'github': {
            'name': 'GitHub Personal Access Token',
            'url': 'https://github.com/settings/tokens',
            'type': 'token'
        },
        'linear': {
            'name': 'Linear API Key',
            'url': 'https://linear.app/settings/api',
            'type': 'api_key'
        },
        'google_drive': {
            'name': 'Google Drive OAuth',
            'url': 'https://console.cloud.google.com/apis/credentials',
            'type': 'oauth'
        },
        'openai': {
            'name': 'OpenAI API Key',
            'url': 'https://platform.openai.com/api-keys',
            'type': 'api_key'
        },
        'anthropic': {
            'name': 'Anthropic (Claude) API Key',
            'url': 'https://console.anthropic.com/settings/keys',
            'type': 'api_key'
        },
        'notion': {
            'name': 'Notion Integration Token',
            'url': 'https://www.notion.so/my-integrations',
            'type': 'token'
        },
        'grok': {
            'name': 'Grok (X.AI) API Key',
            'url': 'https://console.x.ai/',
            'type': 'api_key'
        },
        'perplexity': {
            'name': 'Perplexity API Key',
            'url': 'https://www.perplexity.ai/settings/api',
            'type': 'api_key'
        },
        'apple_id': {
            'name': 'Apple ID (iCloud)',
            'url': 'https://appleid.apple.com',
            'type': 'login'
        }
    }
    
    def __init__(self):
        self.config_dir = Path.home() / "ailcc-framework" / "ailcc-framework" / "config" / "credentials"
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # Metadata file (NOT for storing secrets!)
        self.metadata_file = self.config_dir / "credentials_metadata.json"
        
    def add_credential(self, service: str, credential: str, account: Optional[str] = None) -> bool:
        """Add credential to macOS Keychain"""
        
        if not account:
            account = f"{service}_key"
        
        try:
            # Use macOS security command to store in Keychain
            cmd = [
                'security', 'add-generic-password',
                '-s', self.SERVICE_NAME,
                '-a', account,
                '-w', credential,
                '-U'  # Update if exists
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                # Update metadata
                self._update_metadata(service, account)
                return True
            else:
                print(f"❌ Failed to add credential: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def get_credential(self, service: str, account: Optional[str] = None) -> Optional[str]:
        """Retrieve credential from macOS Keychain"""
        
        if not account:
            account = f"{service}_key"
        
        try:
            cmd = [
                'security', 'find-generic-password',
                '-s', self.SERVICE_NAME,
                '-a', account,
                '-w'  # Output password only
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return None
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def delete_credential(self, service: str, account: Optional[str] = None) -> bool:
        """Delete credential from Keychain"""
        
        if not account:
            account = f"{service}_key"
        
        try:
            cmd = [
                'security', 'delete-generic-password',
                '-s', self.SERVICE_NAME,
                '-a', account
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                self._remove_metadata(service, account)
                return True
            else:
                return False
                
        except Exception as e:
            return False
    
    def list_credentials(self) -> List[Dict]:
        """List all stored credentials"""
        
        metadata = self._load_metadata()
        credentials = []
        
        for service, data in metadata.items():
            info = self.SERVICES.get(service, {'name': service, 'type': 'unknown'})
            credentials.append({
                'service': service,
                'name': info['name'],
                'type': info['type'],
                'account': data.get('account'),
                'added': data.get('added'),
                'last_used': data.get('last_used')
            })
        
        return credentials
    
    def interactive_add(self, service: str):
        """Interactive credential addition with guidance"""
        
        if service not in self.SERVICES:
            print(f"⚠️  Unknown service: {service}")
            print(f"Available services: {', '.join(self.SERVICES.keys())}")
            custom = input("Continue anyway? (y/n): ")
            if custom.lower() != 'y':
                return
        else:
            info = self.SERVICES[service]
            print(f"\n🔑 Adding {info['name']}")
            print(f"Get your {info['type']} at: {info['url']}\n")
        
        # Get credential
        credential = input(f"Paste your {service} credential: ").strip()
        
        if not credential:
            print("❌ No credential provided")
            return
        
        # Confirm
        masked = credential[:4] + '...' + credential[-4:] if len(credential) > 8 else '***'
        print(f"\nCredential: {masked}")
        confirm = input("Save this credential? (y/n): ")
        
        if confirm.lower() != 'y':
            print("❌ Cancelled")
            return
        
        # Save
        if self.add_credential(service, credential):
            print(f"✅ {service} credential saved securely to Keychain!")
            
            # Test it if it's Gemini
            if service == 'gemini':
                print("\n🧪 Testing Gemini API key...")
                test_success = self._test_gemini(credential)
                if test_success:
                    print("✅ API key works!")
                else:
                    print("⚠️  API key may not be valid")
        else:
            print(f"❌ Failed to save credential")
    
    def _test_gemini(self, api_key: str) -> bool:
        """Test Gemini API key"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content("Say 'test successful'")
            return 'test successful' in response.text.lower()
        except:
            return False
    
    def _update_metadata(self, service: str, account: str):
        """Update metadata file"""
        from datetime import datetime
        
        metadata = self._load_metadata()
        
        if service not in metadata:
            metadata[service] = {
                'account': account,
                'added': datetime.now().isoformat(),
                'last_used': None
            }
        
        self._save_metadata(metadata)
    
    def _remove_metadata(self, service: str, account: str):
        """Remove from metadata"""
        metadata = self._load_metadata()
        if service in metadata:
            del metadata[service]
        self._save_metadata(metadata)
    
    def _load_metadata(self) -> Dict:
        """Load metadata file"""
        if self.metadata_file.exists():
            return json.loads(self.metadata_file.read_text())
        return {}
    
    def _save_metadata(self, metadata: Dict):
        """Save metadata file"""
        self.metadata_file.write_text(json.dumps(metadata, indent=2))
    
    def export_env_vars(self):
        """Export credentials as environment variables"""
        
        metadata = self._load_metadata()
        env_file = self.config_dir / ".env"
        
        lines = ["# Auto-generated environment variables"]
        lines.append("# Source this file: source config/credentials/.env\n")
        
        for service in metadata.keys():
            credential = self.get_credential(service)
            if credential:
                env_var = f"{service.upper()}_API_KEY"
                lines.append(f"export {env_var}='{credential}'")
        
        env_file.write_text('\n'.join(lines))
        print(f"✅ Environment variables exported to: {env_file}")
        print(f"   Source with: source {env_file}")


def main():
    parser = argparse.ArgumentParser(description='Secure Credentials Manager')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Add command
    add_parser = subparsers.add_parser('add', help='Add a credential')
    add_parser.add_argument('service', help='Service name (gemini, github, linear, etc.)')
    add_parser.add_argument('--credential', help='Credential value (or will prompt)')
    
    # Get command
    get_parser = subparsers.add_parser('get', help='Get a credential')
    get_parser.add_argument('service', help='Service name')
    
    # List command
    subparsers.add_parser('list', help='List all credentials')
    
    # Delete command
    del_parser = subparsers.add_parser('delete', help='Delete a credential')
    del_parser.add_argument('service', help='Service name')
    
    # Export command
    subparsers.add_parser('export', help='Export as environment variables')
    
    args = parser.parse_args()
    
    manager = CredentialsManager()
    
    if args.command == 'add':
        if args.credential:
            success = manager.add_credential(args.service, args.credential)
            if success:
                print(f"✅ {args.service} credential saved!")
            else:
                print(f"❌ Failed to save credential")
        else:
            manager.interactive_add(args.service)
    
    elif args.command == 'get':
        credential = manager.get_credential(args.service)
        if credential:
            print(credential)
        else:
            print(f"❌ No credential found for {args.service}", file=sys.stderr)
            sys.exit(1)
    
    elif args.command == 'list':
        credentials = manager.list_credentials()
        
        if not credentials:
            print("No credentials stored")
            return
        
        print(f"\n🔑 Stored Credentials")
        print("="*60)
        for cred in credentials:
            print(f"\n{cred['service']}")
            print(f"  Name: {cred['name']}")
            print(f"  Type: {cred['type']}")
            print(f"  Added: {cred.get('added', 'Unknown')}")
            if cred.get('last_used'):
                print(f"  Last used: {cred['last_used']}")
        print("="*60 + "\n")
    
    elif args.command == 'delete':
        success = manager.delete_credential(args.service)
        if success:
            print(f"✅ Deleted {args.service} credential")
        else:
            print(f"❌ Failed to delete {args.service}")
    
    elif args.command == 'export':
        manager.export_env_vars()
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
