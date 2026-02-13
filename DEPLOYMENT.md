# Deployment — Casa Primas auf Hetzner CX23

## Voraussetzungen

- Hetzner CX23 Server mit Ubuntu 22.04/24.04
- SSH-Zugang zum Server
- Domain (optional, aber empfohlen)

---

## Option 1: Node.js + PM2 + Nginx

### 1. Server vorbereiten

```bash
ssh root@DEINE-SERVER-IP

# System updaten
apt update && apt upgrade -y

# Node.js 20 installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 installieren
npm install -g pm2

# Nginx installieren
apt install -y nginx

# Firewall konfigurieren
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 2. App-User anlegen

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 3. Repository klonen und bauen

```bash
cd ~
git clone https://github.com/Rafael-PR/casa-primas.git
cd casa-primas
npm install
npm run build
```

### 4. Mit PM2 starten

```bash
# App starten (Port 3000)
pm2 start npm --name "casa-primas" -- start

# PM2 beim Serverstart automatisch laden
pm2 startup
pm2 save
```

PM2-Befehle:
```bash
pm2 status          # Status anzeigen
pm2 logs casa-primas # Logs anzeigen
pm2 restart casa-primas # Neustarten
pm2 stop casa-primas    # Stoppen
```

### 5. Nginx als Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/casa-primas
```

Inhalt:

```nginx
server {
    listen 80;
    server_name deine-domain.de;  # oder: server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktivieren:

```bash
sudo ln -s /etc/nginx/sites-available/casa-primas /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL mit Let's Encrypt (optional, bei eigener Domain)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d deine-domain.de
```

Zertifikat erneuert sich automatisch.

---

## Option 2: Docker

### 1. Docker auf dem Server installieren

```bash
ssh root@DEINE-SERVER-IP

apt update
apt install -y docker.io docker-compose-v2
systemctl enable docker
```

### 2. Dockerfile erstellen (lokal im Projekt)

Erstelle `Dockerfile` im Projektroot:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Auf dem Server deployen

```bash
cd ~
git clone https://github.com/Rafael-PR/casa-primas.git
cd casa-primas

# Image bauen und starten
docker build -t casa-primas .
docker run -d --name casa-primas --restart unless-stopped -p 3000:3000 casa-primas
```

### 4. Nginx davor (gleich wie Option 1, Schritt 5 + 6)

---

## Updates deployen

### Option 1 (PM2):
```bash
cd ~/casa-primas
git pull
npm install
npm run build
pm2 restart casa-primas
```

### Option 2 (Docker):
```bash
cd ~/casa-primas
git pull
docker stop casa-primas && docker rm casa-primas
docker build -t casa-primas .
docker run -d --name casa-primas --restart unless-stopped -p 3000:3000 casa-primas
```

---

## Quick-Check

Nach dem Deployment:

- `http://DEINE-SERVER-IP` — Startseite muss laden
- Alle 4 Spiele testen (Snake, Tetris, Flappy Bird, Breakout)
- Mobile Check (Handy-Browser)
