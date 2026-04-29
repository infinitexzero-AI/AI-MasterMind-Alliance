import csv
import json
import os
from pathlib import Path
from collections import defaultdict

# Paths
VAULT_ROOT = Path("/Volumes/XDriveBeta/AILCC_PRIME/03_Data_Stores/Financial_Vault")
OUTPUT_MD = Path("/Volumes/XDriveBeta/AILCC_PRIME/03_Data_Stores/2025_Audit_Ledger.md")
OUTPUT_CSV = Path("/Volumes/XDriveBeta/AILCC_PRIME/03_Data_Stores/2025_Audit_Ledger_Cleaned.csv")
SUMMARY_JSON = Path("/Volumes/XDriveBeta/AILCC_PRIME/03_Data_Stores/Categorization_Summary.json")

# Categorization Logic
CATEGORIES = {
    "Bank Fees": ["non-sufficient", "nsf", "maintenance fee", "overdraft", "interac sc", "atm withdrawal", "account maintenance", "foreign transaction fee", "fee"],
    "Crypto / Investment": ["coinbase"],
    "Materials & Software": ["sherwin williams", "home depot", "floor coverings", "intuit", "quickbooks", "apple.com/bill", "microsoft*store", "godaddy.com"],
    "Travel, Meals & Gas": ["tim horton's", "mcdonald's", "second cup", "pita pit", "wendy's", "domino's", "shell", "esso", "mobil", "couche tard", "circle k", "metro", "sobey's fast fuel", "coasters"],
    "Subcontractors": ["jordan", "emilie", "martin savoie", "ben kinden", "howard", "ross mitchell", "goat branding", "clayton ross", "danovan harris", "gauvin savoie"],
    "Owner's Draw / Internal": ["joel alfred palk", "me e transfer", "joel ricard", "joel palk-ricard", "ecfc rbc"],
    "Personal / Non-Business": ["onlyfans.com", "casino nb", "entertainment"],
}

def get_category(description):
    desc_lower = description.lower()
    
    # EXCLUSION: E-Transfer Requests (Funds never left the account)
    if "e transfer request" in desc_lower or "e-transfer request" in desc_lower:
        return "Excluded: Request Only"
        
    # Exclude Reversals / NSF returns if they aren't actually income
    if "item returned nsf" in desc_lower or "reversal" in desc_lower:
        return "NSF Reversal / Failed Trans"
        
    for cat, keywords in CATEGORIES.items():
        if any(k in desc_lower for k in keywords):
            return cat
    
    if "e transfer" in desc_lower or "e-transfer" in desc_lower:
        return "Uncategorized E-Transfer"
    
    return "Other Expenses"

def format_currency(val):
    return f"${val:,.2f}"

def parse_csv(file_path):
    transactions = []
    with open(file_path, "r", encoding="utf-8-sig") as f:
        # Check first line for header
        first_line = f.readline().lower()
        f.seek(0)
        
        reader = csv.DictReader(f)
        for row in reader:
            # Map different headers to standard format
            date = row.get("Date") or row.get("Transaction Date") or ""
            desc = row.get("Bank description") or row.get("Description 1") or row.get("Description") or row.get("Transaction") or ""
            desc2 = row.get("Description 2") or ""
            if desc2:
                desc = f"{desc} {desc2}".strip()
                
            # Handle standard (Spent/Received) or RBC (Withdrawal/Loads)
            spent_val = row.get("Spent") or row.get("Withdrawal") or row.get("CAD$") or row.get("Amount") or "0"
            received_val = row.get("Received") or row.get("Loads") or "0"
            
            spent_str = str(spent_val).replace("$", "").replace(",", "").strip()
            received_str = str(received_val).replace("$", "").replace(",", "").strip()
            
            # Special case for RBC or others where Spent/Received are in one column
            try:
                # Handle cases where value might be empty string
                spent = float(spent_str) if spent_str else 0.0
            except ValueError:
                spent = 0.0
                
            try:
                received = float(received_str) if received_str else 0.0
            except ValueError:
                received = 0.0
            
            # If we don't have separate columns (one column for everything)
            if "Received" not in row and "Loads" not in row:
                if spent < 0:
                    received = abs(spent)
                    spent = 0.0
                else:
                    # Positive values in a single column are usually Spent (Withdrawals)
                    # unless it's a specific format like RBC's CAD$
                    pass 
            
            if not date and not desc:
                continue # Skip empty rows
                
            # Skip true zero-value / metadata rows to keep audit log clean
            if spent == 0 and received == 0:
                continue
                
            transactions.append({
                "Date": date,
                "Description": desc,
                "Spent": spent,
                "Received": received,
                "Source": file_path.parent.parent.name # Bank name
            })
    return transactions

def main():
    all_transactions = []
    category_totals = defaultdict(float)
    total_spent = 0.0
    total_received = 0.0
    
    print(f"Scanning vault: {VAULT_ROOT}")
    
    # Recursively find all raw transaction CSVs only in the vault
    csv_files = list(VAULT_ROOT.glob("**/Raw_Transactions/*.csv"))
    
    # De-duplicate files
    unique_files = {f.resolve() for f in csv_files}
    
    for csv_file in unique_files:
        if "Cleaned" in csv_file.name: continue
        print(f"Processing: {csv_file}")
        all_transactions.extend(parse_csv(csv_file))
        
    seen_txs = set()
    unique_ledger_data = []
    
    for tx in all_transactions:
        spent = tx["Spent"]
        received = tx["Received"]
        description = tx["Description"]
        date = tx["Date"]
        
        # Unique key for de-duplication
        tx_key = (date, description, spent, received)
        if tx_key in seen_txs:
            continue
        seen_txs.add(tx_key)
        
        # Determine Category
        cat = get_category(description)
        
        # SKIP EXCLUSIONS
        if cat == "Excluded: Request Only":
            continue
            
        if spent > 0:
            # Skip NSF reversals from expense totals to keep audit clean
            if cat != "NSF Reversal / Failed Trans":
                category_totals[cat] += spent
                total_spent += spent
        elif received > 0:
            if cat == "NSF Reversal / Failed Trans":
                # Do not count as income
                pass
            else:
                cat = "Income / Client Deposit"
                category_totals[cat] += received
                total_received += received
        else:
            # This case shouldn't be hit with the zero-check in the parser, 
            # but we'll categorize as Other just in case.
            cat = "Other Expenses"
            
        unique_ledger_data.append({
            "Date": date,
            "Description": description,
            "Category": cat,
            "Spent": spent,
            "Received": received,
            "Source": tx["Source"]
        })

    # Sort by date
    try:
        unique_ledger_data.sort(key=lambda x: x["Date"])
    except:
        pass # If dates are weirdly formatted

    # Write Cleaned CSV
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Description", "Category", "Spent", "Received", "Source"])
        writer.writeheader()
        writer.writerows(unique_ledger_data)

    # Write Markdown Summary (Compact Tables for MD060)
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
        f.write("|Date|Description|Category|Spent|Received|Bank|\n")
        f.write("|:---|:---|:---|:---|:---|:---|\n")
        for item in unique_ledger_data:
            spent_fmt = format_currency(item['Spent']) if item['Spent'] > 0 else ""
            received_fmt = format_currency(item['Received']) if item['Received'] > 0 else ""
            f.write(f"|{item['Date']}|{item['Description']}|{item['Category']}|{spent_fmt}|{received_fmt}|{item['Source']}|\n")

    # Write JSON Summary
    summary = {
        "totals": {
            "income": total_received,
            "expenditures": total_spent
        },
        "categories": dict(category_totals)
    }
    with open(SUMMARY_JSON, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=4)

    print(f"Consolidated Ledger generated: {OUTPUT_MD}")
    print(f"Cleaned CSV generated: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
