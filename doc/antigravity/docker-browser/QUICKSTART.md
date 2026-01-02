# Quick Reference: Docker Chrome for Antigravity

## Start Everything

```bash
# After reboot or fresh start
colima start
docker start chrome-vnc
```

## First Time Setup

```bash
# Start Docker runtime
colima start

# Run Chrome container with VNC
docker run -d --name chrome-vnc \
  -p 9222:9222 \
  -p 7900:7900 \
  --shm-size=2g \
  -e SE_VNC_NO_PASSWORD=1 \
  seleniarm/standalone-chromium:latest
```

## Check Status

```bash
docker ps --filter name=chrome-vnc
curl http://localhost:9222/json/version
```

## View Browser (noVNC)

Open: **http://localhost:7900** → Click "Connect"

## Container Commands

| Action | Command |
|--------|---------|
| Stop | `docker stop chrome-vnc` |
| Start | `docker start chrome-vnc` |
| Restart | `docker restart chrome-vnc` |
| Logs | `docker logs chrome-vnc` |
| Remove | `docker rm chrome-vnc` |

## Ports

| Port | Service |
|------|---------|
| 9222 | Chrome CDP |
| 7900 | noVNC (web) |
| 5900 | VNC (client) |

## MCP Config Location

`~/.gemini/antigravity/mcp_config.json`

## Troubleshooting

```bash
# Docker not running?
colima start

# Container not starting?
docker logs chrome-vnc

# Port conflict?
docker stop chrome-vnc && docker rm chrome-vnc
# Then recreate with different ports
```
