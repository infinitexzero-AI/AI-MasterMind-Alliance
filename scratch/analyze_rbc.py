import csv
import json
from decimal import Decimal

def analyze_rbc(file_path):
    nsf_total = Decimal('0.00')
    coinbase_in = Decimal('0.00')
    coinbase_out = Decimal('0.00')
    total_spent = Decimal('0.00')
    total_received = Decimal('0.00')
    nsf_count = 0
    
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            spent_str = row['Spent'].replace('$', '').replace(',', '').strip()
            received_str = row['Received'].replace('$', '').replace(',', '').strip()
            
            spent = Decimal(spent_str) if spent_str else Decimal('0.00')
            received = Decimal(received_str) if received_str else Decimal('0.00')
            
            total_spent += spent
            total_received += received
            
            desc = row['Bank description'].lower()
            
            if 'non-sufficient funds' in desc or 'nsf' in desc:
                nsf_total += spent
                nsf_count += 1
            
            if 'coinbase' in desc:
                if spent > 0:
                    coinbase_out += spent
                if received > 0:
                    coinbase_in += received
                    
    return {
        "nsf_total": float(nsf_total),
        "nsf_count": nsf_count,
        "coinbase_volume": {
            "in": float(coinbase_in),
            "out": float(coinbase_out),
            "net": float(coinbase_in - coinbase_out)
        },
        "totals": {
            "spent": float(total_spent),
            "received": float(total_received)
        }
    }

if __name__ == "__main__":
    file_path = r'c:\Users\infin\AILCC_PRIME\03_Data_Stores\Finance_Hub\Analysis_Projects\RBC_Transactions_2025_RAW.csv'
    results = analyze_rbc(file_path)
    print(json.dumps(results, indent=2))
