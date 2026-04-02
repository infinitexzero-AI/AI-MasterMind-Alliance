#!/usr/bin/env python3
"""
wealth_executor.py — Sovereign Wealth Deployment Engine (Tycoon Module)
=======================================================================
Reads the surplus capital calculated by the `bank_csv_daemon.py`.
Creates a PENDING deployment in the OmniTracker. Wait for Commander approval,
then executes a simulated API trade to acquire S&P 500 equivalent ETFs.

Usage:
    python3 wealth_executor.py --stage_surplus 1500.00
    python3 wealth_executor.py --execute
"""

import os
import sys
import json
import logging
import argparse
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [TycoonWealth] %(message)s")
logger = logging.getLogger(__name__)

HIPPOCAMPUS_DIR = Path("/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/hippocampus_storage")
WEALTH_DIR      = HIPPOCAMPUS_DIR / "tycoon_reports" / "sovereign_wealth"
OMNI_QUEUE      = HIPPOCAMPUS_DIR / "nexus_state" / "active_tasks.json"

def stage_surplus(amount: float):
    """Stages the surplus into the OmniTracker for Biometric approval."""
    os.makedirs(WEALTH_DIR, exist_ok=True)
    os.makedirs(OMNI_QUEUE.parent, exist_ok=True)
    
    # Generate the deployment plan
    plan = {
        "status": "PENDING_BIOMETRIC_APPROVAL",
        "staged_at": datetime.now().isoformat(),
        "total_surplus_cad": amount,
        "allocations": {
            "VFV.TO_SP500": amount * 0.80,
            "BTC_SPOT_ETF": amount * 0.20
        }
    }
    
    plan_file = WEALTH_DIR / "staged_deployment.json"
    plan_file.write_text(json.dumps(plan, indent=2))
    
    # Inject into OmniTracker queue so the Commander sees it
    try:
        tasks = []
        if OMNI_QUEUE.exists():
            tasks = json.loads(OMNI_QUEUE.read_text())
            
        tasks.append({
            "id": f"SOV-WEALTH-{int(datetime.now().timestamp())}",
            "title": f"Biometric Sign-Off: Deploy ${amount:.2f} Surplus",
            "domain": "TYCOON",
            "urgency": "CRITICAL",
            "status": "pending_approval",
            "action_type": "wealth_deployment",
            "metadata": {"allocations": plan["allocations"]}
        })
        
        OMNI_QUEUE.write_text(json.dumps(tasks, indent=2))
        logger.info(f"✅ Surplus of ${amount:.2f} staged. Awaiting Nexus UI Biometric Auth.")
        
    except Exception as e:
        logger.error(f"Failed to stage to OmniTracker: {e}")

def execute_staged_deployment():
    """Fires the broker API if the plan status has been updated to APPROVED by the Nexus UI."""
    plan_file = WEALTH_DIR / "staged_deployment.json"
    if not plan_file.exists():
        logger.warning("No staged deployment found.")
        return
        
    plan = json.loads(plan_file.read_text())
    
    if plan["status"] != "APPROVED":
        # Check if BiometricConsent was actually granted in the global state
        BIOMETRIC_STATE = HIPPOCAMPUS_DIR / "nexus_state" / "biometric_consent.json"
        if BIOMETRIC_STATE.exists():
            consent = json.loads(BIOMETRIC_STATE.read_text())
            if consent.get("status") == "AUTHORIZED" and consent.get("action_id") == plan.get("action_id"):
                plan["status"] = "APPROVED"
                logger.info("✅ BiometricConsent verified via Global State.")
            else:
                logger.warning(f"Deployment blocked. Awaiting Commander authorization.")
                return
        else:
            logger.warning(f"Deployment blocked. Status is {plan['status']}.")
            return
            
    # Circuit Breaker: Safety check against burn-rate
    BURN_METRICS = HIPPOCAMPUS_DIR / "tycoon_reports" / "burn_rate_metrics.json"
    if BURN_METRICS.exists():
        metrics = json.loads(BURN_METRICS.read_text())
        current_burn = metrics.get("current_month", {}).get("burn_rate", 0)
        income = metrics.get("current_month", {}).get("income", 0)
        
        if current_burn > (income * 1.2):
            logger.error("🛑 CIRCUIT BREAKER TRIGGERED: Burn rate exceeds income by >20%. Wealth deployment HALTED.")
            plan["status"] = "REJECTED_BY_SAFETY_BREAKER"
            plan_file.write_text(json.dumps(plan, indent=2))
            return
        
    logger.info("🔐 Biometric match confirmed by Nexus. Executing API Trades...")
    logger.info(f"Buying VFV.TO: ${plan['allocations']['VFV.TO_SP500']:.2f}")
    logger.info(f"Buying BTC ETF: ${plan['allocations']['BTC_SPOT_ETF']:.2f}")
    
    # ... In production, execute `requests.post` to Interactive Brokers API ...
    
    plan["status"] = "EXECUTED"
    plan["executed_at"] = datetime.now().isoformat()
    plan_file.write_text(json.dumps(plan, indent=2))
    
    # Rename to keep historical ledger
    executed_file = WEALTH_DIR / f"executed_{int(datetime.now().timestamp())}.json"
    plan_file.rename(executed_file)
    logger.info("📈 Capital Deployed successfully. Sovereign objective met.")

def verify_infrastructure_budget(cost_per_month: float) -> bool:
    """Verifies if the proposed infrastructure cost fits within the allocated Tycoon budget."""
    budget_file = HIPPOCAMPUS_DIR / "tycoon_reports" / "infrastructure_budget.json"
    if not budget_file.exists():
        # Default starting budget if not defined
        budget_data = {"allocated_monthly": 50.0, "current_spend": 0.0}
        os.makedirs(budget_file.parent, exist_ok=True)
        budget_file.write_text(json.dumps(budget_data, indent=2))
    else:
        budget_data = json.loads(budget_file.read_text())
        
    remaining = budget_data.get("allocated_monthly", 50.0) - budget_data.get("current_spend", 0.0)
    if remaining >= cost_per_month:
        return True
    logger.warning(f"Infrastructure budget breached. Needed: ${cost_per_month}, Remaining: ${remaining}")
    return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sovereign Wealth Deployment Engine")
    parser.add_argument("--stage_surplus", type=float, help="Amount of CAD surplus to stage")
    parser.add_argument("--execute", action="store_true", help="Execute approved staged surplus")
    args = parser.parse_args()

    if args.stage_surplus:
        stage_surplus(args.stage_surplus)
    elif args.execute:
        execute_staged_deployment()
    else:
        logger.info("Nothing to do. Use --stage_surplus or --execute.")
