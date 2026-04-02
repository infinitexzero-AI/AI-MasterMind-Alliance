import { useState } from 'react';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import notificationService from '../services/notificationService';

export const NotificationSettings = () => {
    const [permission, setPermission] = useState(Notification?.permission || 'default');
    const [testSent, setTestSent] = useState(false);

    const handleRequestPermission = async () => {
        const granted = await notificationService.requestPermission();
        setPermission(Notification.permission);
        if (granted) {
            notificationService.info('🎉 Notifications Enabled', 'You will now receive updates from the dashboard');
        }
    };

    const handleTestNotification = () => {
        notificationService.info('🧪 Test Notification', 'Browser notifications are working!');
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
    };

    const isSupported = 'Notification' in window;
    const isEnabled = permission === 'granted';

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
                {isEnabled ? (
                    <Bell className="w-5 h-5 text-green-400" />
                ) : (
                    <BellOff className="w-5 h-5 text-slate-500" />
                )}
                <div>
                    <h3 className="text-sm font-bold text-white">Browser Notifications</h3>
                    <p className="text-xs text-slate-500">
                        {isSupported ? 'Get alerts for agent health and tasks' : 'Not supported in this browser'}
                    </p>
                </div>
            </div>

            {!isSupported ? (
                <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    ⚠️ Your browser doesn't support notifications
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Status:</span>
                        <span className={clsx(
                            "text-xs font-mono px-2 py-1 rounded",
                            isEnabled ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"
                        )}>
                            {permission.toUpperCase()}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {!isEnabled && (
                            <button
                                onClick={handleRequestPermission}
                                className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg text-xs font-mono font-bold hover:bg-green-500/30 transition-all"
                            >
                                ENABLE NOTIFICATIONS
                            </button>
                        )}
                        {isEnabled && (
                            <button
                                onClick={handleTestNotification}
                                disabled={testSent}
                                className={clsx(
                                    "flex-1 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2",
                                    testSent
                                        ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                        : "bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30"
                                )}
                            >
                                {testSent ? (
                                    <>
                                        <CheckCircle className="w-3 h-3" />
                                        SENT!
                                    </>
                                ) : (
                                    'SEND TEST'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    {isEnabled && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-slate-500 bg-white/5 rounded-lg p-3"
                        >
                            <div className="font-mono text-green-400 mb-2">✓ Enabled Events:</div>
                            <ul className="space-y-1 ml-4">
                                <li>• Agent health changes</li>
                                <li>• New task assignments</li>
                                <li>• Task completions</li>
                                <li>• System errors</li>
                            </ul>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};
