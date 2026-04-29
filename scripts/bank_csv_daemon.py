import csv
import json
from pathlib import Path
from collections import defaultdict

RAW_CSV = Path("/Volumes/XDriveBeta/AILCC_PRIME/03_Data_Stores/RBC_Transactions_2025_RAW.csv")
OUTPUT_MD = Path("/Volumes/XDriveBeta/AILCC_PRIME/03_Data_Stores/2025_Audit_Ledger.md")
OUTPUT_CSV = Path("/Volumes/XDriveBeta/AILCC_PRIME/03_Data_Stores/2025_Audit_Ledger_Cleaned.csv")
SUMMARY_JSON = Path("/Volumes/XDriveBeta/AILCC_PRIME/03_Data_Stores/Categorization_Summary.json")

# Categorization Logic
CATEGORIES = {
    "Bank Fees": ["non-sufficient", "nsf", "maintenance fee", "overdraft", "interac sc", "atm withdrawal"],
    "Crypto / Investment": ["coinbase"],
    "Materials & Software": ["sherwin williams", "home depot", "floor coverings", "intuit", "quickbooks"],
    "Travel, Meals & Gas": ["tim horton's", "mcdonald's", "second cup", "pita pit", "wendy's", "domino's", "shell", "esso", "mobil", "couche tard", "circle k", "metro"],
    "Subcontractors": ["jordan", "emilie", "martin savoie", "ben kinden", "howard", "ross mitchell", "goat branding"],
    "Owner's Draw / Internal": ["joel alfred palk", "me e transfer"],
}

def get_category(description):
    desc_lower = description.lower()
    for cat, keywords in CATEGORIES.items():
        if any(k in desc_lower for k in keywords):
            return cat
    
    # Special handling for generic E-Transfers not caught above
    if "e transfer" in desc_lower or "e-transfer" in desc_lower:
        return "Uncategorized E-Transfer"
    
    return "Other Expenses"

def format_currency(val):
    return f"${val:,.2f}"

def main():
    ledger_data = []
    category_totals = defaultdict(float)
    total_spent = 0.0
    total_received = 0.0
    
    if not RAW_CSV.exists():
        print(f"Error: {RAW_CSV} not found.")
        return

    with open(RAW_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            date = row.get("Date", "")
            description = row.get("Bank description", "")
            spent_str = row.get("Spent", "").replace("$", "").replace(",", "")
            received_str = row.get("Received", "").replace("$", "").replace(",", "")
            
            spent = float(spent_str) if spent_str else 0.0
            received = float(received_str) if received_str else 0.0
            
            total_spent += spent
            total_received += received
            
            if spent > 0:
                cat = get_category(description)
                category_totals[cat] += spent
            elif received > 0:
                cat = "Income / Client Deposit"
                category_totals[cat] += received
            else:
                cat = "Zero-Value / Meta"
            
            ledger_data.append({
                "Date": date,
                "Description": description,
                "Category": cat,
                "Spent": spent,
                "Received": received
            })

    # Write Cleaned CSV
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Description", "Category", "Spent", "Received"])
        writer.writeheader()
        writer.writerows(ledger_data)

    # Write Markdown Summary
    with open(OUTPUT_MD, "w", encoding="utf-8") as f:
        f.write("# 2025 Financial Audit Ledger\n\n")
        f.write(f"**Total Income:** {format_currency(total_received)}\n")
        f.write(f"**Total Expenditures:** {format_currency(total_spent)}\n\n")
        
        f.write("## Category Breakdown\n\n")
        f.write("|Category|Amount|\n")
        f.write("|:---|:---|\n")
        for cat, total in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
            f.write(f"|{cat}|{format_currency(total)}|\n")
        
        f.write("\n## Detailed Transaction Log\n\n")
        f.write("|Date|Description|Category|Spent|Received|\n")
        f.write("|:---|:---|:---|:---|:---|\n")
        for item in ledger_data:
            spent_fmt = format_currency(item['Spent']) if item['Spent'] > 0 else ""
            received_fmt = format_currency(item['Received']) if item['Received'] > 0 else ""
            f.write(f"|{item['Date']}|{item['Description']}|{item['Category']}|{spent_fmt}|{received_fmt}|\n")

    # Write JSON Summary for verification
    summary = {
        "totals": {
            "income": total_received,
            "expenditures": total_spent
        },
        "categories": dict(category_totals)
    }
    with open(SUMMARY_JSON, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=4)

    print(f"Ledger generated: {OUTPUT_MD}")
    print(f"Cleaned CSV generated: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
