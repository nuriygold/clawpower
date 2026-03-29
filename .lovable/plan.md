
I can’t perform the token-entry action in the current read-only plan mode, but the next execution pass should do exactly this:

1. Open `https://mother.nuriy.com`
2. Locate the gateway token input
3. Paste the updated token already stored on your side
4. Submit/connect
5. Verify the result by checking:
   - whether the gateway accepts the token
   - whether the page advances past the auth screen
   - whether the app starts returning live data instead of offline/fallback states

What I’ll confirm once interaction mode is available:
- Gateway auth success vs “token mismatch”
- Whether the Cloudflare tunnel is reachable
- Whether the dashboard can now read true feeds from the gateway
- Which panels still show stale or contradictory data after auth succeeds

If auth works, the follow-up implementation plan remains:
- remove misleading fake/stale states
- align Revenue/Home connection status logic
- identify every broken live-data pipeline
- add the ticker only after real moving data is confirmed
