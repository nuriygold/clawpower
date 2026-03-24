

## Set Environment Variables

These are client-side Vite environment variables (prefixed with `VITE_`). They'll be stored in a `.env` file in the project root.

### Plan

Create a `.env` file with:
- `VITE_OPENCLAW_API_URL=https://leone-jon-listings-outer.trycloudflare.com`
- `VITE_OPENCLAW_TOKEN=314ad3941528d0bd80796343e845089b118647ac0141f34d`
- `VITE_DASHBOARD_PASSWORD=claw`

This single file change will connect the dashboard to your live API. After this, the password gate will accept "claw" and all panels will poll your Cloudflare Tunnel endpoint.

