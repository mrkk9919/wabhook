# GitHub Webhook Receiver

A small Node.js service that verifies GitHub's `X-Hub-Signature-256` header and accepts JSON webhook deliveries at `/webhook`.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install` in this folder.
3. Set `GITHUB_WEBHOOK_SECRET` to a long random secret. For PowerShell:
   `$env:GITHUB_WEBHOOK_SECRET = "your-long-random-secret"`
4. Start the server with `npm start`.
5. Check `http://localhost:3000/health` for `{"status":"ok"}`.

GitHub must be able to reach the server over HTTPS. For local development, expose port 3000 through a trusted HTTPS tunnel and use its HTTPS URL ending in `/webhook` as the webhook Payload URL.

## Configure GitHub

In the repository, open **Settings → Webhooks → Add webhook**:

- **Payload URL:** `https://your-host.example/webhook`
- **Content type:** `application/json`
- **Secret:** the same value as `GITHUB_WEBHOOK_SECRET`
- **Events:** choose only the events the integration needs
- **Active:** enabled

The service returns `202` for a valid delivery and `401` when the signature is invalid. It logs only the event name, delivery ID, action, and receive time; it does not print the payload.
