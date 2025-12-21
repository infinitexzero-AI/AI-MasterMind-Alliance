import os
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2 import service_account
from googleapiclient.http import MediaIoBaseUpload
import io

CREDENTIALS_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/drive']

def test_drive_create():
    print("running drive creation diagnostic...")
    creds = service_account.Credentials.from_service_account_file(
        CREDENTIALS_FILE, scopes=SCOPES)
    
    service = build('drive', 'v3', credentials=creds, static_discovery=False)
    
    file_metadata = {'name': 'test_creation.txt'}
    media = MediaIoBaseUpload(io.BytesIO(b'Hello Drive'), mimetype='text/plain')
    
    try:
        file = service.files().create(body=file_metadata, media_body=media,
                                      fields='id').execute()
        print(f"✅ Success! Created file ID: {file.get('id')}")
    except HttpError as error:
        print(f"❌ API Error: {error}")

if __name__ == '__main__':
    test_drive_create()
