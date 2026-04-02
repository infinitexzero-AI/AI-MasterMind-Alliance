
import os
from googleapiclient.discovery import build
from google.oauth2 import service_account

SERVICE_ACCOUNT_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/drive']

def authenticate():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def find_folder(service, name):
    query = f"mimeType='application/vnd.google-apps.folder' and name='{name}' and trashed=false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])
    if files:
        return files[0]['id']
    return None

def create_folder(service, name):
    file_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    file = service.files().create(body=file_metadata, fields='id').execute()
    return file.get('id')

def main():
    service = authenticate()
    folders = ['COMMAND_INBOX', 'PROCESSED', 'FINANCIALS', 'PROJECTS', 'LEGAL']
    ids = {}
    for name in folders:
        fid = find_folder(service, name)
        if not fid:
            print(f"Creating {name}...")
            fid = create_folder(service, name)
        print(f"{name}_ID: {fid}")
        ids[name] = fid
    
    print("ALL IDS:", ids)

if __name__ == '__main__':
    main()
