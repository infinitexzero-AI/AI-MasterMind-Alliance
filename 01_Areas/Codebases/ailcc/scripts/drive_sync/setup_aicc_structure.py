import os
from googleapiclient.discovery import build
from google.oauth2 import service_account

# CONFIGURATION
SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = 'credentials.json' # Ensure this file exists in root
ROOT_FOLDER_NAME = 'AICC'
SUBFOLDERS = ['Blueprints', 'Tasks', 'Logs', 'Errors']

def authenticate():
    # Authenticates using the Service Account file
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        raise FileNotFoundError(f"Missing {SERVICE_ACCOUNT_FILE} - Cannot sync to Drive.")
    
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def create_folder(service, name, parent_id=None):
    # Creates a folder if it doesn't exist
    query = f"mimeType='application/vnd.google-apps.folder' and name='{name}' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"

    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])
    
    if files:
        print(f"Found existing folder: {name} ({files[0]['id']})")
        return files[0]['id']
    else:
        file_metadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        if parent_id:
            file_metadata['parents'] = [parent_id]
        
        file = service.files().create(body=file_metadata, fields='id').execute()
        print(f"Created new folder: {name} (ID: {file.get('id')})")
        return file.get('id')

def main():
    try:
        service = authenticate()
        print(f"Initializing AICC Structure...")

        # 1. Create Root AICC Folder
        root_id = create_folder(service, ROOT_FOLDER_NAME)
        
        # 2. Create Subfolders
        for folder in SUBFOLDERS:
            create_folder(service, folder, parent_id=root_id)
            
        print("SUCCESS: AICC Folder Structure verified.")
    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == '__main__':
    main()
