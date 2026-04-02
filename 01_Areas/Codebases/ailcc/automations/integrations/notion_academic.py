#!/usr/bin/env python3
"""
Notion Academic Integration
Manages Academic Dashboard, GPA tracking, and assignment view
"""

import os
import logging
import requests
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotionAcademicManager:
    def __init__(self, token=None):
        self.token = token or os.getenv("NOTION_TOKEN")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
        
        # ID placeholders - to be filled after setup
        self.pages = {
            "dashboard": os.getenv("NOTION_DASHBOARD_ID"),
            "assignments": os.getenv("NOTION_ASSIGNMENTS_DB_ID")
        }

    def verify_access(self):
        if not self.token:
            logger.error("Notion Token missing")
            return False
        try:
            r = requests.get("https://api.notion.com/v1/users/me", headers=self.headers)
            return r.status_code == 200
        except:
            return False

    def create_assignment(self, title, course, due_date, status="Not Started", priority="Medium"):
        """Create a new assignment in the tracker database"""
        if not self.pages["assignments"]:
            logger.warning("Assignments Database ID not configured")
            return None

        payload = {
            "parent": {"database_id": self.pages["assignments"]},
            "properties": {
                "Name": {"title": [{"text": {"content": title}}]},
                "Course": {"select": {"name": course}},
                "Due Date": {"date": {"start": due_date}},
                "Status": {"status": {"name": status}},
                "Priority": {"select": {"name": priority}}
            }
        }
        
        try:
            r = requests.post("https://api.notion.com/v1/pages", headers=self.headers, json=payload)
            r.raise_for_status()
            logger.info(f"Created Notion assignment: {title}")
            return r.json().get("url")
        except Exception as e:
            logger.error(f"Failed to create assignment: {e}")
            return None

    def update_gpa(self, current_gpa, term_gpa):
        """Update GPA widget on dashboard (if block ID known or via page property)"""
        # Checks for a specific 'GPA' page property on the dashboard page
        if not self.pages["dashboard"]:
            return
            
        payload = {
            "properties": {
                "Cumulative GPA": {"number": current_gpa},
                "Term GPA": {"number": term_gpa}
            }
        }
        requests.patch(f"https://api.notion.com/v1/pages/{self.pages['dashboard']}", 
                      headers=self.headers, json=payload)

if __name__ == "__main__":
    manager = NotionAcademicManager()
    if manager.verify_access():
        print("Notion access verified.")
    else:
        print("Notion access failed or token missing.")
