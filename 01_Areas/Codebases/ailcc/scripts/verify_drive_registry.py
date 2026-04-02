
import os
import sys
import logging
import json
from googleapiclient.discovery import build
from google.oauth2 import service_account

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), '..', 'automations/python/credentials.json')
DRIVE_PROJECTS_FOLDER_ID = '1m7_mSLfMQPxCmNpzY3L8HWylo2sIGCHC' # 'PROJECTS' folder ID

def authenticate_drive():
    try:
        creds = service_account.Credentials.from_service_account_file(
            CREDENTIALS_FILE, scopes=['https://www.googleapis.com/auth/drive.readonly'])
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        logger.error(f"Authentication Failed: {e}")
        return None

def verify_cloud_registry():
    service = authenticate_drive()
    if not service:
        sys.exit(1)

    logger.info("Checking Google Drive for agents_registry.json...")
    
    # Query for the file in the specific folder
    query = f"'{DRIVE_PROJECTS_FOLDER_ID}' in parents and name = 'agents_registry.json' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name, modifiedTime)").execute()
    files = results.get('files', [])

    if files:
        file_info = files[0]
        logger.info(f"✅ FOUND: {file_info['name']}")
        logger.info(f"   ID: {file_info['id']}")
        logger.info(f"   Modified: {file_info['modifiedTime']}")
        
        # Optional: Read content to verify
        try:
            content = service.files().get_media(fileId=file_info['id']).execute()
            registry = json.loads(content)
            version = registry.get('version', 'unknown')
            orchestrator = registry.get('orchestrator', 'unknown')
            logger.info(f"   Content Verified: Version {version}, Orchestrator: {orchestrator}")
        except Exception as e:
            logger.warning(f"   Could not read content: {e}")
            
    else:
        logger.warning("❌ NOT FOUND: agents_registry.json not found in PROJECTS folder.")
        logger.info("   Please ensure you have manually uploaded the file.")

if __name__ == "__main__":
    verify_cloud_registry()
