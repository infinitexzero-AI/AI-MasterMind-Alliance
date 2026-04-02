#!/usr/bin/env python3
"""
ADHD Calendar Manager - Apple Calendar Integration via AppleScript
Creates tiered reminders and manages Focus Mode automation
"""

import subprocess
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AppleCalendarManager:
    """Manage Apple Calendar via AppleScript"""
    
    # Priority to notification tier mapping
    NOTIFICATION_TIERS = {
        'CRITICAL': [
            {'offset_days': 14, 'type': 'banner'},
            {'offset_days': 7, 'type': 'banner'},
            {'offset_days': 2, 'type': 'banner'},
            {'offset_hours': 2, 'type': 'alarm'}
        ],
        'HIGH': [
            {'offset_days': 7, 'type': 'banner'},
            {'offset_days': 2, 'type': 'banner'},
            {'offset_hours': 12, 'type': 'banner'}
        ],
        'MEDIUM': [
            {'offset_days': 7, 'type': 'banner'}
        ]
    }
    
    def create_event(self, title: str, start_date: datetime, end_date: datetime,
                    description: str = "", priority: str = "MEDIUM",
                    course_code: str = "") -> bool:
        """
        Create calendar event with tiered notifications
        
        Args:
            title: Event title
            start_date: Event start datetime
            end_date: Event end datetime  
            description: Event notes/description
            priority: CRITICAL, HIGH, or MEDIUM
            course_code: Course identifier for color coding
        """
        
        # Format dates for AppleScript (MM/DD/YYYY HH:MM:SS)
        start_str = start_date.strftime("%m/%d/%Y %I:%M:%S %p")
        end_str = end_date.strftime("%m/%d/%Y %I:%M:%S %p")
        
        # Build AppleScript
        applescript = f'''
        tell application "Calendar"
            tell calendar "Home"
                set newEvent to make new event with properties {{summary:"{title}", start date:date "{start_str}", end date:date "{end_str}", description:"{description}"}}
                
                -- Add tiered alarms based on priority
                tell newEvent
        '''
        
        # Add notifications based on priority tier
        notifications = self.NOTIFICATION_TIERS.get(priority, self.NOTIFICATION_TIERS['MEDIUM'])
        
        for notif in notifications:
            if 'offset_days' in notif:
                offset = -notif['offset_days'] * 24 * 60  # Convert days to minutes
            else:
                offset = -notif['offset_hours'] * 60
            
            # AppleScript alarm type (sound alarm for critical, default otherwise)
            alarm_type = "sound alarm" if notif['type'] == 'alarm' else "display alarm"
            
            applescript += f'''
                    make new {alarm_type} at end of sound alarms with properties {{trigger interval:{offset}}}
'''
        
        applescript += '''
                end tell
            end tell
        end tell
        '''
        
        try:
            result = subprocess.run(['osascript', '-e', applescript],
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                logger.info(f"✅ Calendar event created: {title}")
                return True
            else:
                logger.error(f"❌ AppleScript error: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Calendar creation failed: {e}")
            return False
    
    def create_deadline_event(self, task_title: str, due_date: datetime,
                            course_code: str, priority: str = "HIGH") -> bool:
        """
        Create all-day deadline event
        """
        # All-day events: start at midnight, end at 11:59pm
        start = due_date.replace(hour=0, minute=0, second=0)
        end = due_date.replace(hour=23, minute=59, second=59)
        
        title = f"{course_code}: {task_title}" if course_code else task_title
        description = f"Priority: {priority}\nCourse: {course_code}"
        
        return self.create_event(title, start, end, description, priority, course_code)
    
    def create_study_block(self, title: str, start_time: datetime, 
                          duration_minutes: int, location: str = "Library") -> bool:
        """
        Create study session calendar block (triggers Deep Work focus mode)
        """
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Tag with "Study" to trigger Focus Mode automation
        description = f"Location: {location}\nAuto-trigger: Deep Work Focus Mode"
        title_tagged = f"Study: {title}"
        
        return self.create_event(title_tagged, start_time, end_time, description, "MEDIUM")


class AppleRemindersManager:
    """Manage Apple Reminders via AppleScript"""
    
    def create_reminder(self, title: str, notes: str = "", due_date: Optional[datetime] = None,
                       priority: int = 0, list_name: str = "Reminders") -> bool:
        """
        Create reminder in Apple Reminders
        
        Args:
            title: Reminder title
            notes: Body/notes text
            due_date: Due date/time
            priority: 0 (none), 1 (low), 5 (medium), 9 (high)
            list_name: Target list (e.g., "PSYC-301", "TODAY", "CRITICAL")
        """
        
        # Build AppleScript
        applescript = f'''
        tell application "Reminders"
            tell list "{list_name}"
                set newReminder to make new reminder with properties {{name:"{title}", body:"{notes}", priority:{priority}}}
        '''
        
        if due_date:
            due_str = due_date.strftime("%m/%d/%Y %I:%M:%S %p")
            applescript += f'''
                set due date of newReminder to date "{due_str}"
'''
        
        applescript += '''
            end tell
        end tell
        '''
        
        try:
            result = subprocess.run(['osascript', '-e', applescript],
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                logger.info(f"✅ Reminder created: {title}")
                return True
            else:
                logger.error(f"❌ Reminder creation failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Reminder creation failed: {e}")
            return False
    
    def create_course_list(self, course_code: str) -> bool:
        """Create a new reminder list for a course"""
        applescript = f'''
        tell application "Reminders"
            make new list with properties {{name:"{course_code}"}}
        end tell
        '''
        
        try:
            result = subprocess.run(['osascript', '-e', applescript],
                                  capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except Exception as e:
            logger.error(f"List creation failed: {e}")
            return False


class FocusModeManager:
    """Manage macOS Focus Modes via AppleScript/shortcuts"""
    
    FOCUS_MODES = [
        "Deep Work",
        "Semester Planning", 
        "Exam Prep",
        "Do Not Disturb"
    ]
    
    def trigger_focus_mode(self, mode: str, duration_minutes: Optional[int] = None) -> bool:
        """
        Activate a Focus Mode
        
        Args:
            mode: Focus mode name (from FOCUS_MODES)
            duration_minutes: Optional duration; if None, stays on until manually turned off
        """
        
        if mode not in self.FOCUS_MODES:
            logger.warning(f"Unknown focus mode: {mode}")
            return False
        
        # macOS Monterey+ supports focus mode automation via shortcuts
        # This requires creating a Shortcut that toggles focus modes
        
        logger.info(f"🔔 Triggering Focus Mode: {mode}")
        
        # Placeholder: Would call Shortcuts app or use private API
        # For now, log the request
        logger.info(f"   Duration: {duration_minutes if duration_minutes else 'indefinite'} min")
        
        # TODO: Implement via Shortcuts.app URL scheme or AppleScript
        # shortcuts://run-shortcut?name=ActivateFocusMode&input={mode}
        
        return True


# Example usage
if __name__ == '__main__':
    # Test calendar creation
    calendar = AppleCalendarManager()
    reminders = AppleRemindersManager()
    focus = FocusModeManager()
    
    # Create test deadline
    due_date = datetime.now() + timedelta(days=7)
    calendar.create_deadline_event(
        task_title="Research Paper on Neuroplasticity",
        due_date=due_date,
        course_code="PSYC-301",
        priority="HIGH"
    )
    
    # Create test reminder
    reminders.create_reminder(
        title="📚 Read Chapter 4: Synaptic Transmission",
        notes="Estimated time: 45 min\nContext: Library, morning\nCognitive load: 8/10",
        due_date=datetime.now() + timedelta(days=2),
        priority=5,
        list_name="PSYC-301"
    )
    
    # Trigger Focus Mode
    focus.trigger_focus_mode("Deep Work", duration_minutes=90)
