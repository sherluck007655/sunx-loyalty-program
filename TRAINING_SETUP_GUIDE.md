# 🎓 Training & Download Center Setup Guide

## 🚀 Quick Demo (No MongoDB Required)

To test the training system immediately without setting up MongoDB:

```bash
# Install dependencies
npm install express cors

# Run the demo server
node test-training-system.js
```

Then visit:
- **Training Center**: http://localhost:3001/training
- **Download Center**: http://localhost:3001/downloads

## 📋 Full Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended)

**Advantages**: No local installation, free tier, automatic backups

1. **Create Account**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Sign up for free account

2. **Create Cluster**:
   - Click "Create" → "Shared" (Free)
   - Choose a region close to you
   - Click "Create Cluster"
   - Wait 2-3 minutes for deployment

3. **Setup Database Access**:
   - Go to "Database Access" → "Add New Database User"
   - Create username/password
   - Set permissions to "Read and write to any database"

4. **Setup Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)

5. **Get Connection String**:
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

6. **Update Environment**:
   ```bash
   # Edit backend/.env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sunx-loyalty
   ```

7. **Run Migrations**:
   ```bash
   node migrations/migration-runner.js up
   ```

### Option 2: Local MongoDB Installation

**Advantages**: Full control, no internet required

1. **Download MongoDB**:
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select "Windows" and download MSI installer

2. **Install MongoDB**:
   - Run the MSI installer
   - Choose "Complete" installation
   - Install as Windows Service ✅
   - Install MongoDB Compass (GUI tool) ✅

3. **Start MongoDB**:
   ```bash
   # MongoDB should start automatically as service
   # If not, start manually:
   net start MongoDB
   ```

4. **Update Environment**:
   ```bash
   # Edit backend/.env
   MONGODB_URI=mongodb://localhost:27017/sunx-loyalty
   ```

5. **Run Migrations**:
   ```bash
   node migrations/migration-runner.js up
   ```

### Option 3: Docker (If Docker is Available)

```bash
# Start MongoDB container
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Update backend/.env
MONGODB_URI=mongodb://localhost:27017/sunx-loyalty

# Run migrations
node migrations/migration-runner.js up
```

## 🔧 Running the Full Application

Once MongoDB is set up and migrations are complete:

```bash
# Start backend (from backend directory)
cd backend
npm run dev

# Start frontend (from frontend directory)
cd frontend
npm start
```

## 📱 Testing the Training System

### Training Features to Test:

1. **Training Categories**:
   - Visit `/training`
   - Browse categories: Application Training, Inverter Settings, Battery Installation
   - Click on categories to view videos

2. **Video Player**:
   - Click on any video to open player
   - Test YouTube/Facebook video embedding
   - Check related videos sidebar

3. **Search & Filters**:
   - Use search bar to find videos
   - Filter by difficulty level
   - Browse by category

### Download Center Features to Test:

1. **Document Categories**:
   - Visit `/downloads`
   - Browse categories: Inverter Docs, Battery Docs, etc.
   - Click on categories to view documents

2. **Document Management**:
   - View document details
   - Test download functionality
   - Filter by document type and file type

3. **Search**:
   - Search for specific documents
   - Filter by category and type

## 👨‍💼 Admin Features

Access admin panel at `/admin/dashboard` to:

1. **Manage Training**:
   - Create/edit training categories
   - Add videos from YouTube, Facebook, Vimeo
   - Set difficulty levels and featured status
   - View analytics

2. **Manage Documents**:
   - Create/edit document categories
   - Upload files (PDF, DOC, XLS, etc.)
   - Categorize and tag documents
   - Track download statistics

## 🎯 Adding Content

### Adding Training Videos:

1. **Get Video URLs**:
   - YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Facebook: `https://www.facebook.com/watch/?v=VIDEO_ID`
   - Vimeo: `https://vimeo.com/VIDEO_ID`

2. **Add via Admin Panel**:
   - Go to Admin → Training → Videos
   - Click "Add New Video"
   - Paste video URL (system auto-extracts ID)
   - Set title, description, difficulty
   - Choose category and save

### Adding Documents:

1. **Prepare Files**:
   - Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR
   - Max size: 50MB per file

2. **Upload via Admin Panel**:
   - Go to Admin → Documents → Upload
   - Choose file and category
   - Set title, description, type
   - Add tags for better searchability

## 🛠️ Troubleshooting

### MongoDB Connection Issues:

```bash
# Check if MongoDB is running
# For Windows Service:
sc query MongoDB

# For local installation:
tasklist | findstr mongod

# Check connection
mongo --eval "db.runCommand('ping')"
```

### Migration Issues:

```bash
# Check migration status
node migrations/migration-runner.js status

# Reset migrations (if needed)
node migrations/migration-runner.js down-all
node migrations/migration-runner.js up
```

### Port Conflicts:

If ports 3000 or 5000 are in use:

```bash
# Change frontend port
# In frontend/package.json, add:
"scripts": {
  "start": "PORT=3001 react-scripts start"
}

# Change backend port
# In backend/.env:
PORT=5001
```

## 📞 Support

If you encounter issues:

1. **Check Logs**: Look at console output for error messages
2. **Verify Environment**: Ensure `.env` file has correct MongoDB URI
3. **Test Connection**: Use MongoDB Compass to verify database connection
4. **Clear Cache**: Clear browser cache and restart servers

## 🎉 Success!

Once everything is working, you'll have:

✅ **Professional Training Center** with video embedding  
✅ **Document Download Center** with file management  
✅ **Admin Management Panel** for content control  
✅ **Mobile-Responsive Design** for all devices  
✅ **Analytics & Tracking** for engagement insights  

Your loyalty program now includes a complete learning management system! 🚀
