#!/usr/bin/env python3
import os
import shutil
import subprocess
import datetime
import argparse
import json
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
DEST_BASE = "/Volumes/XDriveAlpha/Life_Database"
TIMELINE_DIR = os.path.join(DEST_BASE, "01_Timeline")
INBOX_DIR = os.path.join(DEST_BASE, "00_Inbox")

def get_file_metadata(filepath):
    """
    Use 'mdls' to get metadata on macOS.
    Returns a dict of relevant keys.
    """
    try:
        # Get Content Creation Date and Pixel dimensions
        cmd = ["mdls", "-name", "kMDItemContentCreationDate", "-name", "kMDItemPixelHeight", "-name", "kMDItemPixelWidth", "-name", "kMDItemKind", filepath]
        result = subprocess.run(cmd, capture_output=True, text=True)
        output = result.stdout.strip()
        
        metadata = {}
        for line in output.split('\n'):
            if "=" in line:
                key, val = line.split('=', 1)
                key = key.strip()
                val = val.strip().strip('"').strip('(').strip(')')
                metadata[key] = val
        return metadata
    except Exception as e:
        logger.error(f"Error reading metadata for {filepath}: {e}")
        return {}

def parse_date(date_str):
    """
    Parse mdls date format: 2023-10-27 10:20:30 +0000
    Returns datetime object or None
    """
    if not date_str or date_str == "(null)":
        return None
    try:
        # Remove timezone for simplicity or handle it. 
        # mdls usually returns UTC
        clean_date = date_str.split(' +')[0]
        return datetime.datetime.strptime(clean_date, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None

def determine_destination(filepath, metadata):
    """
    Decide where the file goes based on heuristics.
    Returns (destination_folder, new_filename)
    """
    filename = os.path.basename(filepath)
    ext = os.path.splitext(filename)[1].lower()
    
    # Date extraction
    date_obj = parse_date(metadata.get('kMDItemContentCreationDate'))
    if not date_obj:
        # Fallback to filesystem mtime
        timestamp = os.path.getmtime(filepath)
        date_obj = datetime.datetime.fromtimestamp(timestamp)

    year = date_obj.strftime("%Y")
    month = date_obj.strftime("%m")
    
    # Source Heuristics
    kind = metadata.get('kMDItemKind', '').lower()
    
    # Screenshot?
    if "Screen Shot" in filename or "Screenshot" in filename:
        subfolder = "Screenshots"
    # iPhone Photo? (Loose heuristic: HEIC or typical meta)
    elif ext in ['.heic']:
        subfolder = "Camera_Roll"
    elif ext in ['.jpg', '.jpeg', '.png', '.mov', '.mp4']:
        # Assume Camera Roll for generic media if not screenshot, 
        # user can refine later or we assume 'Downloads' if no EXIF logic here (mdls is limited for EXIF make/model)
        # For now, let's put generic images in Camera_Roll if they have a clear ContentCreationDate
        # We could improve this by checking pixel dimensions (screenshots often match screen res)
        subfolder = "Camera_Roll"
    elif ext in ['.pdf', '.doc', '.docx', '.pages']:
        # Documents go to Inbox for manual sorting into Life Areas
        return INBOX_DIR, filename
    else:
        # Unknown/Other
        subfolder = "Misc_Files"

    dest_dir = os.path.join(TIMELINE_DIR, year, month, subfolder)
    return dest_dir, filename

def process_file(filepath, dry_run=True):
    if os.path.basename(filepath).startswith('.'):
        return # Skip hidden

    dest_dir, dest_filename = determine_destination(filepath, get_file_metadata(filepath))
    
    dest_path = os.path.join(dest_dir, dest_filename)
    
    # Handle collisions
    if os.path.exists(dest_path):
        base, ext = os.path.splitext(dest_filename)
        timestamp = datetime.datetime.now().strftime("%H%M%S")
        dest_filename = f"{base}_{timestamp}{ext}"
        dest_path = os.path.join(dest_dir, dest_filename)

    if dry_run:
        logger.info(f"[DRY RUN] Would move: {filepath} -> {dest_path}")
    else:
        os.makedirs(dest_dir, exist_ok=True)
        shutil.move(filepath, dest_path)
        logger.info(f"Moved: {filepath} -> {dest_path}")

def main():
    parser = argparse.ArgumentParser(description="Organize iCloud Dump")
    parser.add_argument("source", help="Source directory to scan")
    parser.add_argument("--dry-run", action="store_true", help="Don't move files, just log")
    args = parser.parse_args()

    source = os.path.abspath(args.source)
    
    if not os.path.exists(source):
        logger.error(f"Source directory not found: {source}")
        return

    logger.info(f"Starting organization scan on: {source}")
    file_count = 0
    
    for root, dirs, files in os.walk(source):
        # Prevent recursion into bundles
        dirs[:] = [d for d in dirs if not d.endswith('.photoslibrary') and not d.endswith('.app')]
        
        for file in files:
            filepath = os.path.join(root, file)
            process_file(filepath, dry_run=args.dry_run)
            file_count += 1
            if file_count % 100 == 0:
                print(f"Processed {file_count} files...")

    logger.info(f"Completed. Scanned {file_count} files.")

if __name__ == "__main__":
    main()
