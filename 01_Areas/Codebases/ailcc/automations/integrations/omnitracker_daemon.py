#!/usr/bin/env python3
"""
omnitracker_daemon.py — Proactive Intent Spawning Loop (Reactive Protocol)
=============================================================================
This daemon sweeps the AILCC Nexus for upcoming academic deadlines and proactively 
injects Swarm Tasks into the queue *before* user intervention. 
Upgraded to Phase 79 standards: Polling removed. Uses completely asynchronous Redis PubSub.
"""

import os
import json
import uuid
import time
import asyncio
from datetime import datetime, timedelta
import logging

import sys
from pathlib import Path
AILCC_PRIME = Path(__file__).resolve().parent.parent.parent
if str(AILCC_PRIME) not in sys.path:
    sys.path.insert(0, str(AILCC_PRIME))

from core.daemon_factory import ReactiveDaemon

HIPPOCAMPUS_DIR = "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage"
ACADEMIC_MATRIX_PATH = os.path.join(HIPPOCAMPUS_DIR, "academic_matrix", "current_semester.json")

class OmnitrackerDaemon(ReactiveDaemon):
    def __init__(self):
        super().__init__("OmnitrackerDaemon")
        self.generated_cache = set()

    async def setup(self):
        # Register explicit reactive listener
        self.subscribe("OMNITRACKER_REFRESH_REQUEST", self.handle_refresh)
        # Background debounced heartbeat
        self.tasks.append(asyncio.create_task(self.debounced_poll()))

    async def handle_refresh(self, payload):
        self.logger.info("Received OMNITRACKER_REFRESH_REQUEST. Instantiating sweep immediately.")
        await self.sweep()

    def load_academic_matrix(self):
        if not os.path.exists(ACADEMIC_MATRIX_PATH):
            return None
        try:
            with open(ACADEMIC_MATRIX_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Failed to parse academic matrix: {e}")
            return None

    def analyze_deadlines(self, matrix_data):
        now = datetime.now()
        upcoming_tasks = []

        if not matrix_data or "semester" not in matrix_data:
            return upcoming_tasks

        for course in matrix_data["semester"].get("courses", []):
            course_id = course.get("id", "Unknown")
            for item in course.get("assignments", []):
                due_date_str = item.get("due_date", "")
                if item.get("status") in ["TODO", "IN_PROGRESS"] and due_date_str:
                    try:
                        due_date = datetime.fromisoformat(due_date_str)
                        due_date = due_date.replace(tzinfo=None)
                        days_until = (due_date - now).days
                        
                        if 0 <= days_until <= 14:
                            task_intent_id = f"{course_id}_{item['title']}_{due_date_str}"
                            if task_intent_id not in self.generated_cache:
                                upcoming_tasks.append({
                                    "course": course_id,
                                    "title": item['title'],
                                    "days_until": days_until,
                                    "intent_id": task_intent_id,
                                    "priority": "CRITICAL" if days_until <= 3 else ("HIGH" if days_until <= 7 else "ROUTINE")
                                })
                    except ValueError:
                        pass
        return upcoming_tasks

    async def spawn_predictive_tasks(self, upcoming_tasks):
        for task in upcoming_tasks:
            self.logger.info(f"Proactive Intent Triggered: {task['course']} - {task['title']} (Due in {task['days_until']} days)")
            
            payload = f"Pre-computational preparation for impending deadline: {task['course']} - {task['title']}"
            swarm_task = {
                "task_id": f"omni_{int(time.time())}_{uuid.uuid4().hex[:4]}",
                "target_agent_id": "@comet", 
                "payload": payload,
                "priority": task['priority'],
                "status": "QUEUED",
                "started_at": datetime.now().isoformat(),
                "metadata": {
                    "is_ai_generated": True,
                    "source": "OmnitrackerPredictiveLoop",
                    "course": task["course"]
                }
            }

            try:
                # Append task directly into Swarm Tasks queue inside Redis async
                await self.redis.rpush("swarm:tasks", json.dumps(swarm_task))
                
                signal = {
                    "signal_id": f"sig_{int(time.time())}_{uuid.uuid4().hex[:4]}",
                    "source": "OMNITRACKER",
                    "type": "STATE_CHANGE",
                    "severity": "ROUTINE",
                    "message": f"AI Spawned Context Node: {task['course']} - {task['title']}",
                    "timestamp": datetime.now().isoformat()
                }
                await self.broadcast("neural_synapse", signal)
                
                self.generated_cache.add(task['intent_id'])
                self.logger.info(f"Successfully spawned AI task: {swarm_task['task_id']}")
            except Exception as e:
                self.logger.error(f"Failed to push semantic task to Redis: {e}")

    async def sweep(self):
        self.logger.info("Initiating intent-prediction sweep based on academic state vectors...")
        matrix_data = await asyncio.to_thread(self.load_academic_matrix)
        upcoming = await asyncio.to_thread(self.analyze_deadlines, matrix_data)
        if upcoming:
             await self.spawn_predictive_tasks(upcoming)
        else:
             self.logger.info("No actionable incoming deadlines within 14-day probability cone.")

    async def debounced_poll(self):
        self.logger.info("Omnitracker daemon active. Predicting workflows asynchronously (1-Hour throttle).")
        while True:
            await self.sweep()
            await asyncio.sleep(3600)

if __name__ == "__main__":
    daemon = OmnitrackerDaemon()
    asyncio.run(daemon.run())
