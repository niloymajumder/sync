const $ = (id) => document.getElementById(id);
const REDIRECT = chrome.identity.getRedirectURL();
const SCOPES = "playlist-read-private playlist-modify-private playlist-modify-public";
const DEFAULT_SERVER = "https://id-preview--e8af9086-a485-4de8-83d9-228eeadc5a1e.lovable.app";
let track = null, playlists = [], me = null;
const store = { get: (key) => chrome.storage.local.get(key), set: (value) => chrome.storage.local.set(value) };

function toast(message) {
  const node = $("toast"); node.textContent = message; node.classList.add("show");
  clearTimeout(node._hide); node._hide = setTimeout(() => node.classList.remove("show"), 2200);
}
function show(view) { ["setup", "main"].forEach((id) => $(id).classList.toggle("hidden", id !== view)); $("refreshBtn").classList.toggle("hidden", view !== "main"); $("settingsMenu").classList.add("hidden"); }
function stateMessage(title, subtitle = "") {
  $("result").classList.add("hidden"); $("state").classList.remove("hidden");
  $("state").innerHTML = `<strong>${title}</strong><p>${subtitle}</p>`;
}
function setLoading(message) { $("state").innerHTML = `<div class="spinner"></div><p>${message}</p>`; $("state").classList.remove("hidden"); $("result").classList.add("hidden"); }

const b64url = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function login(clientId) {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(64)));
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const url = `https://accounts.spotify.com/authorize?${new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: REDIRECT, scope: SCOPES, code_challenge_method: "S256", code_challenge: challenge })}`;
  const redirect = await chrome.identity.launchWebAuthFlow({ url, interactive: true });
  const code = new URL(redirect).searchParams.get("code");
  if (!code) throw new Error("Authorization cancelled");
  await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: REDIRECT, client_id: clientId, code_verifier: verifier });
}
async function tokenRequest(body) {
  const response = await fetch("https://accounts.spotify.com/api/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body) });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error_description || "Token error");
  const { refresh_token } = await store.get("refresh_token");
  await store.set({ access_token: json.access_token, refresh_token: json.refresh_token || refresh_token, expires_at: Date.now() + json.expires_in * 1000 - 60000 });
}
async function getToken() {
  const saved = await store.get(["access_token", "refresh_token", "expires_at", "clientId"]);
  if (saved.access_token && Date.now() < saved.expires_at) return saved.access_token;
  if (!saved.refresh_token) throw new Error("NOAUTH");
  await tokenRequest({ grant_type: "refresh_token", refresh_token: saved.refresh_token, client_id: saved.clientId });
  return (await store.get("access_token")).access_token;
}
async function api(path, options = {}) {
  const response = await fetch(`https://api.spotify.com/v1${path}`, { ...options, headers: { Authorization: `Bearer ${await getToken()}`, "Content-Type": "application/json", ...(options.headers || {}) } });
  if (response.status === 401) { await store.set({ access_token: null }); throw new Error("NOAUTH"); }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error?.message || `Spotify error ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

function scrapePage() {
  const host = location.hostname, query = (selector) => document.querySelector(selector);
  if (host.includes("music.youtube.com")) {
    const title = query("ytmusic-player-bar .title")?.textContent, artist = query("ytmusic-player-bar .byline a")?.textContent;
    if (title) return { title, artist: artist || "" };
  }
  if (host.includes("youtube.com")) return { title: query("h1.ytd-watch-metadata yt-formatted-string")?.textContent || query('meta[name="title"]')?.content || document.title.replace(/ - YouTube$/, ""), artist: query("ytd-video-owner-renderer #channel-name a")?.textContent || "" };
  if (host.includes("soundcloud.com")) return { title: query(".playbackSoundBadge__titleLink span:last-child")?.textContent || query('meta[property="og:title"]')?.content || "", artist: query(".playbackSoundBadge__lightLink")?.textContent || "" };
  return { title: document.title, artist: "" };
}
function cleanQuery({ title, artist }) {
  const cleanedTitle = (title || "").replace(/\(.*?(official|video|audio|lyric|visualizer|hd|4k|mv|live).*?\)|\[.*?\]/gi, "").replace(/\b(official (music )?video|official audio|lyrics?|lyric video|ft\.?|feat\.?)\b/gi, " ").replace(/[|•]/g, " ").replace(/\s+/g, " ").trim();
  const cleanedArtist = (artist || "").replace(/ ?- ?Topic$|VEVO$|Official$/i, "").trim();
  if (cleanedTitle.includes(" - ")) { const [first, second] = cleanedTitle.split(" - "); return `${second} ${first}`; }
  return cleanedArtist && !cleanedTitle.toLowerCase().includes(cleanedArtist.toLowerCase()) ? `${cleanedTitle} ${cleanedArtist}` : cleanedTitle;
}
async function aiPick(title, artist, items) {
  const { serverUrl } = await store.get("serverUrl"), base = (serverUrl || DEFAULT_SERVER).replace(/\/$/, "");
  const candidates = items.map((item, index) => ({ i: index, name: item.name, artists: item.artists.map((a) => a.name).join(", "), album: item.album.name, year: item.album.release_date?.slice(0, 4), ms: item.duration_ms }));
  const response = await fetch(`${base}/api/public/match`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, artist, candidates }) });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || `AI error ${response.status}`);
  return json;
}

async function detectTrack() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let info = { title: "", artist: "" };
  if (tab?.url && /youtube\.com|soundcloud\.com/.test(tab.url)) {
    try { [{ result: info }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: scrapePage }); }
    catch { info = { title: tab.title?.replace(/ - YouTube$/, "") || "", artist: "" }; }
  }
  $("inTitle").value = (info.title || "").trim(); $("inArtist").value = (info.artist || "").trim();
  return info.title ? matchSong() : stateMessage("No song detected", "Type a title and artist, then tap Find.");
}
async function matchSong() {
  const title = $("inTitle").value.trim(), artist = $("inArtist").value.trim();
  if (!title) return toast("Enter a song title");
  setLoading("Finding the right version…");
  try {
    const response = await api(`/search?type=track&limit=10&q=${encodeURIComponent(cleanQuery({ title, artist }))}`);
    const items = response.tracks.items.filter(Boolean);
    if (!items.length) return stateMessage("Not available on Spotify", `Nothing matched “${title}”.`);
    let pick = { index: 0, reason: "" };
    try { pick = await aiPick(title, artist, items); } catch { /* The first result remains a useful fallback. */ }
    if (pick.index < 0) return stateMessage("No close match found", pick.reason || "Try a different title or artist.");
    track = items[pick.index] || items[0];
    $("cover").src = track.album.images[1]?.url || track.album.images[0]?.url || "";
    $("tName").textContent = track.name; $("tArtist").textContent = `${track.artists.map((a) => a.name).join(", ")} · ${track.album.name}`;
    $("aiReason").textContent = pick.reason ? `✨ ${pick.confidence ? `${pick.confidence} confidence · ` : ""}${pick.reason}` : "";
    $("openSp").href = track.external_urls.spotify;
    await loadPlaylists(); await saveRecent(track);
    $("state").classList.add("hidden"); $("result").classList.remove("hidden");
  } catch (error) { if (error.message === "NOAUTH") return openSetup(); stateMessage("Could not find that track", error.message); }
}
async function loadPlaylists() {
  me = me || await api("/me"); playlists = []; let next = "/me/playlists?limit=50";
  while (next) { const response = await api(next.replace("https://api.spotify.com/v1", "")); playlists.push(...response.items.filter((item) => item && (item.owner.id === me.id || item.collaborative))); next = response.next; }
  renderPlaylists();
}
function renderPlaylists() {
  const filter = $("filter").value.toLowerCase(); $("playlists").innerHTML = "";
  playlists.filter((item) => item.name.toLowerCase().includes(filter)).forEach((playlist) => {
    const row = document.createElement("li"); row.className = "playlist";
    const image = playlist.images?.[0]?.url; row.innerHTML = `${image ? `<img src="${image}" alt="">` : '<div class="ph"></div>'}<span class="playlist-name"></span><b class="add">＋</b>`;
    row.querySelector(".playlist-name").textContent = playlist.name;
    row.onclick = () => addToPlaylist(playlist, row); $("playlists").appendChild(row);
  });
  if (!$("playlists").children.length) $("playlists").innerHTML = `<li class="muted">No matching playlists</li>`;
}
async function addToPlaylist(playlist, row) {
  if (row.classList.contains("done") || !track) return;
  try {
    await api(`/playlists/${playlist.id}/items`, { method: "POST", body: JSON.stringify({ uris: [track.uri] }) });
    row.classList.add("done"); row.querySelector(".add").textContent = "✓"; toast(`Added to ${playlist.name}`);
  } catch (error) {
    if (error.message === "NOAUTH") openSetup();
    else if (error.status === 403) toast("Spotify denied access. Reconnect Spotify in settings.");
    else toast(error.message);
  }
}
async function createPlaylist() {
  const name = $("playlistName").value.trim(); if (!name) return toast("Name your playlist");
  $("savePlaylistBtn").disabled = true;
  try {
    const playlist = await api(`/users/${me.id}/playlists`, { method: "POST", body: JSON.stringify({ name, description: $("playlistDescription").value.trim(), public: false }) });
    if (track) await api(`/playlists/${playlist.id}/items`, { method: "POST", body: JSON.stringify({ uris: [track.uri] }) });
    $("createPanel").classList.add("hidden"); $("playlistName").value = ""; $("playlistDescription").value = ""; await loadPlaylists(); toast(track ? `Created and added to ${name}` : `Created ${name}`);
  } catch (error) {
    if (error.status === 403) toast("Playlist created, but Spotify denied adding the track. Reconnect in settings.");
    else toast(error.message);
  } finally { $("savePlaylistBtn").disabled = false; }
}
async function saveRecent(item) {
  const saved = await store.get("recentTracks"), recent = (saved.recentTracks || []).filter((entry) => entry.id !== item.id);
  await store.set({ recentTracks: [{ id: item.id, name: item.name, artist: item.artists.map((a) => a.name).join(", "), image: item.album.images[2]?.url || item.album.images[0]?.url || "", uri: item.uri }, ...recent].slice(0, 5) }); renderRecent();
}
async function renderRecent() {
  const { recentTracks = [] } = await store.get("recentTracks"); $("recentSection").classList.toggle("hidden", !recentTracks.length); $("recent").innerHTML = "";
  recentTracks.forEach((item) => { const row = document.createElement("li"); row.innerHTML = `<img class="recent-cover" src="${item.image}" alt=""><span class="playlist-name"><b></b><small class="muted"></small></span><span class="recent-action">Use</span>`; row.querySelector("b").textContent = item.name; row.querySelector("small").textContent = item.artist; row.onclick = () => { $("inTitle").value = item.name; $("inArtist").value = item.artist; matchSong(); }; $("recent").appendChild(row); });
}
async function openSetup() {
  show("setup"); const saved = await store.get(["clientId", "refresh_token", "serverUrl"]); $("clientId").value = saved.clientId || ""; $("serverUrl").value = saved.serverUrl || ""; $("logoutBtn").classList.toggle("hidden", !saved.refresh_token);
}
async function openHome() {
  show("main");
  const { refresh_token } = await store.get("refresh_token");
  $("connectCard").classList.toggle("hidden", !!refresh_token);
  $("menuDisconnectBtn").classList.toggle("hidden", !refresh_token);
  if (!refresh_token) stateMessage("Ready to sync", "Connect Spotify above to search and save songs.");
  else detectTrack();
}

$("redirectUri").textContent = REDIRECT; $("redirectUri").onclick = () => navigator.clipboard.writeText(REDIRECT).then(() => toast("Redirect URI copied"));
$("filter").oninput = renderPlaylists; $("matchBtn").onclick = matchSong; $("detectBtn").onclick = detectTrack; $("refreshBtn").onclick = () => loadPlaylists().then(() => toast("Playlists refreshed")).catch((e) => toast(e.message));
["inTitle", "inArtist"].forEach((id) => ($(id).onkeydown = (event) => event.key === "Enter" && matchSong()));
$("createBtn").onclick = () => $("createPanel").classList.toggle("hidden"); $("cancelCreateBtn").onclick = () => $("createPanel").classList.add("hidden"); $("savePlaylistBtn").onclick = createPlaylist;
$("clearRecentBtn").onclick = async () => { await store.set({ recentTracks: [] }); renderRecent(); };
$("serverUrl").onchange = () => store.set({ serverUrl: $("serverUrl").value.trim() });
$("settingsBtn").onclick = () => $("settingsMenu").classList.toggle("hidden");
$("menuSettingsBtn").onclick = openSetup; $("menuDetectBtn").onclick = detectTrack;
$("menuDisconnectBtn").onclick = async () => { await chrome.storage.local.remove(["access_token", "refresh_token", "expires_at"]); me = null; $("settingsMenu").classList.add("hidden"); toast("Disconnected"); openHome(); };
$("homeConnectBtn").onclick = openSetup;
$("logoutBtn").onclick = async () => { await chrome.storage.local.remove(["access_token", "refresh_token", "expires_at"]); me = null; toast("Disconnected"); openSetup(); };
$("connectBtn").onclick = async () => { const clientId = $("clientId").value.trim(); if (!clientId) return toast("Enter your Client ID"); await store.set({ clientId }); try { await login(clientId); toast("Connected"); detectTrack(); } catch (error) { toast(error.message); } };

(async () => { renderRecent(); await openHome(); })();
