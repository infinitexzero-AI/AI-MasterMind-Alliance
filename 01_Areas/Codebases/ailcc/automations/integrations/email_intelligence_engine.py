import json
import os
import sys

class EmailIntelligenceEngine:
    def __init__(self, config_path):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        self.registry = self.load_registry()

    def load_registry(self):
        # Assumes registry is in the same directory as config or provided path
        return self.config

    def classify_email(self, subject, snippet):
        """Simulated LLM-based classification for AOI tagging."""
        subject_lower = subject.lower()
        snippet_lower = snippet.lower()
        
        tags = []
        for account in self.registry['accounts']:
            for aoi in account['areas_of_interest']:
                if aoi.lower() in subject_lower or aoi.lower() in snippet_lower:
                    tags.append(aoi)
        
        # Priority check
        is_urgent = any(kw in subject_lower for kw in ['urgent', 'important', 'deadline', 'asap'])
        
        return {
            "tags": tags if tags else ["Unclassified"],
            "tier": "Hot" if is_urgent else "Warm",
            "priority_score": 1.0 if is_urgent else 0.5
        }

    def process_test(self):
        """Mock processing for verification."""
        test_emails = [
            {"subject": "[HLTH-1011] Deadline Extension", "snippet": "The deadline for the lit review has been moved."},
            {"subject": "XCN Strategy Update", "snippet": "Latest market signals are in."},
            {"subject": "Lunch tomorrow?", "snippet": "Wanna grab a sandwich?"}
        ]
        
        results = []
        for email in test_emails:
            results.append(self.classify_email(email['subject'], email['snippet']))
        
        print(json.dumps(results, indent=2))

if __name__ == "__main__":
    config_path = "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/01_Areas/Codebases/ailcc/config/email_account_registry.json"
    engine = EmailIntelligenceEngine(config_path)
    if "--test-classification" in sys.argv:
        engine.process_test()
