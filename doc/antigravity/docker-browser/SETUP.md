# Complete Setup Guide: Docker Browser for Antigravity

This guide covers the full setup process for running a Docker-based Chrome browser with VNC for Antigravity IDE.

## Prerequisites

### 1. Docker Runtime

On macOS, you need a Docker runtime. We use **Colima** (lightweight alternative to Docker Desktop):

```bash
# Install via Homebrew
brew install colima docker docker-compose

# Start Colima
colima start
```

Alternative options:
- **Docker Desktop**: `brew install --cask docker`
- **OrbStack**: `brew install --cask orbstack`

### 2. Verify Docker is Running

```bash
docker info
```

---

## Step 1: Start Chrome Container

### Option A: With VNC (Recommended for Debugging)

```bash
docker run -d --name chrome-vnc \
  -p 9222:9222 \
  -p 7900:7900 \
  --shm-size=2g \
  -e SE_VNC_NO_PASSWORD=1 \
  seleniarm/standalone-chromium:latest
```

**Ports:**
| Port | Purpose |
|------|---------|
| 9222 | Chrome DevTools Protocol (CDP) |
| 7900 | noVNC web interface |
| 5900 | VNC client connection (optional) |

### Option B: Headless Only (Lightweight)

```bash
docker run -d --name chrome-headless \
  -p 9222:9222 \
  zenika/alpine-chrome:latest \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --remote-debugging-address=0.0.0.0 \
  --remote-debugging-port=9222 \
  --headless
```

---

## Step 2: Verify Chrome is Accessible

```bash
curl http://localhost:9222/json/version
```

Expected output:
```json
{
  "Browser": "HeadlessChrome/...",
  "webSocketDebuggerUrl": "ws://localhost:9222/devtools/browser/..."
}
```

---

## Step 3: Configure Antigravity MCP

Edit `~/.gemini/antigravity/mcp_config.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--browser-url=http://127.0.0.1:9222"
      ],
      "env": {}
    }
  }
}
```

**Restart Antigravity** for changes to take effect.

---

## Step 4: Access VNC Interface (Optional)

Open in any browser: **http://localhost:7900**

1. Click "Connect"
2. You'll see the Chromium desktop
3. Use this to visually monitor what the browser is doing

---

## Container Management

### Start/Stop

```bash
docker stop chrome-vnc
docker start chrome-vnc
```

### View Logs

```bash
docker logs chrome-vnc
docker logs -f chrome-vnc  # Follow logs
```

### Remove and Recreate

```bash
docker stop chrome-vnc && docker rm chrome-vnc
# Then run the docker run command again
```

### Check Status

```bash
docker ps --filter name=chrome-vnc
```

---

## After System Reboot

After rebooting your Mac:

```bash
# 1. Start Docker runtime
colima start

# 2. Start Chrome container
docker start chrome-vnc
```

Or if you removed the container:
```bash
colima start
docker run -d --name chrome-vnc ...  # full command
```

---

## Troubleshooting

### Docker Connection Refused

```
docker: dial unix /var/run/docker.sock: connect: no such file or directory
```

**Fix:** Start Colima: `colima start`

### Port Already in Use

```
Error: port is already allocated
```

**Fix:** Stop existing container or use different port:
```bash
docker stop chrome-vnc
# or
docker run ... -p 9223:9222 ...
```

### ARM64 Image Not Found

If you see "no matching manifest for linux/arm64":

- Use `seleniarm/standalone-chromium` instead of `selenium/standalone-chrome`
- Or use `zenika/alpine-chrome` for headless only

### CDP Connection Timeout

If Chrome DevTools MCP can't connect:

1. Verify container is running: `docker ps`
2. Check port: `curl http://localhost:9222/json/version`
3. Wait for container startup (takes ~15 seconds)

---

## Security Notes

> ⚠️ **Warning**: The remote debugging port allows full browser control. Only expose on localhost.

- Never expose port 9222 to the network
- The VNC password is disabled for convenience (`SE_VNC_NO_PASSWORD=1`)
- For production, add a VNC password and use SSH tunneling
