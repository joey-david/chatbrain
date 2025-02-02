# Server Deployment Guide

Notes I've taken on deploying a frontend and backend (api) onto a VPS.

---

## **1. Understanding the Infrastructure**

### **1.1 What is a VPS?**
A VPS (Virtual Private Server) is a virtual machine running on a larger physical server. It operates 24/7 and provides a dedicated environment for hosting applications. You have full root access to the server, allowing you to install and configure software as needed.

### **1.2 Connecting to the VPS**
To connect to your VPS, use the `ssh` command from your terminal:
```bash
ssh root@38.54.110.180
```
Replace `38.54.110.180` with the IP address of your VPS. You will be prompted to enter the root password.

### **1.3 Hostname**
A VPS typically has a default hostname provided by the hosting provider. You can check the hostname using:
```bash
hostname
```
You can change the hostname to something more meaningful:
```bash
sudo hostnamectl set-hostname your-new-hostname
```

---

## **2. Domain Name Configuration**

### **2.1 Buying a Domain Name**
A domain name (e.g., `chatbrain.chat`) allows users to access your application using a human-readable address instead of an IP address. Purchase a domain name from a registrar like [Namecheap](https://www.namecheap.com/), [Google Domains](https://domains.google/), or [GoDaddy](https://www.godaddy.com/).

### **2.2 Configuring DNS**
After purchasing the domain, configure the DNS settings to point to your VPS:
1. Log in to your domain registrar's dashboard.
2. Locate the DNS settings for your domain.
3. Add an **A Record**:
   - **Host**: `@`
   - **Value**: `38.54.110.180` (your VPS IP address)
4. (Optional) Add a **CNAME Record** for a subdomain (e.g., `api`):
   - **Host**: `api`
   - **Value**: `@`

DNS changes may take up to 24 hours to propagate.

---

## **3. Deploying the Application**

### **3.1 Frontend Deployment**
1. **Clone your repository**:
   ```bash
   git clone <your-repo-url> /var/www/chatbrain
   cd /var/www/chatbrain/chatbrain
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Build the application**:
   ```bash
   npm run build
   ```
4. **Serve the frontend**:
   Use a process manager like `pm2` to run the frontend:
   ```bash
   sudo npm install -g pm2
   pm2 serve dist 3000 --name "chatbrain-frontend"
   pm2 save
   pm2 startup
   ```

### **3.2 Backend Deployment**
1. **Set up a virtual environment**:
   ```bash
   cd /var/www/chatbrain/api
   python3 -m venv venv
   source venv/bin/activate
   ```
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt gunicorn
   ```
3. **Create a systemd service**:
   Create a file at `/etc/systemd/system/chatbrain-backend.service`:
   ```ini
   [Unit]
   Description=ChatBrain Backend Service
   After=network.target

   [Service]
   User=root
   WorkingDirectory=/var/www/chatbrain/api
   Environment="FLASK_ENV=production"
   ExecStart=/var/www/chatbrain/api/venv/bin/gunicorn --bind 0.0.0.0:5000 api:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
4. **Start and enable the service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start chatbrain-backend
   sudo systemctl enable chatbrain-backend
   ```

---

## **4. Configuring Nginx**

Nginx acts as a reverse proxy, routing traffic to your frontend and backend.

1. **Install Nginx**:
   ```bash
   sudo apt install nginx
   ```
2. **Create a configuration file**:
   Create a file at `/etc/nginx/sites-available/chatbrain.conf`:
   ```nginx
   server {
       server_name chatbrain.chat;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
3. **Enable the configuration**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/chatbrain.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl restart nginx
   ```

---

## **5. Securing the Application**

### **5.1 Firewall Configuration**
Allow necessary ports and enable the firewall:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### **5.2 SSL with Let's Encrypt**
Secure your application with HTTPS:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d chatbrain.chat
```

---

## **6. Monitoring and Maintenance**

### **6.1 Check Service Status**
- Frontend:
  ```bash
  pm2 list
  ```
- Backend:
  ```bash
  systemctl status chatbrain-backend
  ```
- Nginx:
  ```bash
  systemctl status nginx
  ```

### **6.2 View Logs**
- Frontend:
  ```bash
  pm2 logs
  ```
- Backend:
  ```bash
  journalctl -u chatbrain-backend -f
  ```
- Nginx:
  ```bash
  tail -f /var/log/nginx/error.log
  ```

### **6.3 Updating the Application**
To deploy updates:
```bash
cd /var/www/chatbrain
git pull
npm run build
pm2 restart chatbrain-frontend
systemctl restart chatbrain-backend
```

---

## **7. Accessing the Application**
- Frontend: `https://chatbrain.chat`
- Backend: `https://chatbrain.chat/api`

---

## **8. Troubleshooting**
- **DNS Issues**: Use `dig chatbrain.chat` to verify DNS propagation.
- **Port Conflicts**: Check open ports with `sudo netstat -tuln`.
- **Permissions**: Ensure correct file permissions with `sudo chown -R root:root /var/www/chatbrain`.