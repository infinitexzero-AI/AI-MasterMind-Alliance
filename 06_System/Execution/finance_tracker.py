import json
import os
from datetime import datetime

FINANCE_DATA = "/Users/infinite27/AILCC_PRIME/06_System/State/finance_data.json"

def update_abundance():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 💰 Analyzing Sustainable Abundance Metrics...")
    
    with open(FINANCE_DATA, 'r') as f:
        data = json.load(f)
    
    # Simulate a small daily "abundance" generation (passive interest/ROI)
    bonus = 1.25
    data["metrics"]["net_worth"] += bonus
    data["accounts"][1]["balance"] += bonus
    data["last_updated"] = datetime.now().isoformat()
    
    # Calculate Abundance Score based on Savings Rate and Net Worth
    score = int((data["metrics"]["savings_rate_percent"] * 2) + (data["metrics"]["net_worth"] / 500))
    data["abundance_score"] = min(score, 100)
    
    with open(FINANCE_DATA, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"📈 Abundance Update: Net Worth +${bonus:.2f}. New Abundance Score: {data['abundance_score']}%")

if __name__ == "__main__":
    update_abundance()
