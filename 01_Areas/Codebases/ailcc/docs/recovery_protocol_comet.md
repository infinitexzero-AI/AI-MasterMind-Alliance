# Comet Sync Recovery Protocol

If Comet has lost its profile identity (as seen in the "Sync setup" screen), follow these steps to restore your agentic context safely.

## Phase 1: Safe Shutdown

To prevent profile corruption during recovery, ensure Comet is completely closed.

1. Open **Terminal**.
2. Run the following command to force-close any hung Comet processes:

```bash
killall Comet
```

## Phase 2: Clearing Corrupted Caches

Run the existing optimization script to clear GPU and standard caches which often cause the `SIGSEGV` crashes.

1. In Terminal, run:

```bash
bash /Users/infinite27/AILCC_PRIME/scripts/optimize_browsers.sh
```

## Phase 3: Restoration & Sync

Comet is asking for a sync code because it perceives itself as a new device or its local vault was wiped.

1. **Option A: Re-login (Recommended)**
   - Launch Comet using the safe script:

     ```bash
     bash /Users/infinite27/AILCC_PRIME/scripts/launch_comet_safe.sh
     ```

   - Sign in to your **Perplexity** account. This should automatically pull down your Search Threads and Agent Settings.

2. **Option B: Sync Code**
   - If you have Comet/Perplexity open on another device (e.g., iPhone or another Mac), go to **Settings > Sync**.
   - Click **"I have a code"** on your current screen and enter the code displayed on your other device.

## Phase 4: Verification

1. Check the **AILCC Dashboard**.
2. The `Comet` agent should transition from `IDLE` to `ONLINE` once you perform a search or open a thread.
3. Monitor the `live_status.json` for any new "Crash Detected" flags (implemented in the next system update).

> [!TIP]
> Always use the `launch_comet_safe.sh` script if you notice visual glitches or frequent crashes, as it disables the GPU hardware acceleration which is the primary source of instability in Chromium v143+.
