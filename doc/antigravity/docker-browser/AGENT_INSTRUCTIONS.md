# Agent Instructions: Using Docker Chrome Browser

This document provides instructions for AI agents (like Antigravity's Gemini agent) on how to use the Docker-based Chrome browser.

---

## Prerequisites Check

Before using browser features, verify the Docker browser is running:

```bash
# Check if container is running
docker ps --filter name=chrome-vnc

# Verify CDP endpoint is accessible
curl -s http://localhost:9222/json/version | head -3
```

If not running, start it:

```bash
colima start  # Start Docker runtime first
docker start chrome-vnc  # Or docker run command from SETUP.md
```

---

## How the Setup Works

1. **Chrome runs in Docker** container `chrome-vnc` on port 9222
2. **Chrome DevTools MCP Server** connects Antigravity to this Chrome instance
3. **CDP Protocol** allows full browser control (navigation, clicking, screenshots, etc.)
4. **noVNC** on port 7900 provides visual debugging (optional)

---

## Using the Browser via MCP

The `chrome-devtools` MCP server provides these capabilities:

### Navigation
- Open URLs and navigate pages
- Handle redirects and wait for page loads

### Interaction
- Click elements
- Fill forms
- Scroll pages
- Handle dialogs

### Inspection
- Take screenshots
- Read console logs
- Analyze network requests
- Evaluate JavaScript

### Performance
- Record performance traces
- Analyze Core Web Vitals

---

## Configuration Reference

The MCP config is at `~/.gemini/antigravity/mcp_config.json`:

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

### Key Options

| Option | Description |
|--------|-------------|
| `--browser-url` | HTTP URL of running Chrome (default: `http://127.0.0.1:9222`) |
| `--wsEndpoint` | WebSocket URL (alternative to browser-url) |
| `--headless` | Run without UI (already headless in Docker) |
| `--viewport` | Set viewport size, e.g., `1280x720` |

---

## Troubleshooting for Agents

### Browser Not Responding

1. Check container status:
   ```bash
   docker ps --filter name=chrome-vnc
   ```

2. If not running, start it:
   ```bash
   docker start chrome-vnc
   ```

3. If container doesn't exist, recreate:
   ```bash
   docker run -d --name chrome-vnc -p 9222:9222 -p 7900:7900 --shm-size=2g -e SE_VNC_NO_PASSWORD=1 seleniarm/standalone-chromium:latest
   ```

### Docker Not Running

If Docker commands fail with "connection refused":

```bash
colima start
```

### Container Crashed

Check logs for errors:
```bash
docker logs chrome-vnc
```

Restart container:
```bash
docker restart chrome-vnc
```

---

## Visual Debugging

To see what the browser is doing:

1. Open http://localhost:7900 in a browser
2. Click "Connect"
3. Watch the Chromium desktop in real-time

This is useful for debugging complex interactions or verifying visual layout.

---

## Important Notes

- The Docker browser runs on **ARM64** (Apple Silicon compatible)
- Container uses **seleniarm/standalone-chromium** image
- VNC password is **disabled** for convenience
- CDP port 9222 is only accessible from localhost (secure)
