# TERMINAL_SAFETY_POLICY.md

## Allowed (Auto-Execute)
- `ls`, `find`, `cat`, `grep`, `rg`
- `git status`, `git diff`
- `python3 --version`, `npm list`
- `python3 <script>` (Only known safe scripts in `core/scripts`)

## Restricted (Requires Approval)
- `rm`, `rm -rf`
- `mv` (rename/move)
- `git push`, `git commit`
- `curl`, `wget` (external network)
- `npm install`, `pip install`

## Policy
**Default to PLANNING mode.** always propose destructive changes in an artifact before execution.
