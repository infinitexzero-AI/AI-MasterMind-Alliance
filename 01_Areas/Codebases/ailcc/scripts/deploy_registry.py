
import os
import sys
import logging
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), '..', 'automations/python/credentials.json')
REGISTRY_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'registries', 'agents_registry.json'))
DRIVE_PROJECTS_FOLDER_ID = '1m7_mSLfMQPxCmNpzY3L8HWylo2sIGCHC' # 'PROJECTS' folder ID from drive_watcher.py

def authenticate_drive():
    """Authenticate with Google Drive API."""
    try:
        creds = service_account.Credentials.from_service_account_file(
            CREDENTIALS_FILE, scopes=['https://www.googleapis.com/auth/drive'])
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        logger.error(f"Authentication Failed: {e}")
        return None

def deploy_registry():
    """Upload or update agents_registry.json in Google Drive."""
    service = authenticate_drive()
    if not service:
        logger.error("Could not authenticate. Aborting.")
        sys.exit(1)

    logger.info("Authenticated with Google Drive.")
    
    # Check if the file already exists in the folder
    query = f"'{DRIVE_PROJECTS_FOLDER_ID}' in parents and name = 'agents_registry.json' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])

    media = MediaFileUpload(REGISTRY_FILE, mimetype='application/json')

    if files:
        # Update existing file
        file_id = files[0]['id']
        logger.info(f"Registry found (ID: {file_id}). Updating...")
        service.files().update(
            fileId=file_id,
            media_body=media
        ).execute()
        logger.info("✅ Registry updated successfully.")
    else:
        # Create new file
        logger.info("Registry not found. Creating new file...")
        file_metadata = {
            'name': 'agents_registry.json',
            'parents': [DRIVE_PROJECTS_FOLDER_ID]
        }
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        logger.info(f"✅ Registry deployed successfully (ID: {file.get('id')}).")

if __name__ == "__main__":
    if not os.path.exists(REGISTRY_FILE):
        logger.error(f"Local registry file not found: {REGISTRY_FILE}")
        sys.exit(1)
        
    deploy_registry()
