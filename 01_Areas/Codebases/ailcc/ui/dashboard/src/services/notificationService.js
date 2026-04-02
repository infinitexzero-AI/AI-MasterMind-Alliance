/**
 * Browser Notification Service
 * Handles push notifications for dashboard events
 */

import { useState, useEffect } from 'react';

class NotificationService {
    constructor() {
        this.enabled = false;
        this.permission = 'default';
        this.checkPermission();
    }

    checkPermission() {
        if (!('Notification' in window)) {
            console.warn('Browser notifications not supported');
            return false;
        }
        this.permission = Notification.permission;
        this.enabled = this.permission === 'granted';
        return this.enabled;
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            this.enabled = permission === 'granted';
            return this.enabled;
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    }

    send(title, options = {}) {
        if (!this.enabled) {
            console.log('Notifications disabled:', title);
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });

            // Auto-close after 5 seconds if not specified
            if (options.autoClose !== false) {
                setTimeout(() => notification.close(), 5000);
            }

            return notification;
        } catch (error) {
            console.error('Failed to send notification:', error);
            return null;
        }
    }

    // Specific notification types
    agentUnhealthy(agentId, score) {
        return this.send('⚠️ Agent Unhealthy', {
            body: `${agentId} health score dropped to ${score}`,
            tag: `agent-${agentId}`,
            requireInteraction: true
        });
    }

    agentRecovered(agentId, score) {
        return this.send('✅ Agent Recovered', {
            body: `${agentId} health score improved to ${score}`,
            tag: `agent-${agentId}`
        });
    }

    taskAssigned(taskId, agentId) {
        return this.send('📋 New Task Assigned', {
            body: `${taskId} assigned to ${agentId}`,
            tag: `task-${taskId}`
        });
    }

    taskCompleted(taskId, agentId) {
        return this.send('✅ Task Completed', {
            body: `${taskId} completed by ${agentId}`,
            tag: `task-${taskId}`
        });
    }

    chatMessage(agentId, preview) {
        return this.send('💬 New Chat Message', {
            body: `${agentId}: ${preview}`,
            tag: `chat-${agentId}`
        });
    }

    error(message) {
        return this.send('❌ Error', {
            body: message,
            requireInteraction: true
        });
    }

    info(title, message) {
        return this.send(title, {
            body: message
        });
    }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Helper hook for React components
export const useNotifications = () => {
    const [enabled, setEnabled] = useState(notificationService.enabled);
    const [permission, setPermission] = useState(notificationService.permission);

    const requestPermission = async () => {
        const granted = await notificationService.requestPermission();
        setEnabled(granted);
        setPermission(notificationService.permission);
        return granted;
    };

    useEffect(() => {
        setEnabled(notificationService.enabled);
        setPermission(notificationService.permission);
    }, []);

    return {
        enabled,
        permission,
        requestPermission,
        send: notificationService.send.bind(notificationService),
        agentUnhealthy: notificationService.agentUnhealthy.bind(notificationService),
        agentRecovered: notificationService.agentRecovered.bind(notificationService),
        taskAssigned: notificationService.taskAssigned.bind(notificationService),
        taskCompleted: notificationService.taskCompleted.bind(notificationService),
        chatMessage: notificationService.chatMessage.bind(notificationService),
        error: notificationService.error.bind(notificationService),
        info: notificationService.info.bind(notificationService)
    };
};

export default notificationService;
