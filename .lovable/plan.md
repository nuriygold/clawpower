

# Fix Kissin' Booth: CORS Block on Gateway

## Problem

The OpenClaw gateway at `mother.nuriy.com` works (confirmed via curl), but **browser fetch requests are blocked by CORS policy**. The Lovable preview runs on `https://id-preview--*.lovable.app` — the gateway must explicitly allow this origin.

## Root Cause

When a browser makes a cross-origin request, the server must respond with `Access-Control-Allow-Origin` headers. The gateway either returns no CORS headers or only allows specific origins. The browser silently kills the request, resulting in "Load failed."

## Fix (Server-Side — on your Mac mini)

You need to configure the OpenClaw gateway to allow CORS from the dashboard origins. Run on your Mac mini:

```bash
openclaw config set gateway.cors.origins '["https://clawpower.lovable.app", "https://claw.nuriy.com", "https://id-preview--37e91969-1c09-420d-a117-91e7e6bf34aa.lovable.app"]'
openclaw gateway restart
```

If OpenClaw uses `controlUi.allowedOrigins`, that's already set to `["*"]` per your config — but CORS headers might be a separate setting. Check:

```bash
openclaw config get gateway.cors
openclaw config get controlUi
```

If the gateway doesn't support CORS config natively, the alternative is to configure Cloudflare to inject CORS headers on the tunnel. In your Cloudflare dashboard for the `mother.nuriy.com` tunnel, add a Transform Rule that sets:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Authorization, Content-Type`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`

## No Code Changes Needed

The frontend code is correct — `fetch()` calls with `?token=` query params and `Authorization` header. The fix is entirely server-side CORS configuration.

## Verification

Once CORS headers are configured, the `/status` endpoint will return 200 to the browser, the status indicator will flip to "Adrian is online", and chat messages will flow through.

