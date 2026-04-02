# Microsoft Graph API Setup Guide

Complete guide for integrating Microsoft Graph API with OAuth 2.0 authentication for the AI Mastermind Team project.

## Overview

Microsoft Graph API provides unified access to Microsoft 365 services including:
- **OneDrive**: File storage and synchronization
- **Outlook**: Email and calendar management
- **Teams**: Collaboration and messaging
- **User Profile**: Identity and directory information

This guide uses **OAuth 2.0 Client Credentials Flow** for app-only authentication, ideal for automated agent operations.

---

## Prerequisites

- **Azure account** (free tier acceptable)
- **Admin access** to Azure Active Directory (for consent)
- **Python 3.8+** with pip
- **MSAL library**: `pip install msal requests`

---

## Step 1: Azure AD App Registration

### 1.1 Access Azure Portal

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Search for **Azure Active Directory** in the search bar
4. Click on **Azure Active Directory**

### 1.2 Register New Application

1. In the left sidebar, select **App registrations**
2. Click **+ New registration**
3. Configure the application:

   ```
   Name: AI-Mastermind-Team-Graph
   Supported account types: 
     ☑ Accounts in any organizational directory and personal Microsoft accounts
   Redirect URI: 
     Platform: Web
     URI: http://localhost:8080/callback
   ```

4. Click **Register**

### 1.3 Record Application Identifiers

After registration, copy these values from the **Overview** page:

```bash
Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID: yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
```

**Save these immediately** - you'll need them for authentication.

---

## Step 2: Create Client Secret

### 2.1 Generate Secret

1. In your app, navigate to **Certificates & secrets** (left sidebar)
2. Click **+ New client secret**
3. Configuration:
   ```
   Description: AI-Mastermind-Production-Key
   Expires: 24 months (recommended for production)
   ```
4. Click **Add**

### 2.2 Copy Secret Value

**CRITICAL**: The secret value is shown **only once**. Copy it immediately:

```bash
Secret Value: abc123~XyZ789.SomeRandomString_Generated
Secret ID: zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz
```

Store this securely in your `config.env` file.

---

## Step 3: Configure API Permissions

### 3.1 Add Required Permissions

Based on Perplexity's research, these permissions are required:

1. In your app, go to **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions** (not Delegated)

Add these permissions:

| Permission | Purpose | Required For |
|------------|---------|--------------|
| `User.Read.All` | Read user profiles | Agent identification |
| `Mail.Read` | Access email | Outlook integration |
| `Mail.ReadWrite` | Send/modify emails | Email automation |
| `Calendars.ReadWrite` | Calendar management | Event scheduling |
| `Files.ReadWrite.All` | OneDrive file access | File synchronization |
| `Sites.ReadWrite.All` | SharePoint access | Team collaboration |

### 3.2 Permission Configuration Steps

For each permission:

1. Click **Add a permission**
2. Select **Microsoft Graph**
3. Choose **Application permissions**
4. Search for the permission (e.g., "User.Read.All")
5. Check the box next to the permission
6. Click **Add permissions**

### 3.3 Grant Admin Consent

**CRITICAL STEP**: Application permissions require admin consent.

1. After adding all permissions, click **Grant admin consent for [Your Organization]**
2. Confirm the consent dialog
3. Verify all permissions show **"Granted for [Your Organization]"** with a green checkmark

**If you don't have admin rights:**
- Request consent from your Azure AD administrator
- Or use a personal Microsoft account where you are the admin

---

## Step 4: Configure Environment Variables

### 4.1 Update config.env

Add these values to `~/AI-Mastermind-Core/config.env`:

```bash
# Microsoft Graph API Configuration
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=abc123~XyZ789.SomeRandomString_Generated
MICROSOFT_TENANT_ID=yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy

# Optional: Specific user for delegated access
MICROSOFT_USER_EMAIL=your_email@outlook.com
```

### 4.2 Verify Configuration

Create a test script `automations/verify_microsoft_config.py`:

```python
import os
from dotenv import load_dotenv

load_dotenv('config.env')

required_vars = [
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    'MICROSOFT_TENANT_ID'
]

print("🔍 Verifying Microsoft Graph Configuration...\n")

all_present = True
for var in required_vars:
    value = os.getenv(var)
    if value:
        masked = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
        print(f"✅ {var}: {masked}")
    else:
        print(f"❌ {var}: NOT SET")
        all_present = False

if all_present:
    print("\n✅ Configuration complete!")
else:
    print("\n❌ Missing required variables. Check config.env")
```

Run: `python automations/verify_microsoft_config.py`

---

## Step 5: Python Authentication Implementation

### 5.1 Install Dependencies

```bash
pip install msal requests python-dotenv
```

Create `requirements.txt` entry:
```
msal==1.26.0
requests==2.31.0
python-dotenv==1.0.0
```

### 5.2 Authentication Module

Create `automations/microsoft_auth.py`:

```python
"""
Microsoft Graph API Authentication Module
OAuth 2.0 Client Credentials Flow for App-Only Access
"""

import msal
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json

# Load environment variables
load_dotenv('config.env')

class MicrosoftGraphAuth:
    """Handles Microsoft Graph API authentication and token management"""
    
    def __init__(self):
        self.client_id = os.getenv('MICROSOFT_CLIENT_ID')
        self.client_secret = os.getenv('MICROSOFT_CLIENT_SECRET')
        self.tenant_id = os.getenv('MICROSOFT_TENANT_ID')
        
        # Validate configuration
        if not all([self.client_id, self.client_secret, self.tenant_id]):
            raise ValueError("Missing Microsoft Graph credentials in config.env")
        
        # Authority URL for OAuth 2.0
        self.authority = f'https://login.microsoftonline.com/{self.tenant_id}'
        
        # Scopes for application permissions
        self.scopes = ['https://graph.microsoft.com/.default']
        
        # Token cache
        self.token_cache = None
        self.token_expiry = None
        
        # Initialize MSAL Confidential Client
        self.app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )
    
    def get_access_token(self, force_refresh=False):
        """
        Acquire access token using client credentials flow
        
        Args:
            force_refresh (bool): Force token refresh even if cached token is valid
            
        Returns:
            str: Access token for Microsoft Graph API
        """
        
        # Return cached token if still valid
        if not force_refresh and self.token_cache and self.token_expiry:
            if datetime.now() < self.token_expiry:
                return self.token_cache
        
        # Acquire new token
        result = self.app.acquire_token_for_client(scopes=self.scopes)
        
        if 'access_token' in result:
            self.token_cache = result['access_token']
            
            # Set expiry time (typically 1 hour, refresh 5 min early)
            expires_in = result.get('expires_in', 3600)
            self.token_expiry = datetime.now() + timedelta(seconds=expires_in - 300)
            
            return self.token_cache
        else:
            # Handle errors
            error = result.get('error', 'Unknown error')
            error_description = result.get('error_description', 'No description')
            raise Exception(f"Authentication failed: {error} - {error_description}")
    
    def test_connection(self):
        """
        Test Microsoft Graph API connection
        
        Returns:
            dict: Connection status and user info
        """
        try:
            token = self.get_access_token()
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            # Test with a simple API call
            response = requests.get(
                'https://graph.microsoft.com/v1.0/users',
                headers=headers,
                params={'$top': 1}  # Just get one user to test
            )
            
            if response.status_code == 200:
                return {
                    'status': 'success',
                    'message': 'Connected to Microsoft Graph API',
                    'api_version': 'v1.0'
                }
            else:
                return {
                    'status': 'error',
                    'code': response.status_code,
                    'message': response.text
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }

# Convenience function for quick access
def get_graph_token():
    """Quick access to Microsoft Graph token"""
    auth = MicrosoftGraphAuth()
    return auth.get_access_token()

if __name__ == '__main__':
    """Test authentication when run directly"""
    print("🔐 Testing Microsoft Graph Authentication...\n")
    
    try:
        auth = MicrosoftGraphAuth()
        result = auth.test_connection()
        
        if result['status'] == 'success':
            print(f"✅ {result['message']}")
            print(f"📡 API Version: {result['api_version']}")
        else:
            print(f"❌ Connection failed: {result['message']}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
```

### 5.3 Graph API Client

Create `automations/microsoft_graph_client.py`:

```python
"""
Microsoft Graph API Client
Provides methods for common operations
"""

import requests
from microsoft_auth import MicrosoftGraphAuth
import json

class GraphAPIClient:
    """Client for Microsoft Graph API operations"""
    
    def __init__(self):
        self.auth = MicrosoftGraphAuth()
        self.base_url = 'https://graph.microsoft.com/v1.0'
    
    def _get_headers(self):
        """Generate authorization headers"""
        token = self.auth.get_access_token()
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, method, endpoint, data=None, params=None):
        """
        Make HTTP request to Graph API
        
        Args:
            method (str): HTTP method (GET, POST, PUT, DELETE)
            endpoint (str): API endpoint (e.g., '/me/drive/root/children')
            data (dict): Request body for POST/PUT
            params (dict): Query parameters
            
        Returns:
            dict: API response
        """
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=data,
            params=params
        )
        
        if response.status_code in [200, 201, 204]:
            return response.json() if response.content else {'status': 'success'}
        else:
            raise Exception(f"API Error {response.status_code}: {response.text}")
    
    # ===== USER OPERATIONS =====
    
    def get_user_profile(self, user_id='me'):
        """Get user profile information"""
        return self._make_request('GET', f'/users/{user_id}')
    
    def list_users(self, top=10):
        """List users in the organization"""
        return self._make_request('GET', '/users', params={'$top': top})
    
    # ===== EMAIL OPERATIONS =====
    
    def list_messages(self, user_id='me', folder='inbox', top=25):
        """List email messages"""
        endpoint = f'/users/{user_id}/mailFolders/{folder}/messages'
        return self._make_request('GET', endpoint, params={'$top': top})
    
    def send_email(self, to_address, subject, body, user_id='me'):
        """
        Send an email
        
        Args:
            to_address (str): Recipient email
            subject (str): Email subject
            body (str): Email body (HTML or plain text)
            user_id (str): Sender user ID (default: 'me')
        """
        message = {
            'message': {
                'subject': subject,
                'body': {
                    'contentType': 'HTML',
                    'content': body
                },
                'toRecipients': [
                    {
                        'emailAddress': {
                            'address': to_address
                        }
                    }
                ]
            }
        }
        
        return self._make_request('POST', f'/users/{user_id}/sendMail', data=message)
    
    # ===== CALENDAR OPERATIONS =====
    
    def list_events(self, user_id='me', top=10):
        """List calendar events"""
        return self._make_request('GET', f'/users/{user_id}/events', params={'$top': top})
    
    def create_event(self, subject, start_time, end_time, attendees=None, user_id='me'):
        """
        Create a calendar event
        
        Args:
            subject (str): Event subject
            start_time (str): ISO 8601 format (e.g., '2025-10-25T10:00:00')
            end_time (str): ISO 8601 format
            attendees (list): List of email addresses
            user_id (str): Calendar owner
        """
        event = {
            'subject': subject,
            'start': {
                'dateTime': start_time,
                'timeZone': 'UTC'
            },
            'end': {
                'dateTime': end_time,
                'timeZone': 'UTC'
            }
        }
        
        if attendees:
            event['attendees'] = [
                {'emailAddress': {'address': email}, 'type': 'required'}
                for email in attendees
            ]
        
        return self._make_request('POST', f'/users/{user_id}/events', data=event)
    
    # ===== ONEDRIVE OPERATIONS =====
    
    def list_drive_items(self, user_id='me', folder_path='root'):
        """List files in OneDrive"""
        endpoint = f'/users/{user_id}/drive/{folder_path}/children'
        return self._make_request('GET', endpoint)
    
    def upload_file(self, file_path, file_name, user_id='me', folder='root'):
        """
        Upload a file to OneDrive
        
        Args:
            file_path (str): Local file path
            file_name (str): Name for file in OneDrive
            user_id (str): User ID
            folder (str): Destination folder
        """
        with open(file_path, 'rb') as f:
            content = f.read()
        
        url = f"{self.base_url}/users/{user_id}/drive/{folder}:/{file_name}:/content"
        headers = self._get_headers()
        headers['Content-Type'] = 'application/octet-stream'
        
        response = requests.put(url, headers=headers, data=content)
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            raise Exception(f"Upload failed: {response.status_code} - {response.text}")
    
    def download_file(self, item_id, destination_path, user_id='me'):
        """Download a file from OneDrive"""
        endpoint = f'/users/{user_id}/drive/items/{item_id}/content'
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            with open(destination_path, 'wb') as f:
                f.write(response.content)
            return {'status': 'success', 'path': destination_path}
        else:
            raise Exception(f"Download failed: {response.status_code}")

# Usage example
if __name__ == '__main__':
    print("📊 Testing Microsoft Graph API Client...\n")
    
    try:
        client = GraphAPIClient()
        
        # Test user profile
        print("👤 Fetching user profile...")
        profile = client.get_user_profile()
        print(f"✅ User: {profile.get('displayName', 'N/A')}")
        
        # Test calendar
        print("\n📅 Fetching calendar events...")
        events = client.list_events(top=5)
        print(f"✅ Found {len(events.get('value', []))} events")
        
        # Test OneDrive
        print("\n📁 Fetching OneDrive files...")
        files = client.list_drive_items()
        print(f"✅ Found {len(files.get('value', []))} files")
        
        print("\n🎉 All operations successful!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
```

---

## Step 6: Error Handling & Troubleshooting

### 6.1 Common Errors

#### Error: `AADSTS700016` - Application not found

**Cause**: Incorrect client ID or application deleted

**Solution**:
```bash
# Verify client ID in config.env
echo $MICROSOFT_CLIENT_ID

# Check Azure Portal > App registrations
# Ensure application exists and ID matches
```

#### Error: `AADSTS7000215` - Invalid client secret

**Cause**: Wrong secret value or secret expired

**Solution**:
```python
# Generate new secret in Azure Portal
# Update config.env with new value
# Restart application
```

#### Error: `Insufficient privileges` (403)

**Cause**: Missing admin consent or insufficient permissions

**Solution**:
```bash
# 1. Verify permissions in Azure Portal
# 2. Grant admin consent
# 3. Wait 5-10 minutes for propagation
# 4. Clear token cache and retry
```

#### Error: `InvalidAuthenticationToken` (401)

**Cause**: Token expired or invalid

**Solution**:
```python
# Force token refresh
auth = MicrosoftGraphAuth()
token = auth.get_access_token(force_refresh=True)
```

### 6.2 Debugging Script

Create `automations/debug_microsoft_graph.py`:

```python
"""Debug Microsoft Graph API issues"""

import os
from dotenv import load_dotenv
from microsoft_auth import MicrosoftGraphAuth
import requests

load_dotenv('config.env')

def check_environment():
    """Verify environment variables"""
    print("🔍 Checking environment variables...\n")
    
    vars_to_check = {
        'MICROSOFT_CLIENT_ID': 'Client ID',
        'MICROSOFT_CLIENT_SECRET': 'Client Secret',
        'MICROSOFT_TENANT_ID': 'Tenant ID'
    }
    
    issues = []
    for var, name in vars_to_check.items():
        value = os.getenv(var)
        if value:
            print(f"✅ {name}: Set")
        else:
            print(f"❌ {name}: NOT SET")
            issues.append(name)
    
    return len(issues) == 0

def test_authentication():
    """Test OAuth 2.0 authentication"""
    print("\n🔐 Testing authentication...\n")
    
    try:
        auth = MicrosoftGraphAuth()
        token = auth.get_access_token()
        print(f"✅ Token acquired: {token[:20]}...")
        return True
    except Exception as e:
        print(f"❌ Authentication failed: {str(e)}")
        return False

def test_api_call():
    """Test actual API call"""
    print("\n📡 Testing API call...\n")
    
    try:
        auth = MicrosoftGraphAuth()
        token = auth.get_access_token()
        
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(
            'https://graph.microsoft.com/v1.0/users',
            headers=headers,
            params={'$top': 1}
        )
        
        if response.status_code == 200:
            print(f"✅ API call successful")
            return True
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API call error: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("Microsoft Graph API Diagnostics")
    print("=" * 60)
    
    env_ok = check_environment()
    auth_ok = test_authentication() if env_ok else False
    api_ok = test_api_call() if auth_ok else False
    
    print("\n" + "=" * 60)
    print("Diagnostic Summary")
    print("=" * 60)
    print(f"Environment: {'✅ OK' if env_ok else '❌ FAILED'}")
    print(f"Authentication: {'✅ OK' if auth_ok else '❌ FAILED'}")
    print(f"API Access: {'✅ OK' if api_ok else '❌ FAILED'}")
    
    if all([env_ok, auth_ok, api_ok]):
        print("\n🎉 All systems operational!")
    else:
        print("\n⚠️  Issues detected. Review errors above.")

if __name__ == '__main__':
    main()
```

### 6.3 Rate Limiting

Microsoft Graph API has the following limits:

| Resource | Limit |
|----------|-------|
| Most APIs | 10,000 requests per 10 minutes |
| Mail send | 30 messages per minute |
| Large files | 4 MB per request |

**Handling rate limits:**

```python
import time
from requests.exceptions import HTTPError

def make_request_with_retry(func, max_retries=3):
    """Retry logic with exponential backoff"""
    for attempt in range(max_retries):
        try:
            return func()
        except HTTPError as e:
            if e.response.status_code == 429:  # Too Many Requests
                retry_after = int(e.response.headers.get('Retry-After', 60))
                print(f"⏳ Rate limited. Waiting {retry_after}s...")
                time.sleep(retry_after)
            else:
                raise
    raise Exception("Max retries exceeded")
```

---

## Step 7: Integration with AI Mastermind System

### 7.1 Task Automation Example

```python
"""
Automated workflow: Check Outlook for task assignments
"""

from microsoft_graph_client import GraphAPIClient
import csv

def sync_outlook_to_taskboard():
    """Sync Outlook tasks to TaskBoard.csv"""
    
    client = GraphAPIClient()
    
    # Get emails with subject containing "TASK:"
    messages = client.list_messages(top=50)
    
    new_tasks = []
    for msg in messages.get('value', []):
        subject = msg.get('subject', '')
        if 'TASK:' in subject:
            # Parse task from email
            task_name = subject.replace('TASK:', '').strip()
            body = msg.get('body', {}).get('content', '')
            
            # Extract assigned agent from body
            # Add to task list
            new_tasks.append({
                'TaskID': f"T{len(new_tasks) + 100}",
                'TaskName': task_name,
                'AssignedTo': 'SuperGrok',  # Parse from email
                'Status': 'Not Started',
                'Priority': 'Medium'
            })
    
    # Append to TaskBoard.csv
    if new_tasks:
        with open('TaskBoard.csv', 'a', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=new_tasks[0].keys())
            writer.writerows(new_tasks)
        
        print(f"✅ Added {len(new_tasks)} tasks to TaskBoard")
```

### 7.2 File Sync Example

```python
"""Sync files between Google Drive and OneDrive"""

def sync_taskboard_to_onedrive():
    """Upload TaskBoard.csv to OneDrive"""
    
    client = GraphAPIClient()
    
    result = client.upload_file(
        file_path='TaskBoard.csv',
        file_name='TaskBoard.csv',
        folder='root/AI-Mastermind-Team'
    )
    
    print(f"✅ TaskBoard synced to OneDrive")
    return result
```

---

## Step 8: Testing & Validation

### 8.1 Comprehensive Test Suite

Run: `python automations/debug_microsoft_graph.py`

Expected output:
```
============================================================
Microsoft Graph API Diagnostics
============================================================
🔍 Checking environment variables...

✅ Client ID: Set
✅ Client Secret: Set
✅ Tenant ID: Set

🔐 Testing authentication...

✅ Token acquired: eyJ0eXAiOiJKV1QiLC...

📡 Testing API call...

✅ API call successful

============================================================
Diagnostic Summary
============================================================
Environment: ✅ OK
Authentication: ✅ OK
API Access: ✅ OK

🎉 All systems operational!
```

### 8.2 Integration Test

```python
"""Full integration test"""

def run_integration_test():
    client = GraphAPIClient()
    
    tests = {
        'User Profile': lambda: client.get_user_profile(),
        'Calendar Events': lambda: client.list_events(top=1),
        'OneDrive Files': lambda: client.list_drive_items(),
        'Email Messages': lambda: client.list_messages(top=1)
    }
    
    results = {}
    for test_name, test_func in tests.items():
        try:
            test_func()
            results[test_name] = '✅ PASS'
        except Exception as e:
            results[test_name] = f'❌ FAIL: {str(e)}'
    
    print("\n📊 Integration Test Results:")
    for test, result in results.items():
        print(f"{test}: {result}")
```

---

## Best Practices

### Security
- ✅ Store credentials in `config.env`, never in code
- ✅ Add `config.env` to `.gitignore`
- ✅ Rotate client secrets every 12-24 months
- ✅ Use application permissions (not delegated) for automation
- ✅ Enable logging for audit trail

### Performance
- ✅ Cache tokens (valid for ~1 hour)
- ✅ Use batch requests for multiple operations
- ✅ Implement exponential backoff for rate limits
- ✅ Filter API responses with `$select` and `$filter`

### Reliability
- ✅ Handle transient errors with retries
- ✅ Log all API calls to `logs/microsoft_graph.log`
- ✅ Monitor token expiration
- ✅ Set up health checks

---

## Next Steps

After completing this setup:

1. ✅ **Verify** all tests pass
2. 📝 **Document** any organization-specific configurations
3. 🔄 **Integrate** with Valentine's TaskBoard sync
4. 🤖 **Enable** SuperGrok automation scripts
5. 📊 **Monitor** API usage and costs

---

## Support Resources

- **Microsoft Graph Documentation**: https://learn.microsoft.com/en-us/graph/
- **MSAL Python Docs**: https://msal-python.readthedocs.io/
- **Azure AD Admin Portal**: https://aad.portal.azure.com/
- **API Explorer**: https://developer.microsoft.com/en-us/graph/graph-explorer

---

**Created by**: Claude Desktop (Documentation Specialist)  
**Task**: T006 - Microsoft Graph API Integration  
**Date**: October 24, 2025  
**Status**: Complete - Ready for SuperGrok implementation  
**Integration Point**: Coordinates with T002 (Google Drive) via Valentine's sync automation