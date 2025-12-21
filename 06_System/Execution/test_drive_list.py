import os
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2 import service_account

CREDENTIALS_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def test_drive_list():
    print("running drive diagnostic...")
    creds = service_account.Credentials.from_service_account_file(
        CREDENTIALS_FILE, scopes=SCOPES)
    
    # static_discovery=False is CRITICAL here based on previous learnings
    service = build('drive', 'v3', credentials=creds, static_discovery=False)
    
    try:
        results = service.files().list(
            pageSize=10, fields="nextPageToken, files(id, name)").execute()
        items = results.get('files', [])
        print(f"✅ Success! Found {len(items)} files.")
        if not items:
            print("No files found (this is normal for a fresh Service Account).")
        else:
            for item in items:
                print(f"{item['name']} ({item['id']})")
    except HttpError as error:
        print(f"❌ API Error: {error}")

if __name__ == '__main__':
    test_drive_list()
