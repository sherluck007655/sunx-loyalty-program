# 🐳 SunX Loyalty Program - Docker Quick Reference

## 🚀 Essential Commands

### Start the Application
```bash
# Start all services (first time)
docker-compose up --build

# Start all services (subsequent times)
docker-compose up

# Start in background (detached mode)
docker-compose up -d
```

### Stop the Application
```bash
# Stop all services (graceful)
docker-compose down

# Stop and remove all data
docker-compose down -v

# Force stop all containers
docker-compose kill
```

### View Status
```bash
# Check running containers
docker ps

# Check all containers (including stopped)
docker ps -a

# View resource usage
docker stats
```

### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f backend

# View last 50 lines
docker-compose logs --tail=50 backend
```

### Database Operations
```bash
# Seed database with sample data
docker-compose exec backend node scripts/seedData.js

# Access MongoDB shell
docker-compose exec mongodb mongo -u admin -p password123

# Backup database
docker-compose exec mongodb mongodump --host localhost --port 27017 --username admin --password password123 --authenticationDatabase admin --db sunx_loyalty --out /backup

# Restore database
docker-compose exec mongodb mongorestore --host localhost --port 27017 --username admin --password password123 --authenticationDatabase admin --db sunx_loyalty /backup/sunx_loyalty
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mongodb

# Rebuild and restart
docker-compose up --build
```

### Execute Commands in Containers
```bash
# Open bash shell in backend container
docker-compose exec backend bash

# Run a command in backend container
docker-compose exec backend npm install

# Run a command in frontend container
docker-compose exec frontend npm run build
```

### Cleanup Commands
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a

# Remove specific containers
docker rm sunx-frontend sunx-backend sunx-mongodb

# Remove specific images
docker rmi sunx-frontend sunx-backend
```

## 🔧 Troubleshooting Commands

### Check Container Health
```bash
# Inspect container details
docker inspect sunx-backend

# Check container processes
docker-compose top

# View container resource usage
docker stats sunx-backend
```

### Network Issues
```bash
# List Docker networks
docker network ls

# Inspect network details
docker network inspect sunx-loyalty_default

# Test connectivity between containers
docker-compose exec backend ping mongodb
```

### Port Issues
```bash
# Check which ports are in use
netstat -tulpn | grep :3000    # Linux/Mac
netstat -ano | findstr :3000   # Windows

# Kill process using port
sudo kill -9 $(lsof -t -i:3000)  # Linux/Mac
taskkill /PID <PID> /F            # Windows
```

### Volume Issues
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect sunx-loyalty_mongodb_data

# Remove volume (WARNING: This deletes data)
docker volume rm sunx-loyalty_mongodb_data
```

## 📊 Monitoring Commands

### Real-time Monitoring
```bash
# Watch container stats
watch docker stats

# Monitor logs continuously
docker-compose logs -f --tail=100

# Monitor specific service
docker-compose logs -f backend | grep ERROR
```

### Health Checks
```bash
# Check API health
curl http://localhost:5000/health

# Check frontend
curl http://localhost:3000

# Check MongoDB connection
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));
"
```

## 🛠 Development Commands

### Code Changes
```bash
# Rebuild after code changes
docker-compose up --build

# Rebuild specific service
docker-compose build backend
docker-compose up backend

# Force rebuild (no cache)
docker-compose build --no-cache
```

### Environment Variables
```bash
# View environment variables in container
docker-compose exec backend env

# Run with different environment file
docker-compose --env-file .env.production up
```

### Database Management
```bash
# Create database backup
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/sunx_loyalty?authSource=admin" --out=/backup

# Reset database (WARNING: Deletes all data)
docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin --eval "db.getSiblingDB('sunx_loyalty').dropDatabase()"

# View database collections
docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --eval "show collections"
```

## 🚨 Emergency Commands

### Complete Reset
```bash
# Stop everything and remove all data
docker-compose down -v

# Remove all containers and images
docker system prune -a

# Start fresh
docker-compose up --build
```

### Fix Common Issues
```bash
# Fix permission issues (Linux/Mac)
sudo chown -R $USER:$USER .

# Fix port conflicts
docker-compose down
sudo lsof -ti:3000,5000,27017 | xargs sudo kill -9
docker-compose up

# Fix memory issues
docker system prune -a
docker-compose up --build
```

## 📋 Quick Setup Checklist

### First Time Setup
- [ ] Install Docker Desktop
- [ ] Download project files
- [ ] Create `.env` file
- [ ] Run `docker-compose up --build`
- [ ] Seed database: `docker-compose exec backend node scripts/seedData.js`
- [ ] Test at http://localhost:3000

### Daily Development
- [ ] Start: `docker-compose up`
- [ ] Make code changes
- [ ] Rebuild if needed: `docker-compose up --build`
- [ ] Stop: `docker-compose down`

### Troubleshooting Steps
1. Check logs: `docker-compose logs`
2. Check containers: `docker ps`
3. Restart services: `docker-compose restart`
4. Rebuild: `docker-compose up --build`
5. Reset: `docker-compose down -v && docker-compose up --build`

## 🌐 URLs to Remember

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Admin Panel**: http://localhost:3000/admin/login

## 🔑 Demo Credentials

- **Installer**: ahmed.ali@example.com / password123
- **Admin**: admin@sunx.com / admin123

## 📞 Quick Help

### Container Not Starting?
```bash
docker-compose logs [service-name]
docker-compose restart [service-name]
```

### Database Issues?
```bash
docker-compose restart mongodb
docker-compose logs mongodb
```

### Port Already in Use?
```bash
docker-compose down
# Kill processes using ports 3000, 5000, 27017
docker-compose up
```

### Need Fresh Start?
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

**💡 Pro Tip**: Save this file as a bookmark for quick reference during development!
