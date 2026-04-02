#!/usr/bin/env python3
"""
External Drive Troubleshooter - Fix common macOS external drive issues
Handles Error -36, corrupted dot files, and filesystem problems
"""

import subprocess
import os
from pathlib import Path
from typing import Dict, List

class DriveTroubleshooter:
    def __init__(self, drive_path: str = "/Volumes/LaCie"):
        self.drive_path = Path(drive_path)
        
    def check_drive_mounted(self) -> bool:
        """Check if drive is mounted"""
        return self.drive_path.exists()
    
    def get_drive_info(self) -> Dict:
        """Get drive information using diskutil"""
        if not self.check_drive_mounted():
            return {'error': 'Drive not mounted'}
        
        try:
            result = subprocess.run(
                ['diskutil', 'info', str(self.drive_path)],
                capture_output=True,
                text=True
            )
            
            info = {}
            for line in result.stdout.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    info[key.strip()] = value.strip()
            
            return info
        except Exception as e:
            return {'error': str(e)}
    
    def clean_dot_files(self, dry_run: bool = False) -> Dict:
        """Clean AppleDouble dot files (._filename) that cause Error -36"""
        print(f"🧹 Cleaning dot files from {self.drive_path}...")
        
        if not self.check_drive_mounted():
            return {'error': 'Drive not mounted'}
        
        if dry_run:
            print("  [DRY RUN] Would run: dot_clean")
            return {'status': 'dry_run'}
        
        try:
            # Run dot_clean to merge ._ files
            result = subprocess.run(
                ['dot_clean', str(self.drive_path)],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                print(f"  ✅ Dot files cleaned successfully")
                return {'status': 'success', 'output': result.stdout}
            else:
                print(f"  ⚠️  Some files couldn't be cleaned (permissions)")
                return {'status': 'partial', 'error': result.stderr}
                
        except subprocess.TimeoutExpired:
            return {'status': 'timeout', 'error': 'Operation timed out'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def verify_drive(self) -> Dict:
        """Verify drive filesystem"""
        print(f"🔍 Verifying drive filesystem...")
        
        if not self.check_drive_mounted():
            return {'error': 'Drive not mounted'}
        
        try:
            result = subprocess.run(
                ['diskutil', 'verifyVolume', str(self.drive_path)],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            print(result.stdout)
            
            if "appears to be OK" in result.stdout or "Volume appears to be OK" in result.stdout:
                print("  ✅ Drive filesystem is healthy")
                return {'status': 'healthy', 'output': result.stdout}
            else:
                print("  ⚠️  Drive may have issues")
                return {'status': 'issues', 'output': result.stdout}
                
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def repair_drive(self, dry_run: bool = False) -> Dict:
        """Attempt to repair drive (requires unmounting)"""
        print(f"🔧 Attempting drive repair...")
        
        if dry_run:
            print("  [DRY RUN] Would run: diskutil repairVolume")
            return {'status': 'dry_run'}
        
        # Get device identifier
        info = self.get_drive_info()
        device_id = info.get('Device Identifier')
        
        if not device_id:
            return {'error': 'Could not determine device identifier'}
        
        print(f"  ⚠️  This will unmount the drive temporarily")
        
        try:
            # Unmount
            subprocess.run(['diskutil', 'unmount', str(self.drive_path)], check=True)
            
            # Repair
            result = subprocess.run(
                ['diskutil', 'repairVolume', device_id],
                capture_output=True,
                text=True,
                timeout=600
            )
            
            # Remount
            subprocess.run(['diskutil', 'mount', device_id])
            
            print(result.stdout)
            return {'status': 'complete', 'output': result.stdout}
            
        except Exception as e:
            # Try to remount anyway
            try:
                subprocess.run(['diskutil', 'mount', device_id])
            except:
                pass
            return {'status': 'error', 'error': str(e)}
    
    def check_permissions(self) -> Dict:
        """Check if drive has write permissions"""
        if not self.check_drive_mounted():
            return {'error': 'Drive not mounted'}
        
        test_file = self.drive_path / '.write_test_file'
        
        try:
            # Try to write
            test_file.write_text('test')
            test_file.unlink()
            print("  ✅ Drive has write permissions")
            return {'writable': True}
        except Exception as e:
            print(f"  ❌ Drive is not writable: {e}")
            return {'writable': False, 'error': str(e)}
    
    def run_full_diagnostics(self) -> Dict:
        """Run complete drive diagnostics"""
        print("="*60)
        print("🔧 EXTERNAL DRIVE DIAGNOSTICS")
        print("="*60)
        
        results = {}
        
        # Check if mounted
        print(f"\n1. Checking drive mount status...")
        if not self.check_drive_mounted():
            print(f"  ❌ Drive not found at {self.drive_path}")
            return {'error': 'Drive not mounted'}
        print(f"  ✅ Drive is mounted")
        
        # Get drive info
        print(f"\n2. Getting drive information...")
        results['drive_info'] = self.get_drive_info()
        info = results['drive_info']
        
        if 'File System Personality' in info:
            print(f"  File System: {info['File System Personality']}")
        if 'Volume Free Space' in info:
            print(f"  Free Space: {info['Volume Free Space']}")
        
        # Check permissions
        print(f"\n3. Checking write permissions...")
        results['permissions'] = self.check_permissions()
        
        # Verify filesystem
        print(f"\n4. Verifying filesystem...")
        results['verify'] = self.verify_drive()
        
        # Clean dot files
        print(f"\n5. Cleaning dot files...")
        results['dot_clean'] = self.clean_dot_files()
        
        print("\n" + "="*60)
        print("Diagnostics complete!")
        print("="*60 + "\n")
        
        return results


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Troubleshoot external drive issues')
    parser.add_argument('--drive', type=str, default='/Volumes/LaCie',
                       help='Path to external drive')
    parser.add_argument('--repair', action='store_true',
                       help='Attempt to repair drive (requires unmount)')
    parser.add_argument('--clean-only', action='store_true',
                       help='Only clean dot files')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be done without executing')
    
    args = parser.parse_args()
    
    troubleshooter = DriveTroubleshooter(drive_path=args.drive)
    
    if args.clean_only:
        troubleshooter.clean_dot_files(dry_run=args.dry_run)
    elif args.repair:
        troubleshooter.repair_drive(dry_run=args.dry_run)
    else:
        troubleshooter.run_full_diagnostics()


if __name__ == '__main__':
    main()
