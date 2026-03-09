# IOS Morning Briefing Protocol (V1)

**Handshake ID**: `MB-0800-ALPHA`
**Schedule**: Daily 08:00 AM ADT

## 1. Objective

Provide a high-fidelity, consolidated brief of the previous 24 hours of AILCC activity directly to the user's iOS device via Shortcuts or a dedicated mobile endpoint.

## 2. Infrastructure

- **Provider**: Neural Relay (`relay.js`)
- **Endpoint**: `GET /api/mobile/briefing`
- **Output**: JSON (to be parsed by iOS Shortcut)

## 3. Data Schema

The briefing payload includes:

- `timestamp`: Current sync time.
- `mission_status`: High-level percent completion of the current Phase.
- `critical_alerts`: Any `HIGH` or `CRITICAL` verdicts from The Judge.
- `next_directives`: Top 3 tasks from Linear/Airtable.
- `scholar_update`: Progress on academic filings (HLTH-1011).

## 4. Handshake Seqeunce

1. **iOS Trigger**: Shortcut runs at 08:00 AM.
2. **GET Request**: Hits `http://<local-ip>:5005/api/mobile/briefing`.
3. **Relay Synthesis**: Relay fetches current state from Redis and local task registry.
4. **Presentation**: Shortcut displays the brief as a Rich Notification or Speakable text.

---
> Status: **IMPLEMENTING** | Requires `/api/mobile/briefing` in `relay.js`
