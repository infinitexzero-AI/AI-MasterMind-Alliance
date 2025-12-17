import os
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class GoogleBridge:
    SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
    # Paths relative to workspace root (assuming running from root)
    CLIENT_SECRET_FILE = 'google_client_secret.json'
    TOKEN_FILE = 'google_user_token.json'

    def __init__(self):
        self.creds = None
        self.service_sheets = None
        self.service_drive = None

    def authenticate(self):
        """Authenticates the user and sets up services."""
        print("DEBUG: entering authenticate...")
        self.creds = None

        if os.path.exists(self.TOKEN_FILE):
            try:
                self.creds = Credentials.from_authorized_user_file(self.TOKEN_FILE, self.SCOPES)
            except Exception:
                print("⚠️ Existing token invalid. Re-authenticating...")

        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                print("🔄 Refreshing access token...")
                try:
                    self.creds.refresh(Request())
                except Exception as e:
                    print(f"❌ Refresh failed: {e}")
                    self.creds = None
            
            if not self.creds:
                if not os.path.exists(self.CLIENT_SECRET_FILE):
                     print(f"❌ Error: {self.CLIENT_SECRET_FILE} not found.")
                     return False
                
                print("🔐 Initiating OAuth Login...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.CLIENT_SECRET_FILE, self.SCOPES)
                self.creds = flow.run_local_server(port=8080)
            
            with open(self.TOKEN_FILE, 'w') as token:
                token.write(self.creds.to_json())
                print(f"✅ Token saved to {self.TOKEN_FILE}")

        try:
             self.service_sheets = build('sheets', 'v4', credentials=self.creds, static_discovery=False)
             self.service_drive = build('drive', 'v3', credentials=self.creds, static_discovery=False)
             print("✅ Google Services Initialized.")
             return True
        except Exception as e:
            print(f"❌ Failed to build services: {e}")
            return False

    def create_sheet(self, title):
        """Creates a new spreadsheet."""
        if not self.service_sheets:
            if not self.authenticate():
                return None

        try:
            spreadsheet_body = {'properties': {'title': title}}
            spreadsheet = self.service_sheets.spreadsheets().create(
                body=spreadsheet_body, fields='spreadsheetId'
            ).execute()
            
            spreadsheet_id = spreadsheet.get('spreadsheetId')
            print(f"✅ Sheet created! ID: {spreadsheet_id}")
            return spreadsheet_id
        except HttpError as error:
            print(f"❌ An error occurred: {error}")
            return None

    def append_row(self, spreadsheet_id, values):
        """Appends a row of values to the first sheet."""
        if not self.service_sheets:
            if not self.authenticate():
                 return False
        
        try:
            body = {'values': [values]}
            self.service_sheets.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id, range="A1",
                valueInputOption="USER_ENTERED", body=body
            ).execute()
            print("✅ Data appended.")
            return True
        except HttpError as error:
            print(f"❌ An error occurred appending data: {error}")
            return False

if __name__ == '__main__':
    # Test run
    bridge = GoogleBridge()
    bridge.authenticate()
