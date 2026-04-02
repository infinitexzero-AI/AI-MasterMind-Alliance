# Google Drive API Setup Guide

Complete guide for Google Drive and Calendar API integration with OAuth 2.0 for the AI Mastermind Team project.

## Overview

This guide covers:
- **Google Drive API**: File storage, synchronization, and collaboration
- **Google Calendar API**: Event scheduling and management
- **OAuth 2.0**: Secure authentication and token management
- **Best Practices**: Rate limiting, error handling, and optimization

**Status**: OAuth credentials (`credentials.json` and `token.json`) are already configured!

---

## Table of Contents

1. [OAuth Token Validation](#oauth-token-validation)
2. [File Operations](#file-operations)
3. [Calendar Operations](#calendar-operations)
4. [Rate Limiting](#rate-limiting)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## OAuth Token Validation

### Token Lifecycle

Your existing `token.json` contains:
- **Access Token**: Valid for ~1 hour
- **Refresh Token**: Valid indefinitely (until revoked)
- **Token Expiry**: Timestamp for automatic refresh

### Validation Script

Create `automations/validate_google_token.py`:

```python
"""
Google OAuth Token Validation
Checks token validity and refreshes if needed
"""

import os
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from datetime import datetime, timezone

def load_token():
    """Load token from token.json"""
    if not os.path.exists('token.json'):
        raise FileNotFoundError("❌ token.json not found. Run google_auth_setup.py first")
    
    with open('token.json', 'r') as f:
        token_data = json.load(f)
    
    return Credentials.from_authorized_user_file('token.json')

def validate_token(creds):
    """
    Validate token and refresh if needed
    
    Returns:
        tuple: (is_valid, creds, message)
    """
    
    # Check if token exists
    if not creds:
        return False, None, "No credentials found"
    
    # Check if token is expired
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            try:
                # Refresh the token
                creds.refresh(Request())
                
                # Save refreshed token
                with open('token.json', 'w') as token_file:
                    token_file.write(creds.to_json())
                
                return True, creds, "Token refreshed successfully"
            except Exception as e:
                return False, None, f"Token refresh failed: {str(e)}"
        else:
            return False, None, "Token invalid and cannot be refreshed"
    
    # Token is valid
    expiry = creds.expiry
    if expiry:
        time_left = (expiry - datetime.now(timezone.utc)).total_seconds() / 60
        return True, creds, f"Token valid for {int(time_left)} minutes"
    else:
        return True, creds, "Token valid (no expiry info)"

def check_token_scopes(creds):
    """Verify token has required scopes"""
    required_scopes = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/calendar'
    ]
    
    token_scopes = creds.scopes if hasattr(creds, 'scopes') else []
    
    missing_scopes = [scope for scope in required_scopes if scope not in token_scopes]
    
    if missing_scopes:
        return False, f"Missing scopes: {', '.join(missing_scopes)}"
    
    return True, "All required scopes present"

def main():
    """Run token validation checks"""
    print("=" * 60)
    print("Google OAuth Token Validation")
    print("=" * 60)
    
    try:
        # Load credentials
        print("\n📂 Loading token.json...")
        creds = load_token()
        print("✅ Token loaded")
        
        # Validate token
        print("\n🔐 Validating token...")
        is_valid, updated_creds, message = validate_token(creds)
        
        if is_valid:
            print(f"✅ {message}")
            creds = updated_creds
        else:
            print(f"❌ {message}")
            print("\n⚠️  Run: python automations/google_auth_setup.py")
            return
        
        # Check scopes
        print("\n🔍 Checking scopes...")
        scopes_ok, scope_message = check_token_scopes(creds)
        
        if scopes_ok:
            print(f"✅ {scope_message}")
        else:
            print(f"⚠️  {scope_message}")
        
        print("\n" + "=" * 60)
        print("✅ Token validation complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == '__main__':
    main()
```

### Auto-Refresh Implementation

Create `automations/google_client.py`:

```python
"""
Google API Client with automatic token refresh
"""

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os

class GoogleAPIClient:
    """Base client for Google APIs with token management"""
    
    def __init__(self):
        self.creds = None
        self._load_and_validate_credentials()
    
    def _load_and_validate_credentials(self):
        """Load credentials and refresh if needed"""
        
        if not os.path.exists('token.json'):
            raise FileNotFoundError(
                "token.json not found. Run google_auth_setup.py first"
            )
        
        self.creds = Credentials.from_authorized_user_file('token.json')
        
        # Refresh if expired
        if not self.creds.valid:
            if self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
                
                # Save refreshed token
                with open('token.json', 'w') as token:
                    token.write(self.creds.to_json())
            else:
                raise Exception("Cannot refresh credentials")
    
    def get_drive_service(self):
        """Get authenticated Drive service"""
        return build('drive', 'v3', credentials=self.creds)
    
    def get_calendar_service(self):
        """Get authenticated Calendar service"""
        return build('calendar', 'v3', credentials=self.creds)

# Singleton instance
_client_instance = None

def get_client():
    """Get or create GoogleAPIClient singleton"""
    global _client_instance
    if _client_instance is None:
        _client_instance = GoogleAPIClient()
    return _client_instance
```

---

## File Operations

### List Files

```python
"""List files in Google Drive"""

from google_client import get_client

def list_drive_files(query=None, max_results=100):
    """
    List files in Google Drive
    
    Args:
        query (str): Search query (e.g., "name contains 'TaskBoard'")
        max_results (int): Maximum files to return
    
    Returns:
        list: File metadata dictionaries
    """
    
    client = get_client()
    service = client.get_drive_service()
    
    try:
        # Build request parameters
        params = {
            'pageSize': min(max_results, 1000),
            'fields': 'files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink)'
        }
        
        if query:
            params['q'] = query
        
        # Execute request
        results = service.files().list(**params).execute()
        files = results.get('files', [])
        
        return files
        
    except HttpError as error:
        print(f"❌ Error listing files: {error}")
        return []

# Usage examples
if __name__ == '__main__':
    # List all files
    all_files = list_drive_files()
    print(f"📁 Total files: {len(all_files)}")
    
    # Search for specific files
    taskboard_files = list_drive_files(query="name contains 'TaskBoard'")
    print(f"📋 TaskBoard files: {len(taskboard_files)}")
    
    # List recently modified files
    recent_query = "modifiedTime > '2025-10-20T00:00:00'"
    recent_files = list_drive_files(query=recent_query)
    print(f"🕒 Recently modified: {len(recent_files)}")
```

### Upload Files

```python
"""Upload files to Google Drive"""

from googleapiclient.http import MediaFileUpload
from google_client import get_client
import os

def upload_file(file_path, folder_id=None, mime_type=None):
    """
    Upload a file to Google Drive
    
    Args:
        file_path (str): Local file path
        folder_id (str): Parent folder ID (optional)
        mime_type (str): MIME type (auto-detected if None)
    
    Returns:
        dict: Uploaded file metadata
    """
    
    client = get_client()
    service = client.get_drive_service()
    
    # Get file name
    file_name = os.path.basename(file_path)
    
    # File metadata
    file_metadata = {'name': file_name}
    
    if folder_id:
        file_metadata['parents'] = [folder_id]
    
    # Auto-detect MIME type if not provided
    if mime_type is None:
        mime_type = 'application/octet-stream'
        
        # Common types
        ext = os.path.splitext(file_path)[1].lower()
        mime_types = {
            '.csv': 'text/csv',
            '.txt': 'text/plain',
            '.md': 'text/markdown',
            '.json': 'application/json',
            '.pdf': 'application/pdf',
            '.py': 'text/x-python'
        }
        mime_type = mime_types.get(ext, mime_type)
    
    # Create media upload
    media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
    
    try:
        # Upload file
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink'
        ).execute()
        
        print(f"✅ Uploaded: {file.get('name')}")
        print(f"🔗 Link: {file.get('webViewLink')}")
        
        return file
        
    except HttpError as error:
        print(f"❌ Upload failed: {error}")
        return None

def upload_taskboard():
    """Upload TaskBoard.csv to Drive"""
    
    if not os.path.exists('TaskBoard.csv'):
        print("❌ TaskBoard.csv not found")
        return None
    
    # Check if file already exists
    client = get_client()
    service = client.get_drive_service()
    
    query = "name = 'TaskBoard.csv' and trashed = false"
    results = service.files().list(q=query, fields='files(id)').execute()
    existing = results.get('files', [])
    
    if existing:
        # Update existing file
        file_id = existing[0]['id']
        media = MediaFileUpload('TaskBoard.csv', mimetype='text/csv')
        
        file = service.files().update(
            fileId=file_id,
            media_body=media,
            fields='id, name, modifiedTime'
        ).execute()
        
        print(f"✅ Updated TaskBoard.csv")
        return file
    else:
        # Upload new file
        return upload_file('TaskBoard.csv')

# Usage
if __name__ == '__main__':
    # Upload TaskBoard
    upload_taskboard()
    
    # Upload any file
    upload_file('logs/system_sync_report.md')
```

### Download Files

```python
"""Download files from Google Drive"""

from googleapiclient.http import MediaIoBaseDownload
from google_client import get_client
import io
import os

def download_file(file_id, destination_path):
    """
    Download a file from Google Drive
    
    Args:
        file_id (str): Google Drive file ID
        destination_path (str): Local save path
    
    Returns:
        bool: Success status
    """
    
    client = get_client()
    service = client.get_drive_service()
    
    try:
        # Request file content
        request = service.files().get_media(fileId=file_id)
        
        # Create file handle
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        
        # Download with progress
        done = False
        while not done:
            status, done = downloader.next_chunk()
            if status:
                print(f"📥 Download progress: {int(status.progress() * 100)}%")
        
        # Write to file
        with open(destination_path, 'wb') as f:
            f.write(fh.getvalue())
        
        print(f"✅ Downloaded to: {destination_path}")
        return True
        
    except HttpError as error:
        print(f"❌ Download failed: {error}")
        return False

def download_taskboard():
    """Download latest TaskBoard.csv from Drive"""
    
    client = get_client()
    service = client.get_drive_service()
    
    # Find TaskBoard.csv
    query = "name = 'TaskBoard.csv' and trashed = false"
    results = service.files().list(
        q=query,
        orderBy='modifiedTime desc',
        pageSize=1,
        fields='files(id, name, modifiedTime)'
    ).execute()
    
    files = results.get('files', [])
    
    if not files:
        print("❌ TaskBoard.csv not found in Drive")
        return False
    
    file = files[0]
    print(f"📋 Found TaskBoard.csv (modified: {file['modifiedTime']})")
    
    # Download to local
    return download_file(file['id'], 'TaskBoard.csv')

# Usage
if __name__ == '__main__':
    download_taskboard()
```

### Sync Files (Bidirectional)

```python
"""
Bidirectional file sync between local and Drive
"""

from google_client import get_client
import os
from datetime import datetime
import hashlib

def get_file_hash(file_path):
    """Calculate MD5 hash of local file"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def sync_file(local_path, drive_name=None):
    """
    Sync file between local and Drive
    Uploads if Drive version is older or missing
    Downloads if Drive version is newer
    
    Args:
        local_path (str): Local file path
        drive_name (str): Name in Drive (defaults to filename)
    
    Returns:
        str: 'uploaded', 'downloaded', 'synced', or 'error'
    """
    
    if drive_name is None:
        drive_name = os.path.basename(local_path)
    
    client = get_client()
    service = client.get_drive_service()
    
    # Check if file exists locally
    local_exists = os.path.exists(local_path)
    local_mtime = None
    if local_exists:
        local_mtime = datetime.fromtimestamp(os.path.getmtime(local_path))
    
    # Check if file exists in Drive
    query = f"name = '{drive_name}' and trashed = false"
    results = service.files().list(
        q=query,
        orderBy='modifiedTime desc',
        pageSize=1,
        fields='files(id, name, modifiedTime, md5Checksum)'
    ).execute()
    
    drive_files = results.get('files', [])
    drive_exists = len(drive_files) > 0
    
    # Scenario 1: Only local exists
    if local_exists and not drive_exists:
        print(f"📤 Uploading {drive_name} to Drive...")
        upload_file(local_path)
        return 'uploaded'
    
    # Scenario 2: Only Drive exists
    if not local_exists and drive_exists:
        print(f"📥 Downloading {drive_name} from Drive...")
        download_file(drive_files[0]['id'], local_path)
        return 'downloaded'
    
    # Scenario 3: Both exist - compare timestamps
    if local_exists and drive_exists:
        drive_file = drive_files[0]
        drive_mtime = datetime.fromisoformat(
            drive_file['modifiedTime'].replace('Z', '+00:00')
        ).replace(tzinfo=None)
        
        time_diff = (local_mtime - drive_mtime).total_seconds()
        
        if abs(time_diff) < 5:  # Within 5 seconds = synced
            print(f"✅ {drive_name} already synced")
            return 'synced'
        elif time_diff > 0:  # Local is newer
            print(f"📤 Uploading newer {drive_name}...")
            media = MediaFileUpload(local_path, resumable=True)
            service.files().update(
                fileId=drive_file['id'],
                media_body=media
            ).execute()
            return 'uploaded'
        else:  # Drive is newer
            print(f"📥 Downloading newer {drive_name}...")
            download_file(drive_file['id'], local_path)
            return 'downloaded'
    
    return 'error'

def sync_all_project_files():
    """Sync all important project files"""
    
    files_to_sync = [
        'TaskBoard.csv',
        'RolesAndProtocols.md',
        'logs/system_sync_report.md',
        'config.env.template'
    ]
    
    results = {}
    for file_path in files_to_sync:
        if os.path.exists(file_path) or True:  # Try sync even if not local
            result = sync_file(file_path)
            results[file_path] = result
    
    print("\n📊 Sync Summary:")
    for file, result in results.items():
        icon = {'uploaded': '📤', 'downloaded': '📥', 'synced': '✅', 'error': '❌'}
        print(f"{icon.get(result, '❓')} {file}: {result}")

# Usage
if __name__ == '__main__':
    sync_all_project_files()
```

---

## Calendar Operations

### List Events

```python
"""List calendar events"""

from google_client import get_client
from datetime import datetime, timedelta

def list_calendar_events(days_ahead=30, max_results=50):
    """
    List upcoming calendar events
    
    Args:
        days_ahead (int): Number of days to look ahead
        max_results (int): Maximum events to return
    
    Returns:
        list: Event dictionaries
    """
    
    client = get_client()
    service = client.get_calendar_service()
    
    # Calculate time range
    now = datetime.utcnow().isoformat() + 'Z'
    end_date = (datetime.utcnow() + timedelta(days=days_ahead)).isoformat() + 'Z'
    
    try:
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            timeMax=end_date,
            maxResults=max_results,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        return events
        
    except HttpError as error:
        print(f"❌ Error listing events: {error}")
        return []

# Usage
if __name__ == '__main__':
    events = list_calendar_events(days_ahead=7)
    
    print(f"📅 Upcoming events ({len(events)}):\n")
    
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        summary = event.get('summary', 'No title')
        print(f"• {start}: {summary}")
```

### Create Events

```python
"""Create calendar events from tasks"""

from google_client import get_client
from datetime import datetime, timedelta

def create_event(summary, start_time, end_time, description=None, attendees=None):
    """
    Create a calendar event
    
    Args:
        summary (str): Event title
        start_time (datetime): Start time
        end_time (datetime): End time
        description (str): Event description
        attendees (list): List of email addresses
    
    Returns:
        dict: Created event
    """
    
    client = get_client()
    service = client.get_calendar_service()
    
    event = {
        'summary': summary,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': 'America/Moncton',
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': 'America/Moncton',
        },
    }
    
    if description:
        event['description'] = description
    
    if attendees:
        event['attendees'] = [{'email': email} for email in attendees]
    
    try:
        event = service.events().insert(calendarId='primary', body=event).execute()
        print(f"✅ Event created: {event.get('htmlLink')}")
        return event
    except HttpError as error:
        print(f"❌ Event creation failed: {error}")
        return None

def create_task_deadline_event(task_id, task_name, deadline_date):
    """Create calendar event for task deadline"""
    
    # Parse deadline
    deadline = datetime.strptime(deadline_date, '%Y-%m-%d')
    
    # Create all-day event
    event = {
        'summary': f'🚨 DEADLINE: {task_name}',
        'start': {'date': deadline.strftime('%Y-%m-%d')},
        'end': {'date': deadline.strftime('%Y-%m-%d')},
        'description': f'Task ID: {task_id}\nTask: {task_name}\n\nCheck TaskBoard.csv for details.',
        'colorId': '11'  # Red color for urgency
    }
    
    client = get_client()
    service = client.get_calendar_service()
    
    try:
        event = service.events().insert(calendarId='primary', body=event).execute()
        print(f"✅ Deadline event created for {task_name}")
        return event
    except HttpError as error:
        print(f"❌ Failed to create deadline event: {error}")
        return None

# Usage
if __name__ == '__main__':
    # Create task deadline
    create_task_deadline_event(
        task_id='T002',
        task_name='Google Drive API Integration',
        deadline_date='2025-10-26'
    )
    
    # Create meeting
    meeting_start = datetime.now() + timedelta(days=1, hours=10)
    meeting_end = meeting_start + timedelta(hours=1)
    
    create_event(
        summary='AI Mastermind Team Sync',
        start_time=meeting_start,
        end_time=meeting_end,
        description='Review progress on T002-T008',
        attendees=['valentine@ai-mastermind.team']
    )
```

---

## Rate Limiting

### Understanding Limits

Google Drive and Calendar APIs have these quotas:

| Operation | Limit |
|-----------|-------|
| Queries per day | 1,000,000,000 |
| Queries per 100 seconds | 1,000 |
| Queries per 100 seconds per user | 100 |

**Note**: These are default free tier limits. Actual limits may vary.

### Rate Limit Handler

```python
"""Handle rate limiting with exponential backoff"""

import time
from googleapiclient.errors import HttpError
import random

def execute_with_backoff(request_func, max_retries=5):
    """
    Execute API request with exponential backoff
    
    Args:
        request_func (callable): Function that makes API request
        max_retries (int): Maximum retry attempts
    
    Returns:
        API response or None if all retries failed
    """
    
    for retry in range(max_retries):
        try:
            return request_func()
        
        except HttpError as error:
            # Check if it's a rate limit error (429 or 403)
            if error.resp.status in [429, 403]:
                # Calculate backoff time
                wait_time = (2 ** retry) + random.uniform(0, 1)
                
                print(f"⏳ Rate limited. Waiting {wait_time:.1f}s (attempt {retry + 1}/{max_retries})...")
                time.sleep(wait_time)
                
                if retry == max_retries - 1:
                    print(f"❌ Max retries reached")
                    raise
            else:
                # Not a rate limit error, re-raise
                raise
    
    return None

# Usage example
def list_files_with_backoff():
    """List files with automatic retry"""
    
    client = get_client()
    service = client.get_drive_service()
    
    def make_request():
        return service.files().list(pageSize=100).execute()
    
    result = execute_with_backoff(make_request)
    return result.get('files', [])
```

### Batch Requests

```python
"""Batch multiple API requests to reduce quota usage"""

from googleapiclient.http import BatchHttpRequest
from google_client import get_client

def batch_upload_files(file_paths):
    """Upload multiple files in a single batch request"""
    
    client = get_client()
    service = client.get_drive_service()
    
    def callback(request_id, response, exception):
        if exception:
            print(f"❌ Upload failed for {request_id}: {exception}")
        else:
            print(f"✅ Uploaded: {response['name']}")
    
    batch = service.new_batch_http_request(callback=callback)
    
    for file_path in file_paths:
        file_metadata = {'name': os.path.basename(file_path)}
        media = MediaFileUpload(file_path, resumable=True)
        
        request = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name'
        )
        
        batch.add(request, request_id=file_path)
    
    # Execute all requests at once
    batch.execute()

# Usage
if __name__ == '__main__':
    files_to_upload = [
        'TaskBoard.csv',
        'logs/system_sync_report.md',
        'docs/API_INTEGRATION.md'
    ]
    
    batch_upload_files(files_to_upload)
```

---

## Error Handling

### Comprehensive Error Handler

```python
"""Robust error handling for Google APIs"""

from googleapiclient.errors import HttpError
import logging

# Configure logging
logging.basicConfig(
    filename='logs/google_api_errors.log',
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def handle_google_api_error(error, operation="API operation"):
    """
    Handle Google API errors with detailed logging
    
    Args:
        error (HttpError): The error object
        operation (str): Description of operation that failed
    """
    
    error_details = {
        400: "Bad Request - Check request parameters",
        401: "Unauthorized - Token may be expired",
        403: "Forbidden - Check permissions or rate limits",
        404: "Not Found - File or resource doesn't exist",
        429: "Too Many Requests - Rate limit exceeded",
        500: "Internal Server Error - Google's issue, retry later",
        503: "Service Unavailable - Temporary outage"
    }
    
    status = error.resp.status
    message = error_details.get(status, "Unknown error")
    
    error_msg = f"{operation} failed: {status} - {message}"
    
    # Log the error
    logging.error(error_msg)
    logging.error(f"Details: {error}")
    
    # Print user-friendly message
    print(f"❌ {error_msg}")
    
    # Specific handling
    if status == 401:
        print("💡 Try running: python automations/validate_google_token.py")
    elif status == 403:
        print("💡 Check API permissions in Google Cloud Console")
    elif status == 429:
        print("💡 Rate limited. Wait a few minutes before retrying")
    
    return status

# Usage wrapper
def safe_api_call(func, *args, **kwargs):
    """Wrap API calls with error handling"""
    try:
        return func(*args, **kwargs)
    except HttpError as error:
        handle_google_api_error(error, operation=func.__name__)
        return None
    except Exception as error:
        logging.error(f"Unexpected error in {func.__name__}: {error}")
        print(f"❌ Unexpected error: {error}")
        return None
```

---

## Best Practices

### 1. Optimize Query Performance

```python
"""Use field selection to reduce response size"""

# ❌ Don't do this (returns all fields)
files = service.files().list().execute()

# ✅ Do this (returns only needed fields)
files = service.files().list(
    fields='files(id, name, modifiedTime)',
    pageSize=100
).execute()
```

### 2. Use Partial Responses

```python
"""Request only needed data"""

# Get only file name and size
file = service.files().get(
    fileId=file_id,
    fields='name, size'
).execute()
```

### 3. Cache Frequently Accessed Data

```python
"""Cache file listings to reduce API calls"""

import json
from datetime import datetime, timedelta

class DriveCache:
    def __init__(self, cache_duration_minutes=15):
        self.cache = {}
        self.cache_duration = timedelta(minutes=cache_duration_minutes)
    
    def get_files(self, query=None):
        """Get files with caching"""
        
        cache_key = query or 'all_files'
        
        # Check cache
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_duration:
                print("📦 Returning cached data")
                return cached_data
        
        # Fetch from API
        print("🌐 Fetching from API")
        files = list_drive_files(query=query)
        
        # Update cache
        self.cache[cache_key] = (files, datetime.now())
        
        return files

# Global cache instance
drive_cache = DriveCache()
```

### 4. Monitor API Usage

```python
"""Track API quota usage"""

import json
from datetime import datetime

class APIUsageTracker:
    def __init__(self):
        self.usage_file = 'logs/api_usage.json'
        self.load_usage()
    
    def load_usage(self):
        try:
            with open(self.usage_file, 'r') as f:
                self.usage = json.load(f)
        except FileNotFoundError:
            self.usage = {'daily_calls': 0, 'last_reset': datetime.now().isoformat()}
    
    def record_call(self, api_name='google'):
        """Record an API call"""
        
        # Reset counter if new day
        last_reset = datetime.fromisoformat(self.usage['last_reset'])
        if (datetime.now() - last_reset).days >= 1:
            self.usage['daily_calls'] = 0
            self.usage['last_reset'] = datetime.now().isoformat()
        
        self.usage['daily_calls'] += 1
        
        # Save
        with open
    