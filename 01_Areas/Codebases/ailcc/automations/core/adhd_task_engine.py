#!/usr/bin/env python3
"""
ADHD Task Engine - AI-Powered Task Breakdown
Generates ADHD-friendly subtask decomposition with time estimates and cognitive load scoring
"""

import json
import requests
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@dataclass
class SubTask:
    """Individual atomic subtask"""
    title: str
    description: str
    estimated_minutes: int
    cognitive_load: int  # 1-10 scale
    order: int
    context_tags: List[str]  # Location/time cues for ADHD
    
    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class TaskBreakdown:
    """Complete task breakdown with metadata"""
    original_task: str
    total_subtasks: int
    total_estimated_hours: float
    breakdown: List[SubTask]
    generated_at: str
    ai_model: str
    
    def to_dict(self) -> Dict:
        return {
            'original_task': self.original_task,
            'total_subtasks': self.total_subtasks,
            'total_estimated_hours': self.total_estimated_hours,
            'breakdown': [st.to_dict() for st in self.breakdown],
            'generated_at': self.generated_at,
            'ai_model': self.ai_model
        }


class TaskBreakdownEngine:
    """Generate ADHD-optimized task breakdowns"""
    
    # ADHD-friendly task breakdown templates
    TEMPLATES = {
        'research_paper': [
            ('Choose topic and create research question', 30, 8, ['library', 'quiet space']),
            ('Initial literature search (find 10-15 sources)', 60, 7, ['library database', 'morning']),
            ('Read and annotate 3-5 key papers', 90, 9, ['library', 'focus mode']),
            ('Create detailed outline with thesis statement', 45, 7, ['desk', 'afternoon']),
            ('Write introduction draft', 60, 8, ['quiet space', 'morning']),
            ('Draft methods/context section', 90, 7, ['desk', 'any time']),
            ('Draft main argument/results section', 120, 9, ['quiet space', 'morning']),
            ('Draft discussion section', 60, 7, ['desk', 'afternoon']),
            ('Write conclusion', 30, 6, ['desk', 'any time']),
            ('First revision pass (structure & flow)', 45, 6, ['desk', 'fresh eyes']),
            ('Second revision pass (citations & formatting)', 60, 5, ['desk', 'detail mode']),
            ('Proofread aloud', 30, 4, ['quiet room', 'read aloud']),
            ('Final formatting check', 20, 3, ['desk', 'checklist mode']),
        ],
        'lab_report': [
            ('Review lab notes and data', 20, 5, ['desk', 'notebook']),
            ('Organize raw data into tables', 30, 6, ['computer', 'spreadsheet']),
            ('Write objective and hypothesis', 15, 4, ['desk', 'template']),
            ('Draft methods section', 30, 5, ['desk', 'lab manual']),
            ('Create figures/graphs', 45, 7, ['computer', 'data viz']),
            ('Write results section', 40, 6, ['desk', 'data ready']),
            ('Draft interpretation/discussion', 45, 8, ['quiet space', 'think mode']),
            ('Write conclusion', 20, 5, ['desk', 'summary mode']),
            ('Format citations and references', 25, 4, ['computer', 'citation tool']),
            ('Proofread and submit', 15, 3, ['desk', 'final check']),
        ],
        'assignment': [
            ('Read assignment instructions carefully', 10, 5, ['quiet space', 'highlight key points']),
            ('Identify 3-5 main requirements', 15, 6, ['desk', 'checklist']),
            ('Gather necessary materials/resources', 20, 4, ['library/computer', 'organize']),
            ('Create outline or plan', 20, 7, ['desk', 'brainstorm']),
            ('Complete first section/part', 45, 8, ['focus space', 'deep work']),
            ('Complete second section/part', 45, 8, ['focus space', 'deep work']),
            ('Review and refine', 30, 6, ['desk', 'edit mode']),
            ('Final check and submit', 15, 4, ['computer', 'checklist']),
        ],
        'exam_prep': [
            ('Review syllabus and identify key topics', 20, 5, ['desk', 'course docs']),
            ('Create study guide outline', 30, 7, ['desk', 'organize notes']),
            ('Review lecture notes for each topic', 60, 8, ['quiet space', 'active reading']),
            ('Create flashcards for key concepts', 45, 6, ['desk', 'Quizlet/cards']),
            ('Practice problems (if applicable)', 90, 9, ['desk', 'focus mode']),
            ('Group study session (optional)', 90, 7, ['study room', 'peers']),
            ('Review flashcards (spaced repetition)', 30, 5, ['anywhere', 'mobile']),
            ('Practice exam or self-test', 60, 8, ['quiet room', 'timed']),
            ('Review weak areas', 45, 7, ['desk', 'targeted study']),
            ('Final review day before', 60, 6, ['quiet space', 'confidence boost']),
        ],
        'reading': [
            ('Skim chapter for main headings', 10, 4, ['anywhere', 'preview']),
            ('Read introduction and conclusion', 15, 5, ['quiet space', 'context']),
            ('Read main content actively', 45, 8, ['focused space', 'highlight']),
            ('Take notes on key concepts', 20, 6, ['desk', 'notebook']),
            ('Review and summarize main points', 15, 5, ['desk', 'synthesis']),
        ]
    }
    
    def __init__(self, perplexity_api_key: Optional[str] = None):
        self.perplexity_api_key = perplexity_api_key
        self.perplexity_available = perplexity_api_key is not None
    
    def _generate_with_perplexity(self, task: str, due_date: Optional[str] = None) -> Optional[TaskBreakdown]:
        """Generate task breakdown using Perplexity API"""
        if not self.perplexity_available:
            return None
        
        try:
            # Construct prompt for Perplexity
            prompt = f"""
Generate an ADHD-friendly task breakdown for this academic task: "{task}"
{f'Due date: {due_date}' if due_date else ''}

Requirements:
- Break into atomic subtasks (each < 2 hours)
- Provide time estimates in minutes
- Rate cognitive load (1-10, where 10 is most demanding)
- Add location and time-of-day context cues (e.g., "library, morning" or "desk, focus mode")
- Order tasks logically (dependencies first)
- Include small wins every 30-60 minutes to maintain dopamine

Format as JSON with this structure:
{{
  "subtasks": [
    {{
      "title": "Clear action verb + specific task",
      "description": "Brief clarification",
      "estimated_minutes": 30,
      "cognitive_load": 7,
      "context_tags": ["location", "time/mode"]
    }}
  ]
}}
"""
            
            response = requests.post(
                'https://api.perplexity.ai/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.perplexity_api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'llama-3.1-sonar-large-128k-online',
                    'messages': [
                        {'role': 'system', 'content': 'You are an expert in ADHD-friendly task management and academic planning.'},
                        {'role': 'user', 'content': prompt}
                    ]
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content']
                
                # Parse JSON response
                parsed = json.loads(content)
                subtasks = []
                
                for i, st in enumerate(parsed['subtasks'], 1):
                    subtasks.append(SubTask(
                        title=st['title'],
                        description=st.get('description', ''),
                        estimated_minutes=st['estimated_minutes'],
                        cognitive_load=st['cognitive_load'],
                        order=i,
                        context_tags=st.get('context_tags', [])
                    ))
                
                total_hours = sum(st.estimated_minutes for st in subtasks) / 60
                
                return TaskBreakdown(
                    original_task=task,
                    total_subtasks=len(subtasks),
                    total_estimated_hours=round(total_hours, 1),
                    breakdown=subtasks,
                    generated_at=datetime.now().isoformat(),
                    ai_model='perplexity-sonar-large'
                )
            else:
                logger.warning(f"Perplexity API returned {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Perplexity API error: {e}")
            return None
    
    def _generate_with_template(self, task: str, task_type: str) -> TaskBreakdown:
        """Generate task breakdown using built-in templates (fallback)"""
        
        # Determine template based on task type
        template = self.TEMPLATES.get(task_type, self.TEMPLATES['assignment'])
        
        subtasks = []
        for i, (title, minutes, load, tags) in enumerate(template, 1):
            subtasks.append(SubTask(
                title=title,
                description='',
                estimated_minutes=minutes,
                cognitive_load=load,
                order=i,
                context_tags=tags
            ))
        
        total_hours = sum(st.estimated_minutes for st in subtasks) / 60
        
        return TaskBreakdown(
            original_task=task,
            total_subtasks=len(subtasks),
            total_estimated_hours=round(total_hours, 1),
            breakdown=subtasks,
            generated_at=datetime.now().isoformat(),
            ai_model=f'template-{task_type}'
        )
    
    def generate_breakdown(self, task: str, task_type: str = 'assignment', 
                          due_date: Optional[str] = None) -> TaskBreakdown:
        """
        Generate ADHD-optimized task breakdown
        
        Args:
            task: Original task description
            task_type: Type of task (research_paper, lab_report, assignment, exam_prep, reading)
            due_date: Optional due date string
        
        Returns:
            TaskBreakdown with atomic subtasks
        """
        
        logger.info(f"Generating task breakdown for: {task}")
        
        # Try Perplexity first (if available)
        if self.perplexity_available:
            breakdown = self._generate_with_perplexity(task, due_date)
            if breakdown:
                logger.info(f"✅ Generated {breakdown.total_subtasks} subtasks via Perplexity")
                return breakdown
        
        # Fallback to template-based generation
        breakdown = self._generate_with_template(task, task_type)
        logger.info(f"✅ Generated {breakdown.total_subtasks} subtasks via template")
        return breakdown
    
    def create_reminders_data(self, breakdown: TaskBreakdown, due_date: Optional[datetime] = None) -> List[Dict]:
        """
        Convert task breakdown to Apple Reminders format
        
        Returns list of reminder dictionaries ready for Apple Reminders API
        """
        reminders = []
        
        # Calculate suggested schedule working backwards from due date
        if due_date:
            # Allocate time slots
            current_date = due_date - timedelta(days=1)  # Start 1 day before due date
            
            for subtask in reversed(breakdown.breakdown):  # Work backwards
                # Suggest time based on context tags
                suggested_time = '14:00'  # Default afternoon
                if 'morning' in subtask.context_tags:
                    suggested_time = '09:00'
                elif 'afternoon' in subtask.context_tags:
                    suggested_time = '14:00'
                elif 'evening' in subtask.context_tags:
                    suggested_time = '19:00'
                
                # Create reminder dict
                reminders.append({
                    'title': subtask.title,
                    'notes': f"{subtask.description}\n\nEstimated time: {subtask.estimated_minutes} min\nCognitive load: {subtask.cognitive_load}/10\nContext: {', '.join(subtask.context_tags)}",
                    'due_date': current_date.strftime('%Y-%m-%d'),
                    'due_time': suggested_time,
                    'priority': 'high' if subtask.cognitive_load >= 8 else 'medium'
                })
                
                # Move back in time for next task
                if subtask.estimated_minutes > 90:
                    current_date -= timedelta(days=1)
        else:
            # No due date: just list tasks without scheduling
            for subtask in breakdown.breakdown:
                reminders.append({
                    'title': subtask.title,
                    'notes': f"{subtask.description}\n\nEstimated time: {subtask.estimated_minutes} min\nCognitive load: {subtask.cognitive_load}/10\nContext: {', '.join(subtask.context_tags)}",
                    'priority': 'high' if subtask.cognitive_load >= 8 else 'medium'
                })
        
        return reminders


# Example usage for testing
if __name__ == '__main__':
    engine = TaskBreakdownEngine()
    
    # Test with different task types
    test_tasks = [
        ("Write 10-page neuropsychology research paper on synaptic plasticity", "research_paper"),
        ("Complete PSYC-301 lab report on fMRI data analysis", "lab_report"),
        ("Study for BIO-205 midterm on nervous system", "exam_prep"),
    ]
    
    for task, task_type in test_tasks:
        print(f"\n{'='*60}")
        print(f"Task: {task}")
        print(f"Type: {task_type}")
        print('='*60)
        
        breakdown = engine.generate_breakdown(task, task_type)
        
        print(f"\nTotal subtasks: {breakdown.total_subtasks}")
        print(f"Estimated time: {breakdown.total_estimated_hours} hours\n")
        
        for subtask in breakdown.breakdown:
            print(f"{subtask.order}. {subtask.title}")
            print(f"   ⏱️  {subtask.estimated_minutes} min | 🧠 Load: {subtask.cognitive_load}/10")
            print(f"   📍 {', '.join(subtask.context_tags)}")
            print()
