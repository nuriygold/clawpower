

# Fix Gateway Token Authentication

## The Problem

All requests to `mother.nuriy.com` fail with "Load failed." The app sends the token as `Authorization: Bearer <token>`, but OpenClaw gateway with `auth.mode = "token"` expects the token passed differently — likely as a query parameter (`?token=...`) or a gateway-specific header, not a standard Bearer auth header.

## The Fix

Update `src/lib/api.ts` and `src/components/panels/DispatchPanel.tsx` to pass the token as a query parameter instead of (or in addition to) the Bearer header:

### `src/lib/api.ts`
- Change `apiFetch()` to append `?token=${TOKEN}` to the URL
- Change `isGatewayAvailable()` the same way
- Keep the Bearer header as a fallback (harmless if ignored)

### `src/components/panels/DispatchPanel.tsx`
- Update `sendToGateway()` to append `?token=${TOKEN}` to the `/chat` endpoint URL

### Changes Summary

| File | Change |
|---|---|
| `src/lib/api.ts` | Append `?token=` query param to all gateway fetch URLs |
| `src/components/panels/DispatchPanel.tsx` | Same for the `/chat` endpoint |

This is a 2-line fix in each file. If the gateway accepts query-param tokens, all API calls will start working immediately.

