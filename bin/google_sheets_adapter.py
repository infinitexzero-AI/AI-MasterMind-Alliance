import os
import json
import sys
import gspread
from google.oauth2.service_account import Credentials

# Configuration
CREDENTIALS_PATH = os.path.expanduser("~/.aimma/google_credentials.json")
SHEET_NAME = "AILCC_Data_Stream"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

def setup_sheet(client, sheet_name):
    try:
        sheet = client.open(sheet_name)
        return sheet.sheet1
    except gspread.SpreadsheetNotFound:
        print(f"Spreadsheet '{sheet_name}' not found. Creating...")
        sheet = client.create(sheet_name)
        sheet.share(client.auth.service_account_email, perm_type='user', role='owner')
        print(f"Created sheet: {sheet.url}")
        return sheet.sheet1

def publish_to_sheet(json_path):
    # 1. Check Credentials
    if not os.path.exists(CREDENTIALS_PATH):
        print(f"ERROR: Credentials not found at {CREDENTIALS_PATH}")
        print("ACTION REQUIRED: Place your Google Service Account JSON key at this path.")
        sys.exit(1)

    # 2. Load Data
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"ERROR: Could not read payload: {e}")
        sys.exit(1)

    if not isinstance(data, list):
        print("ERROR: Payload must be a list of objects (JSON Array).")
        sys.exit(1)

    # 3. Connect to Google
    try:
        creds = Credentials.from_service_account_file(CREDENTIALS_PATH, scopes=SCOPES)
        client = gspread.authorize(creds)
        worksheet = setup_sheet(client, SHEET_NAME)
    except Exception as e:
        print(f"ERROR: Connection failure. check permissions/internet. {e}")
        sys.exit(1)

    # 4. Prepare Payload
    if not data:
        print("Warning: No data to publish.")
        return

    headers = list(data[0].keys())
    rows = [[item.get(h, "") for h in headers] for item in data]
    
    # 5. Write Data (Clear + Header + Rows)
    worksheet.clear()
    worksheet.append_row(headers)
    worksheet.append_rows(rows)
    
    print(f"SUCCESS: Published {len(rows)} rows to '{SHEET_NAME}'.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 google_sheets_adapter.py <json_file_path>")
        sys.exit(1)
    
    publish_to_sheet(sys.argv[1])
