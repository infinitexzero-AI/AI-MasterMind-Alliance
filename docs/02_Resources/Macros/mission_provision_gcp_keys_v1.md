---
workflow_name: mission_provision_gcp_keys_v1
version: v1
created: 2025-12-16
author: Comet/System
parent_version: null
changelog: |
  - Initial creation for GCP Console automation
---

# Macro: GCP Credential Provisioning

## Objective

Enable Sheets/Drive APIs and create a Service Account key for AILCC.

## Prerequisites

- Tools required: `browser`
- Data inputs: Google Account (Logged In)
- Environment: GCP Console

## Execution Steps

### Step 1: Enable Sheets API

**Tool**: `browser`
**Action**: Go to `https://console.cloud.google.com/apis/library/sheets.googleapis.com`. Click "ENABLE" if not enabled.
**Output**: API Enabled.
**Stop condition**: Login Wall / Error.

### Step 2: Enable Drive API

**Tool**: `browser`
**Action**: Go to `https://console.cloud.google.com/apis/library/drive.googleapis.com`. Click "ENABLE" if not enabled.
**Output**: API Enabled.

### Step 3: Create Service Account

**Tool**: `browser`
**Action**: Navigate to `https://console.cloud.google.com/iam-admin/serviceaccounts/create`.
**Input**: Name: "AILCC Publisher". Role: "Editor".
**Output**: Account Created.

### Step 4: Generate Key

**Tool**: `browser`
**Action**: Select new account -> Keys -> Add Key -> Create new key -> JSON.
**Output**: File downloaded to default directory.

### Step 5: Relocate Key (Terminal)

**Tool**: `terminal`
**Action**: Find the most recent JSON in Downloads and move to `~/.aimma/google_credentials.json`.
**Output**: Key ready.

## Success Criteria

- [ ] Sheets/Drive APIs enabled
- [ ] `google_credentials.json` exists in `~/.aimma/`

## Safety Checks

- Verify URL is strict `console.cloud.google.com`
- Do not expose key contents in logs
