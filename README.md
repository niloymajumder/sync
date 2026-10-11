# Sync
![Sync — move music at the speed of listening](./public/Products-03.png)

> Sync - at the speed of listening!

Sync is a lightweight Chrome extension for saving music discovered on YouTube and SoundCloud to Spotify playlists. It detects the song in the active tab, finds the closest Spotify match, and lets you add it to an existing playlist or create a new one without interrupting your listening.

**Website:** [Sync](https://github.com/niloymajumder/sync)

## Why Sync?

Music discovery should not become a scavenger hunt. Sync removes the copy, search, and tab-switching between finding a track and keeping it.

- Detects songs from YouTube, YouTube Music, and SoundCloud
- Cleans noisy video titles before searching
- Finds the best Spotify version for the track
- Adds tracks to playlists in one click
- Creates private Spotify playlists from the popup
- Remembers recently matched tracks locally
- Uses a small, focused popup with light and dark mode support

## Install the extension

The project currently distributes the extension as an unpacked Chrome extension.

1. Download the latest `spotube-extension.zip` from [`public/`](./public/), or clone this repository.
2. If you downloaded the ZIP, unzip it to a local folder.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the unzipped extension directory, or the repository's [`extension/`](./extension/) directory.
7. Pin Sync from the Chrome extensions menu.

> Disclaimer: The extension does not include Spotify credentials. You must connect your own Spotify app from the Sync settings screen.

## Configure Spotify

Sync uses Spotify's OAuth authorization flow with PKCE. No client secret is required in the extension.

1. Sign in to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a Spotify application.
3. Open the Sync popup and choose **Spotify settings**.
4. Copy the **Redirect URI** shown by Sync.
5. Add that exact URI to the Spotify application's Redirect URIs.
6. Copy the Spotify application's **Client ID** into Sync.
7. Click **Connect Spotify** and approve the requested playlist permissions.


```
> a product of Paperfrogs/devs
