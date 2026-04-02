#!/usr/bin/env python3
"""
ADHD Email Processor - Monitor Edison Mail for Academic Triggers
Integrates with existing email_storage_analyzer.py and Cortex API
"""

import sqlite3
import os
import json
import re
import requests
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import logging
import time

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/infinite27/ailcc-framework/ailcc-framework/logs/adhd_email_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class AcademicTask:
    """Structured academic task extracted from email"""
    subject: str
    sender: str
    received_date: str
    due_date: Optional[str]
    course_code: Optional[str]
    task_type: str  # assignment, exam, reading, registration, deadline
    priority: str  # CRITICAL, HIGH, MEDIUM
    raw_body: str
    email_id: int
    
    def to_dict(self) -> Dict:
        return asdict(self)


class AcademicEmailParser:
    """Parse academic emails and extract structured task data"""
    
    # Academic keywords by category
    KEYWORDS = {
        'assignment': ['assignment', 'homework', 'paper', 'essay', 'project', 'lab report'],
        'exam': ['exam', 'test', 'quiz', 'midterm', 'final'],
        'reading': ['reading', 'chapter', 'textbook', 'article'],
        'deadline': ['deadline', 'due date', 'submit by', 'submission'],
        'registration': ['registration', 'enroll', 'add/drop', 'course selection']
    }
    
    # Course code patterns (e.g., PSYC-301, BIO205, CHEM 101)
    COURSE_PATTERN = re.compile(r'\b([A-Z]{2,4})[-\s]?(\d{3,4})\b')
    
    # Date patterns (various formats)
    DATE_PATTERNS = [
        re.compile(r'(?:due|deadline|submit by)[:\s]+(\w+ \d{1,2},? \d{4})'),  # "due: December 15, 2025"
        re.compile(r'(\d{1,2}/\d{1,2}/\d{2,4})'),  # 12/15/2025
        re.compile(r'(\d{4}-\d{2}-\d{2})'),  # 2025-12-15
        re.compile(r'(\w+ \d{1,2}(?:st|nd|rd|th)?)'),  # December 15th
    ]
    
    def categorize_email(self, subject: str, body: str) -> Optional[str]:
        """Determine if email is academic and what type"""
        text = (subject + " " + body).lower()
        
        for category, keywords in self.KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                return category
        return None
    
    def extract_course_code(self, text: str) -> Optional[str]:
        """Extract course code from text"""
        match = self.COURSE_PATTERN.search(text.upper())
        if match:
            return f"{match.group(1)}-{match.group(2)}"
        return None
    
    def extract_due_date(self, text: str) -> Optional[str]:
        """Extract due date from text"""
        for pattern in self.DATE_PATTERNS:
            match = pattern.search(text)
            if match:
                return match.group(1)
        return None
    
    def calculate_priority(self, task_type: str, due_date: Optional[str]) -> str:
        """Calculate priority based on task type and deadline"""
        # CRITICAL: exams, registration, deadlines within 3 days
        if task_type in ['exam', 'registration']:
            return 'CRITICAL'
        
        # Try to parse due date and check urgency
        if due_date:
            try:
                # Simplified: check if contains "tomorrow", "today", or this week
                if any(word in due_date.lower() for word in ['today', 'tomorrow']):
                    return 'CRITICAL'
            except:
                pass
        
        # HIGH: assignments with deadlines
        if task_type == 'assignment' and due_date:
            return 'HIGH'
        
        # MEDIUM: readings, undefined deadlines
        return 'MEDIUM'
    
    def parse_email(self, email_id: int, subject: str, sender: str, 
                   received_date: str, body: str) -> Optional[AcademicTask]:
        """Parse email and extract academic task if present"""
        
        task_type = self.categorize_email(subject, body)
        if not task_type:
            return None  # Not an academic email
        
        course_code = self.extract_course_code(subject + " " + body)
        due_date = self.extract_due_date(body)
        priority = self.calculate_priority(task_type, due_date)
        
        return AcademicTask(
            subject=subject,
            sender=sender,
            received_date=received_date,
            due_date=due_date,
            course_code=course_code,
            task_type=task_type,
            priority=priority,
            raw_body=body[:500],  # Truncate to first 500 chars for privacy
            email_id=email_id
        )


class ADHDEmailProcessor:
    """Monitor Edison Mail database and trigger task creation"""
    
    def __init__(self, edison_mail_path: str = None, cortex_url: str = "http://localhost:8000"):
        if edison_mail_path is None:
            self.base_path = Path.home() / "Library/Containers/com.edisonmail.edisonmail/Data/Library/Application Support/EdisonMail"
        else:
            self.base_path = Path(edison_mail_path)
        
        self.main_db = self.base_path / "edisonmail.db"
        self.cortex_url = cortex_url
        self.parser = AcademicEmailParser()
        
        # Track processed emails to avoid duplicates
        self.processed_file = Path.home() / ".ailcc_processed_emails.json"
        self.processed_ids = self._load_processed_ids()
        
    def _load_processed_ids(self) -> set:
        """Load list of already processed email IDs"""
        if self.processed_file.exists():
            try:
                with open(self.processed_file, 'r') as f:
                    return set(json.load(f))
            except:
                return set()
        return set()
    
    def _save_processed_id(self, email_id: int):
        """Save processed email ID"""
        self.processed_ids.add(email_id)
        with open(self.processed_file, 'w') as f:
            json.dump(list(self.processed_ids), f)
    
    def get_recent_emails(self, hours: int = 24) -> List[Tuple]:
        """Fetch recent emails from Edison Mail database"""
        if not self.main_db.exists():
            logger.error(f"Edison Mail database not found at: {self.main_db}")
            return []
        
        try:
            conn = sqlite3.connect(str(self.main_db))
            cursor = conn.cursor()
            
            # Find messages table (exact schema may vary)
            # This is a generic query; may need adjustment based on actual schema
            query = """
                SELECT id, subject, sender, date, body_text 
                FROM messages 
                WHERE datetime(date) > datetime('now', '-{} hours')
                ORDER BY date DESC
            """.format(hours)
            
            try:
                cursor.execute(query)
                emails = cursor.fetchall()
            except sqlite3.OperationalError as e:
                logger.warning(f"Query failed, trying alternate schema: {e}")
                # Fallback: get all recent messages without body
                cursor.execute("""
                    SELECT id, subject, sender, date, NULL 
                    FROM messages 
                    WHERE datetime(date) > datetime('now', '-{} hours')
                    ORDER BY date DESC
                """.format(hours))
                emails = cursor.fetchall()
            
            conn.close()
            return emails
            
        except Exception as e:
            logger.error(f"Error reading Edison Mail database: {e}")
            return []
    
    def send_to_cortex(self, task: AcademicTask) -> bool:
        """Send parsed task to Cortex API for processing"""
        try:
            response = requests.post(
                f"{self.cortex_url}/api/adhd/email/process",
                json=task.to_dict(),
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Task sent to Cortex: {task.subject}")
                return True
            else:
                logger.error(f"❌ Cortex API error: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            logger.error(f"⚠️  Cortex API not available at {self.cortex_url}")
            return False
        except Exception as e:
            logger.error(f"Error sending to Cortex: {e}")
            return False
    
    def check_for_emails(self):
        """Check database for new academic emails"""
        logger.info("🔍 Checking for new academic emails...")
        
        try:
            conn = sqlite3.connect(self.main_db)
            cursor = conn.cursor()
            
            # Updated query for actual Edison Mail schema
            # Using 'Message' table and 'snippet' for body content
            # sort by date DESC (date is likely INTEGER timestamp)
            query = """
                SELECT 
                    pid, 
                    subject, 
                    fromEmail, 
                    date, 
                    snippet 
                FROM Message 
                WHERE date > ? 
                ORDER BY date DESC 
                LIMIT 50
            """
            
            # Get emails from last 24 hours (or since last check)
            # Edison date is usually Unix timestamp (seconds)
            # If it's milliseconds, we might need to adjust, but usually seconds.
            # Safety check: if date is huge, it's ms.
            
            # For this run, let's just look back 24 hours
            one_day_ago = int((datetime.now() - timedelta(days=1)).timestamp())
            
            cursor.execute(query, (one_day_ago,))
            rows = cursor.fetchall()
            
            new_tasks_count = 0
            
            for row in rows:
                email_id, subject, sender, date_ts, body = row
                
                # Convert timestamp to string for processing
                try:
                    # check if ms (13 digits) or s (10 digits)
                    if date_ts > 1000000000000:
                         date_ts = date_ts / 1000
                    received_date = datetime.fromtimestamp(date_ts).isoformat()
                except:
                    received_date = str(date_ts)

                # Skip if already processed
                if email_id in self.processed_ids:
                    continue
                    
                # Parse
                task = self.parser.parse_email(email_id, subject or "", sender or "", received_date, body or "")
                
                if task:
                    logger.info(f"📧 Academic email detected: {task.subject}")
                    logger.info(f"   Type: {task.task_type} | Priority: {task.priority} | Course: {task.course_code}")
                    
                    # Send to Cortex
                    if self.send_to_cortex(task):
                        logger.info(f"✅ Task sent to Cortex: {task.subject}")
                        new_tasks_count += 1
                
                # Mark as processed regardless (to avoid researching non-academic ones repeatedly)
                # Optimization: In a real run, maybe only mark processed if we actually analyzed it?
                # But here we filter inside parse_email. 
                # To be safe, we should track everything we've 'seen' so we don't query it forever.
                self._save_processed_id(email_id)
                
            if new_tasks_count == 0:
                logger.info("ℹ️  No new academic emails found")
            else:
                logger.info(f"✨ Processed {new_tasks_count} new academic tasks")
                
            conn.close()
            
        except Exception as e:
            logger.error(f"Error reading Edison Mail database: {e}")
            # Identify columns for debugging if query fails again
            # try:
            #    c = conn.cursor()
            #    c.execute("PRAGMA table_info(Message)")
            #    logger.error(c.fetchall())
            # except: pass
    
    def run_continuous(self, interval_minutes: int = 5):
        """Run as continuous background service"""
        logger.info(f"🚀 Starting ADHD Email Processor (checking every {interval_minutes} min)")
        
        while True:
            try:
                self.check_for_emails()
            except Exception as e:
                logger.error(f"Error in processing loop: {e}")
            
            time.sleep(interval_minutes * 60)


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='ADHD Academic Email Processor')
    parser.add_argument('--continuous', action='store_true',
                       help='Run as continuous background service')
    parser.add_argument('--interval', type=int, default=5,
                       help='Check interval in minutes (default: 5)')
    parser.add_argument('--edison-path', type=str,
                       help='Custom path to Edison Mail data directory')
    parser.add_argument('--cortex-url', type=str, default='http://localhost:8000',
                       help='Cortex API URL')
    
    args = parser.parse_args()
    
    processor = ADHDEmailProcessor(
        edison_mail_path=args.edison_path,
        cortex_url=args.cortex_url
    )
    
    if args.continuous:
        processor.run_continuous(interval_minutes=args.interval)
    else:
        processor.process_new_emails()


if __name__ == '__main__':
    main()
