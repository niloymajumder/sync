# Sync

Sync is a Chrome extension that saves music discovered on YouTube and SoundCloud to Spotify playlists in seconds.

The repository contains:

- `extension/` — the unpacked Chrome extension
- `src/` — the Sync product landing page and public matching endpoint
- `public/spotube-extension.zip` — the installable extension package

## Run locally

Requires Node.js or Bun.

```sh
bun install
bun run dev
```

Open the local URL printed by Vite.

## Load the extension

1. Download and unzip `public/spotube-extension.zip`, or use the `extension/` folder directly.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select the extension folder.
4. Create a Spotify app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
5. Add the Redirect URI shown in the Sync popup, then paste the Spotify Client ID into Sync settings.

## Build

```sh
bun run build
```

## Security

The Chrome extension signing key is intentionally ignored. Never commit `extension.pem`, Spotify credentials, access tokens, or refresh tokens.
