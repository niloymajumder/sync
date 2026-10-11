# Sync

> Move music at the speed of listening.

![Sync — move music at the speed of listening](./public/Products-03.png)

Sync is a lightweight Chrome extension for saving music discovered on YouTube and SoundCloud to Spotify playlists. It detects the song in the active tab, finds the closest Spotify match, and lets you add it to an existing playlist or create a new one without interrupting your listening.

**Landing page:** [sync GitHub project](https://github.com/niloymajumder/sync)

## Why Sync?

Music discovery should not become a scavenger hunt. Sync removes the copy, search, and tab-switching between finding a track and keeping it.

- Detects songs from YouTube, YouTube Music, and SoundCloud
- Cleans noisy video titles before searching
- Finds the best Spotify version for the track
- Adds tracks to playlists in one click
- Creates private Spotify playlists from the popup
- Remembers recently matched tracks locally
- Uses a small, focused popup with light and dark mode support

## Product flow

```text
Listen on YouTube or SoundCloud
              ↓
        Open Sync
              ↓
       Match the track
              ↓
     Choose or create a playlist
              ↓
       Keep it on Spotify
```

## Install the extension

The project currently distributes the extension as an unpacked Chrome extension.

1. Download the latest `spotube-extension.zip` from [`public/`](./public/), or clone this repository.
2. If you downloaded the ZIP, unzip it to a local folder.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the unzipped extension directory, or the repository's [`extension/`](./extension/) directory.
7. Pin Sync from the Chrome extensions menu.

The extension does not include Spotify credentials. You must connect your own Spotify app from the Sync settings screen.

## Configure Spotify

Sync uses Spotify's OAuth authorization flow with PKCE. No client secret is required in the extension.

1. Sign in to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a Spotify application.
3. Open the Sync popup and choose **Spotify settings**.
4. Copy the **Redirect URI** shown by Sync.
5. Add that exact URI to the Spotify application's Redirect URIs.
6. Copy the Spotify application's **Client ID** into Sync.
7. Click **Connect Spotify** and approve the requested playlist permissions.

Sync requests permission to:

- Read the user's private playlists
- Create and modify private playlists
- Modify public playlists

If Spotify returns a `403 Forbidden` error after permissions were changed, disconnect and reconnect Spotify from the three-dot settings menu so a new token is issued.

## Development

### Requirements

- Node.js 20+ or [Bun](https://bun.sh/)
- Google Chrome
- A Spotify Developer application for testing the extension

### Start the landing page

```sh
bun install
bun run dev
```

Vite prints the local URL in the terminal. The landing page includes the extension download CTA and product overview.

### Build for production

```sh
bun run build
```

### Run tests

```sh
bun run test
```

### Lint

```sh
bun run lint
```

## Repository structure

```text
.
├── extension/
│   ├── manifest.json       # Chrome Manifest V3 configuration
│   ├── popup.html          # Extension popup structure
│   ├── popup.css           # Popup styling and responsive states
│   ├── popup.js            # Detection, Spotify auth, search, and playlist actions
│   └── icon*.png           # Extension icons
├── public/
│   ├── spotube-extension.zip
│   ├── sync-logo.png
│   └── favicon.png
├── src/
│   ├── routes/index.tsx    # Sync landing page
│   └── routes/api/public/  # Public track-matching endpoint
├── package.json
└── vite.config.ts
```

## How the extension works

1. Sync injects a small read-only scraper into the active YouTube or SoundCloud tab.
2. The title and artist/channel are normalized locally.
3. Sync searches Spotify for candidate tracks.
4. The optional public matcher endpoint ranks candidates when available.
5. The selected Spotify URI is sent to the playlist selected by the user.

Spotify access and refresh tokens are stored with `chrome.storage.local`. Track history is also stored locally in the browser. Sync does not need access to a user's Spotify password or client secret.

## Privacy and security

- Never commit `extension.pem`; it is the Chrome extension signing key and is ignored by Git.
- Never commit a Spotify Client ID together with private credentials, access tokens, refresh tokens, or environment files.
- Sync only reads metadata needed to identify the currently playing track.
- Sync does not upload audio or download music.
- The optional matching service receives track metadata and candidate results, not Spotify credentials.
- Review the requested Chrome and Spotify permissions before installing a build.

## Troubleshooting

### The popup is blank

Open `chrome://extensions`, find Sync, and click **Reload**. Then open the popup again. If the problem continues, open the extension's **Errors** panel and inspect the first runtime error.

### No song is detected

Make sure a YouTube, YouTube Music, or SoundCloud tab is active and the page has finished loading. You can also enter the title and artist manually in the popup.

### Spotify says access is forbidden

Confirm that the playlist belongs to your Spotify account or that you have permission to modify it. Then disconnect and reconnect Spotify to refresh the OAuth scopes.

### The track match is wrong

Enter the title and artist manually, remove extra words from the query, or try the **Find** action again. Video titles containing remixes, live versions, or edits may have multiple valid Spotify matches.

## Contributing

Issues and pull requests are welcome. For a focused change:

1. Create a branch from `main`.
2. Keep extension changes inside `extension/`.
3. Keep landing-page changes inside `src/`.
4. Run the relevant build, test, and lint commands.
5. Explain user-facing behavior changes in the pull request.

## License

See [`LICENSE`](./LICENSE).
