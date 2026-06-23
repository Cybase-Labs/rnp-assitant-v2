# Deployment

This app deploys as a Docker container through GitHub Actions. Nginx Proxy Manager should proxy the public domain to the container port on the server.

## GitHub Secrets

Add these secrets in `Cybase-Labs/rnp-assitant-v2` under **Settings -> Secrets and variables -> Actions**:

- `SERVER_HOST`: `206.189.211.25`
- `SERVER_USER`: SSH user on the server
- `SERVER_SSH_KEY`: private SSH key for that user
- `SERVER_PORT`: SSH port, usually `22`
- `DEPLOY_PATH`: server folder, for example `/opt/rnp-assistant`
- `APP_PORT`: `3030`
- `APP_URL`: `https://rnp.cybaselabs.com`
- `ANTHROPIC_API_KEY`: production Anthropic key
- `ADMIN_DASHBOARD_KEY`: production admin dashboard password/key
- `ADMIN_AUTH_COOKIE`: optional, defaults to `rtla_admin_auth`

## Server Prerequisites

The server needs Docker and the Docker Compose plugin:

```sh
docker --version
docker compose version
```

The deploy user must be able to run Docker. If needed:

```sh
sudo usermod -aG docker <SERVER_USER>
```

Then log out and back in for the group change to apply.

## Nginx Proxy Manager

Create a Proxy Host:

- **Domain Names**: `rnp.cybaselabs.com`
- **Scheme**: `http`
- **Forward Hostname / IP**: `172.17.0.1`
- **Forward Port**: `3030`
- Enable **Websockets Support**
- On the SSL tab, request a Let's Encrypt certificate, enable **Force SSL** and **HTTP/2 Support**

If Nginx Proxy Manager runs directly on the host instead of inside Docker, use `127.0.0.1` as the forward hostname/IP.

## Deploy

Push to `main`, or run the `Deploy` workflow manually from GitHub Actions.

The SQLite database is stored in a Docker named volume:

```sh
rnp-assistant-storage
```

The bundled law JSON stays inside the image at `data/rwanda_traffic_law.json`.
