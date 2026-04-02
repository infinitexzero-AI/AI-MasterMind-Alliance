#!/usr/bin/env python3
"""
test_daemons.py — Tycoon and Scholar Daemon Test Protocol
=========================================================
Ensures that the Tycoon and Scholar daemons (Bank CSV, NSLSC Scraper,
and Painting Tycoon) do not fail silently if bank export formats or
web portal DOMs change.
"""

import os
import json
import tempfile
from pathlib import Path

# Mock inputs to test the parsing logic without relying on external state
from automations.integrations.bank_csv_daemon import detect_bank_format, parse_amount, categorize
from automations.integrations.painting_tycoon_daemon import parse_quotes, parse_inventory

def test_bank_csv_format_detection():
    """Verify the daemon can detect RBC, TD, and Scotiabank headers."""
    assert detect_bank_format(["Account Number", "Cheque Number", "Description"]) == "rbc"
    assert detect_bank_format(["Transaction Date", "Debit Amount", "Credit Amount"]) == "td"
    assert detect_bank_format(["Date", "Withdrawals", "Deposits"]) == "scotiabank"
    assert detect_bank_format(["Date", "Description", "Amount"]) == "generic"

def test_bank_csv_currency_parsing():
    """Verify currency string to float conversions."""
    assert parse_amount("$1,234.56") == 1234.56
    assert parse_amount("-") == 0.0
    assert parse_amount("100.00") == 100.00

def test_bank_csv_categorization():
    """Verify spending categories map correctly."""
    assert categorize("Netflix Subscription") == "subscriptions"
    assert categorize("Sobeys Grocery Store") == "food"
    assert categorize("Etransfer Received") == "income"
    assert categorize("Unknown Charge") == "other"

def test_painting_tycoon_parser():
    """Verify the painting business quotes parser correctly tallies revenue."""
    with tempfile.TemporaryDirectory() as tmpdir:
        csv_path = Path(tmpdir) / "test_quotes.csv"
        csv_path.write_text(
            "Client,Type,Amount,Status,Date\\n"
            "Test Client,Interior,$1000.00,Booked,2026-03-01\\n"
            "Pending Client,Exterior,$500.50,Pending,2026-03-02"
        )
        
        result = parse_quotes(csv_path)
        assert result["total_revenue_booked"] == 1000.00
        assert len(result["upcoming_jobs"]) == 1
        assert len(result["pending"]) == 1

def test_painting_inventory_parser():
    """Verify the inventory parser trips low stock alerts."""
    with tempfile.TemporaryDirectory() as tmpdir:
        csv_path = Path(tmpdir) / "test_inventory.csv"
        csv_path.write_text(
            "Item,Quantity,Location\\n"
            "Gallons of Primer,3,Van\\n" # Below threshold of 5
            "Rolls of Painters Tape,20,Storage" # Above threshold of 10
        )
        
        result = parse_inventory(csv_path)
        assert len(result) == 1
        assert result[0]["item"] == "Gallons of Primer"
        assert result[0]["current_stock"] == 3

if __name__ == "__main__":
    print("🧪 Running Tycoon/Scholar Daemon Tests...")
    test_bank_csv_format_detection()
    test_bank_csv_currency_parsing()
    test_bank_csv_categorization()
    test_painting_tycoon_parser()
    test_painting_inventory_parser()
    print("✅ All Tycoon Daemon tests passed successfully!")
