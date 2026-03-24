---
description: Link the Mac (Command Center) to the ThinkPad (Compute Engine) via Docker SSH.
---

# Vanguard OS: Multi-Node Swarm Link (`/[swarm_link]`)

This workflow permanently links your Mac to the ThinkPad. Once linked, any `docker run` or `bash launch_cortex.sh` command typed on your Mac will physically execute and consume RAM on the ThinkPad, completely offloading the Vanguard OS compute.

## Step 1: Prepare the ThinkPad (Windows / Linux)

If the ThinkPad is running Windows:

1. Open **Settings > System > Optional Features**.
2. Click **Add a feature** and install **OpenSSH Server**.
3. Open a PowerShell terminal as Administrator and start the SSH service:

   ```powershell
   Start-Service sshd
   Set-Service -Name sshd -StartupType 'Automatic'
   ```

4. Find the ThinkPad's local IP address:

   ```powershell
   ipconfig
   ```

   *(Look for IPv4 Address under your active Wi-Fi/Ethernet adapter, e.g., 192.168.1.50)*

If the ThinkPad is running Linux (Ubuntu):

1. Install and start SSH:

   ```bash
   sudo apt install openssh-server -y
   sudo systemctl enable --now ssh
   ```

2. Find the IP:

   ```bash
   ip a
   ```

## Step 2: Establish the Swarm Link (On the Mac)

Now, return to your Mac. Open your terminal and create a remote Docker Context pointing to the ThinkPad's IP.
*(Replace `<thinkpad_username>` with your Windows/Linux login name, and `<ip_address>` with the IPv4 from Step 1).*

```bash
# Create the remote context
docker context create thinkpad --docker "host=ssh://<thinkpad_username>@<ip_address>"

# Set the Mac to use the ThinkPad by default
docker context use thinkpad
```

## Step 3: Verify Absolute Control

On your Mac, type:

```bash
docker ps
```

You should be prompted for the ThinkPad's password. Once entered, your Mac will return the list of containers physically running on the ThinkPad.

**Congratulations. Your Mac is now a thin-client Command Center, and your ThinkPad is the Vanguard Compute Engine.**

*(To switch back to your Mac's local Docker at any time, just type: docker context use default)*
