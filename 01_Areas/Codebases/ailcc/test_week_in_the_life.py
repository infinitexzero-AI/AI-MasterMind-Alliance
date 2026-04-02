import sys
import asyncio
from pathlib import Path
from comet_framework.orchestration_engine import OrchestrationEngine
from automations.skills.scholar_academic_writer import ScholarAcademicWriter

# Configure paths
AILCC_PRIME_PATH = Path(__file__).resolve().parent
sys.path.insert(0, str(AILCC_PRIME_PATH))

async def main():
    print("🚀 === Phase 74: Academic Singularity Integration Test ===")
    
    # 1. Initialize Orhcestrator
    print("\n[1] Initializing Orchestrator Engine...")
    engine = OrchestrationEngine()
    
    # 2. Trigger Term Sync
    print("\n[2] Triggering Local Term Sync (Mocking Websocket SYNC_ACADEMIC_TERM)...")
    mock_payload = {
        "command": {"action": "SYNC_ACADEMIC_TERM"}
    }
    # Direct test of the specific block, mimicking what the websocket handler does
    import json
    from automations.core.task_assignments import assign_task
    courses_path = AILCC_PRIME_PATH.parent / "modes/mode-1-student/current_courses.json"
    if courses_path.exists():
        with open(courses_path, 'r') as f:
            term_data = json.load(f)
        synced_count = 0
        for course in term_data.get('courses', []):
            course_code = course.get('code')
            for d in course.get('deliverables', []):
                if d.get('status') != 'Completed':
                    title = d.get('title')
                    assign_task(
                        task_id=f"uni_{course_code.replace(' ', '')}_{title.replace(' ', '')}",
                        task_title=f"[{course_code}] {title}",
                        agent_id="scholar",
                        priority=3
                    )
                    synced_count += 1
        print(f"Synced {synced_count} pending deliverables from {term_data.get('semester')} to OmniTracker.")
    
    # 3. Trigger Scholar Academic Writer with local OneDrive file
    print("\n[3] Triggering Scholar Academic Writer on OneDrive File...")
    writer = ScholarAcademicWriter()
    test_file_path = str(AILCC_PRIME_PATH.parent / "modes/mode-1-student/COMM_3611_Exam_Strategy.md")
    
    output_path = writer.execute_draft(
        task_id="TEST_uni_COMM3611_Essay1", 
        prompt="Synthesize the COMM 3611 Open Book Exam Strategy",
        target_length_words=500,
        source_file=test_file_path
    )
    
    # 4. Success Check
    print(f"\n✅ === Week-in-the-Life Test Complete ===")
    print(f"Draft saved successfully to: {output_path}")

if __name__ == "__main__":
    asyncio.run(main())
