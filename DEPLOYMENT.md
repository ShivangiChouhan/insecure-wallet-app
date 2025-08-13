# Deployment Guide

## 🚀 Deployment Options

### Local Development Deployment

#### Prerequisites
- Node.js v18+ installed
- npm or yarn package manager
- Git (for cloning)

#### Steps
1. **Clone and Setup:**
```bash
git clone <repository-url>
cd insecure-wallet-app
npm install
```

2. **Run Insecure Version:**
```bash
npm start
# Access at http://localhost:3000
```

3. **Run Secure Version:**
```bash
node server-secure.js
# Access at http://localhost:3001
```

### Production-Like Deployment

#### Using PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start insecure version
pm2 start server.js --name "wallet-insecure"

# Start secure version
pm2 start server-secure.js --name "wallet-secure"

# View status
pm2 status

# View logs
pm2 logs wallet-insecure
pm2 logs wallet-secure
```

#### Using Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000 3001

# Default to insecure version (for educational purposes)
CMD ["node", "server.js"]
```

**Build and Run:**
```bash
# Build image
docker build -t insecure-wallet .

# Run insecure version
docker run -p 3000:3000 insecure-wallet

# Run secure version
docker run -p 3001:3001 insecure-wallet node server-secure.js
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  wallet-insecure:
    build: .
    ports:
      - "3000:3000"
    command: node server.js
    environment:
      - NODE_ENV=development
      
  wallet-secure:
    build: .
    ports:
      - "3001:3001"
    command: node server-secure.js
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-super-secure-secret-here
```

### Cloud Deployment

#### Heroku Deployment

1. **Prepare for Heroku:**
```bash
# Install Heroku CLI
# Create Procfile
echo "web: node server.js" > Procfile

# Initialize git repository
git init
git add .
git commit -m "Initial commit"
```

2. **Deploy to Heroku:**
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secure-secret

# Deploy
git push heroku main
```

#### AWS EC2 Deployment

1. **Launch EC2 Instance:**
   - Choose Ubuntu 22.04 LTS
   - Configure security groups (ports 22, 3000, 3001)
   - Launch with key pair

2. **Setup on EC2:**
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup application
git clone <repository-url>
cd insecure-wallet-app
npm install

# Install PM2
sudo npm install -g pm2

# Start applications
pm2 start server.js --name wallet-insecure
pm2 start server-secure.js --name wallet-secure

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

3. **Configure Nginx (Optional):**
```bash
# Install Nginx
sudo apt install nginx

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/wallet
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /insecure/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /secure/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Configuration

### Environment Variables

**For Production (Secure Version):**
```bash
NODE_ENV=production
JWT_SECRET=your-super-secure-64-character-secret-here
PORT=3001
RATE_LIMIT_WINDOW=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_ATTEMPTS=5
```

**For Development:**
```bash
NODE_ENV=development
PORT=3000
```

### Configuration Files

**Create `.env` file:**
```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

**.env.example:**
```
NODE_ENV=development
JWT_SECRET=generate-a-secure-secret-here
PORT=3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_ATTEMPTS=5
```

## 🛡️ Security Considerations for Deployment

### For Educational/Demo Environments:

1. **Network Isolation:**
   - Deploy in isolated network/VPC
   - Restrict access to authorized users only
   - Use VPN or bastion hosts for access

2. **Monitoring:**
   - Enable application logging
   - Monitor for unusual activity
   - Set up alerts for security events

3. **Access Control:**
   - Use strong authentication for server access
   - Implement IP whitelisting
   - Regular security updates

### For Production (Secure Version Only):

1. **HTTPS/TLS:**
```bash
# Install SSL certificate (Let's Encrypt example)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

2. **Database Security:**
   - Replace in-memory storage with secure database
   - Use connection encryption
   - Implement proper backup strategies

3. **Application Security:**
   - Use environment variables for secrets
   - Implement proper logging and monitoring
   - Regular security audits and updates

## 📊 Monitoring and Logging

### Application Monitoring

**Using PM2 Monitoring:**
```bash
# Monitor processes
pm2 monit

# View detailed logs
pm2 logs --lines 100

# Restart applications
pm2 restart all
```

**Custom Logging Setup:**
```javascript
// Add to server files
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Security Monitoring

**Log Security Events:**
- Failed login attempts
- Admin actions
- Unusual API access patterns
- Error rates and types

## 🔄 Continuous Integration/Deployment

### GitHub Actions Example

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to server
      run: |
        # Add deployment script here
        echo "Deploying to production server"
```

## 🧪 Testing Deployment

### Health Checks

**Test Insecure Version:**
```bash
curl http://localhost:3000/api/health
# Should return error (endpoint doesn't exist)
```

**Test Secure Version:**
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"healthy","timestamp":"...","version":"2.0.0-secure"}
```

### Functionality Tests

**Registration Test:**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"123"}'
```

**Login Test:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use:**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

2. **Permission Denied:**
```bash
# Fix file permissions
chmod +x server.js
chmod +x server-secure.js
```

3. **Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

4. **Memory Issues:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.js
```

### Logs and Debugging

**Enable Debug Mode:**
```bash
DEBUG=* node server.js
```

**Check Application Logs:**
```bash
# PM2 logs
pm2 logs

# System logs
sudo journalctl -u nginx
sudo tail -f /var/log/nginx/error.log
```

## 📋 Deployment Checklist

### Pre-Deployment:
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Security settings reviewed
- [ ] Backup strategy in place
- [ ] Monitoring configured

### Post-Deployment:
- [ ] Health checks passing
- [ ] Functionality tests completed
- [ ] Security tests performed
- [ ] Monitoring alerts configured
- [ ] Documentation updated

### Security Checklist:
- [ ] Strong JWT secrets configured
- [ ] HTTPS enabled (production)
- [ ] Rate limiting active
- [ ] Error handling sanitized
- [ ] Access logs enabled
- [ ] Regular security updates scheduled

---

**Note:** Always test deployments in a staging environment before production deployment. For educational purposes, clearly label and isolate insecure versions to prevent accidental exposure.

