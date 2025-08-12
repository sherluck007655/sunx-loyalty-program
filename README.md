# 🌞 SunX Loyalty Program

A comprehensive loyalty program web application for solar installers built with React.js, Node.js, Express, and MongoDB. This application rewards installers for their solar inverter installations with a points-based system, milestone tracking, and promotional campaigns.

![SunX Logo](https://img.shields.io/badge/SunX-Loyalty%20Program-orange?style=for-the-badge&logo=sun)

## 🚀 Quick Start

**The fastest way to get started:**

```bash
# Clone the repository
git clone <repository-url>
cd sunx-loyalty-program

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Start the application (with mock data for testing)
node start-app.js
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

**Test Credentials:**
- Installer: `test@example.com` / `password123`
- Admin: `admin@sunx.com` / `admin123`

## 🌟 Features Overview

### 👨‍🔧 For Installers
- ✅ **User Registration & Authentication**: Secure signup/login with JWT authentication
- ✅ **Unique Loyalty Card ID**: Auto-generated loyalty card (e.g., SUNX-000001)
- ✅ **Serial Number Management**: Submit and track inverter installations
- ✅ **Progress Tracking**: Visual progress bar showing milestone completion (8/10 inverters)
- ✅ **Payment System**: Request and track payments for milestones
- ✅ **Promotions**: Join active promotions and earn bonus rewards
- ✅ **Dark Mode**: Toggle between light and dark themes
- ✅ **Mobile Responsive**: Fully responsive design for all devices
- ✅ **Profile Management**: Update personal and payment details

### 👨‍💼 For Admins
- ✅ **Admin Dashboard**: Comprehensive overview of all activities
- ✅ **Installer Management**: View and manage installer accounts
- ✅ **Payment Approval**: Approve/reject payment requests
- ✅ **Promotion Management**: Create and manage promotional campaigns
- ✅ **Analytics**: View detailed reports and statistics
- ✅ **System Monitoring**: Track application performance and usage

## � Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
**Problem**: Servers don't start or show errors
**Solutions**:
```bash
# Check if ports are available
netstat -an | findstr :3000
netstat -an | findstr :5000

# Kill processes using the ports if needed
# Then restart with:
node start-app.js
```

#### 2. Payment Request Button Not Working
**Problem**: Button clicks don't work or API calls fail
**Solutions**:
- Ensure backend server is running on port 5000
- Check browser console for JavaScript errors
- Verify API endpoint is accessible: http://localhost:5000/api/test

#### 3. Database Connection Issues
**Problem**: MongoDB connection errors
**Solutions**:
```bash
# Option 1: Install MongoDB locally
# Download from: https://www.mongodb.com/try/download/community
# Start with: mongod

# Option 2: Use MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env file

# Option 3: Use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

#### 4. Registration/Login Issues
**Problem**: Can't register or login
**Solutions**:
- Use test credentials: `test@example.com` / `password123`
- Check if backend is running
- Clear browser localStorage and try again

#### 5. Serial Number Submission Fails
**Problem**: Can't add serial numbers
**Solutions**:
- Ensure you're logged in as an installer
- Check serial number format (6-20 alphanumeric characters)
- Verify backend API is accessible

### Getting Help
If you're still having issues:
1. Check the browser console for errors
2. Check the backend terminal for error messages
3. Ensure all dependencies are installed: `npm install`
4. Try restarting both servers

## �🛠 Technology Stack

### Frontend
- **React.js 18** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form management and validation
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Heroicons** - Beautiful SVG icons
- **Framer Motion** - Animation library
- **Chart.js** - Data visualization

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation middleware
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

### DevOps & Deployment
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container orchestration
- **MongoDB Atlas** - Cloud database option

## 🚀 Complete Setup Guide for Beginners

### 📋 Prerequisites (What You Need First)

Before starting, you need to install these programs on your computer:

#### Step 1: Install Node.js
1. **Visit** https://nodejs.org/
2. **Download** the "LTS" version (recommended)
3. **Run the installer** and follow the setup wizard
4. **Accept all default settings**
5. **Verify installation** by opening Command Prompt and typing:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers like `v18.17.0` and `9.6.7`

#### Step 2: Install MongoDB
**Option A: Local MongoDB (Advanced Users)**
1. **Visit** https://www.mongodb.com/try/download/community
2. **Download** MongoDB Community Server for Windows
3. **Install** with default settings
4. **Check** "Install MongoDB as a Service"
5. **Also install** MongoDB Compass (GUI tool)

**Option B: MongoDB Atlas (Recommended for Beginners)**
1. **Visit** https://www.mongodb.com/atlas
2. **Create** a free account
3. **Create** a free cluster
4. **Get** your connection string (save it for later)

#### Step 3: Install Git (Optional)
1. **Visit** https://git-scm.com/download/win
2. **Download** and **install** Git for Windows
3. **Accept** all default settings

### 🛠 Project Setup

#### Step 4: Download the Project
Make sure all project files are in a folder like:
```
C:\Users\YourName\Desktop\SunX-Loyalty-Program
```

#### Step 5: Open Command Prompt
1. **Navigate** to your project folder in File Explorer
2. **Hold Shift** and **right-click** in empty space
3. **Select** "Open PowerShell window here"
4. **Or** use Windows + R, type `cmd`, then navigate:
   ```bash
   cd "C:\Users\YourName\Desktop\SunX-Loyalty-Program"
   ```

#### Step 6: Install All Dependencies
Run these commands one by one (each may take 2-5 minutes):

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### Step 7: Configure Environment
1. **Find** the file `.env.example` in your project folder
2. **Copy** it and **rename** the copy to `.env`
3. **Open** `.env` with Notepad and update:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/sunx_loyalty
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
ADMIN_EMAIL=admin@sunx.com
ADMIN_PASSWORD=admin123
REACT_APP_API_URL=http://localhost:5000/api
```

**For MongoDB Atlas:**
```env
MONGODB_URI=your-mongodb-atlas-connection-string-here
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
ADMIN_EMAIL=admin@sunx.com
ADMIN_PASSWORD=admin123
REACT_APP_API_URL=http://localhost:5000/api
```

#### Step 8: Start MongoDB (Local Only)
If using local MongoDB:
1. **Press** Windows + R
2. **Type** `services.msc` and press Enter
3. **Find** "MongoDB" and make sure it's running

#### Step 9: Add Sample Data
```bash
cd backend
node scripts/seedData.js
cd ..
```

You should see:
```
MongoDB Connected for seeding...
Super admin created: admin@sunx.com
3 promotions created
3 sample installers created
Database seeding completed successfully!
```

#### Step 10: Start the Application
```bash
npm run dev
```

Wait for these messages:
```
Server running on port 5000
MongoDB Connected
webpack compiled successfully
Local: http://localhost:3000
```

#### Step 11: Test the Application
1. **Open** your browser
2. **Go to** http://localhost:3000
3. **You should see** the beautiful SunX landing page!

## 🧪 Testing the Application

### 🔐 Demo Credentials

**Installer Account:**
- Email: `ahmed.ali@example.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@sunx.com`
- Password: `admin123`

### 📱 Feature Testing Guide

#### Test 1: Landing Page
1. **Visit** http://localhost:3000
2. **Check** SunX branding and orange colors
3. **Try** dark mode toggle (moon/sun icon)
4. **Test** mobile responsiveness (F12 → mobile view)

#### Test 2: User Registration
1. **Click** "Get Started" or "Join Now"
2. **Fill the form:**
   - Name: Your Name
   - Email: test@example.com
   - Phone: +923001234567
   - CNIC: 12345-1234567-1
   - Address: Your complete address
   - Password: password123
3. **Submit** and get redirected to dashboard
4. **Note** your unique loyalty card ID (e.g., SUNX-000004)

#### Test 3: Installer Dashboard
1. **Login** with demo credentials or your new account
2. **Check** progress bar showing "X / 10 Inverters"
3. **View** total points and statistics
4. **Test** navigation between pages
5. **Try** profile updates

#### Test 4: Admin Panel
1. **Visit** http://localhost:3000/admin/login
2. **Login** with admin credentials
3. **Explore** admin dashboard
4. **Check** installer management features
5. **View** system statistics

#### Test 5: Mobile & Dark Mode
1. **Press F12** in browser
2. **Click** mobile device icon
3. **Test** different screen sizes
4. **Toggle** dark mode on different pages
5. **Verify** all features work on mobile

### � Troubleshooting Common Issues

#### Issue: "npm is not recognized"
**Solution:** Restart Command Prompt after installing Node.js

#### Issue: "MongoDB connection failed"
**Solutions:**
- Check MongoDB service is running (services.msc)
- Verify `.env` file has correct MongoDB URI
- For Atlas: Check connection string and network access

#### Issue: "Port 3000 already in use"
**Solutions:**
- Close other applications using port 3000
- Kill the process: `npx kill-port 3000`
- Change port in package.json

#### Issue: "Cannot find module"
**Solutions:**
- Delete `node_modules` folders in root, backend, and frontend
- Run `npm install` again in each directory
- Clear npm cache: `npm cache clean --force`

#### Issue: Application won't start
**Solutions:**
- Check both backend (5000) and frontend (3000) are running
- Look for error messages in Command Prompt
- Ensure MongoDB is connected
- Verify all dependencies are installed

### 📊 What You Should See

#### Landing Page Features:
- ✅ SunX logo with orange branding (#ff831f)
- ✅ "Rewarding Solar Installers" headline
- ✅ Statistics: 500+ installers, 10,000+ inverters
- ✅ Feature showcase with icons
- ✅ "How It Works" section
- ✅ Dark mode toggle
- ✅ Mobile responsive design

#### Installer Dashboard Features:
- ✅ Welcome message with loyalty card ID
- ✅ Progress bar (8/10 inverters example)
- ✅ Points and statistics display
- ✅ Recent installations list
- ✅ Payment history section
- ✅ Quick action buttons
- ✅ Profile management

#### Admin Dashboard Features:
- ✅ System overview statistics
- ✅ Installer management interface
- ✅ Payment approval system
- ✅ Promotion management
- ✅ Clean, professional design

## �🐳 Docker Setup (Alternative Method)

### Using Docker Compose (Recommended for Production)

1. **Install Docker Desktop** from https://www.docker.com/products/docker-desktop
2. **Navigate to project directory**
3. **Start all services:**
   ```bash
   docker-compose up --build
   ```
4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017
5. **Stop services:**
   ```bash
   docker-compose down
   ```

### Individual Docker Commands
```bash
# Build and run backend
cd backend
docker build -t sunx-backend .
docker run -d -p 5000:5000 --name sunx-backend sunx-backend

# Build and run frontend
cd frontend
docker build -t sunx-frontend .
docker run -d -p 3000:3000 --name sunx-frontend sunx-frontend

# Run MongoDB
docker run -d -p 27017:27017 --name sunx-mongodb mongo:6.0
```

## 🎯 Quick Test Checklist

After starting the application, verify these features work:

### ✅ Basic Functionality
- [ ] Landing page loads with SunX branding at http://localhost:3000
- [ ] Dark mode toggle works (moon/sun icon)
- [ ] Registration creates new account successfully
- [ ] Login works with demo credentials
- [ ] Dashboard shows installer information and progress
- [ ] Admin login works at http://localhost:3000/admin/login
- [ ] Admin dashboard displays system statistics
- [ ] Mobile responsive design works (test with F12)
- [ ] No error messages in browser console (F12 → Console)
- [ ] Backend API responds at http://localhost:5000/health

### 🔍 Detailed Testing
- [ ] Profile updates save correctly
- [ ] Progress bar shows correct percentage
- [ ] Loyalty card ID displays properly
- [ ] Navigation between pages works smoothly
- [ ] Forms validate input correctly
- [ ] Toast notifications appear for actions
- [ ] Theme persists after page refresh

## 📱 Application Usage Guide

### 👨‍🔧 For Installers

#### Getting Started
1. **Visit** http://localhost:3000
2. **Click** "Get Started" to register
3. **Fill** registration form with your details
4. **Receive** your unique loyalty card ID (e.g., SUNX-000001)
5. **Login** to access your dashboard

#### Using the Dashboard
1. **View Progress** - See your installation count and progress bar
2. **Check Points** - Monitor your earned loyalty points
3. **Track Milestones** - See how close you are to payment eligibility
4. **Update Profile** - Manage personal and payment information
5. **View History** - Check your installation and payment history

#### Key Features
- **Serial Number Submission** - Add inverter installations (coming soon)
- **Payment Requests** - Request payments after reaching milestones
- **Promotions** - Join active campaigns for bonus rewards
- **Mobile Access** - Use on any device with responsive design

### 👨‍💼 For Admins

#### Admin Access
1. **Visit** http://localhost:3000/admin/login
2. **Login** with admin credentials:
   - Email: admin@sunx.com
   - Password: admin123

#### Admin Functions
1. **Dashboard Overview** - Monitor system statistics
2. **Installer Management** - View and manage installer accounts
3. **Payment Approval** - Review and approve payment requests
4. **Promotion Management** - Create and manage campaigns
5. **System Monitoring** - Track application performance

#### Admin Capabilities
- **User Management** - Activate/deactivate installer accounts
- **Payment Processing** - Approve/reject payment requests
- **Campaign Creation** - Set up promotional campaigns
- **Analytics** - View detailed system reports

## 🧪 Testing

### Demo Credentials

**Installer Account:**
- Email: ahmed.ali@example.com
- Password: password123

**Admin Account:**
- Email: admin@sunx.com
- Password: admin123

### API Testing

```bash
# Health check
curl http://localhost:5000/health

# Test installer registration
curl -X POST http://localhost:5000/api/auth/installer/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+923001234567",
    "password": "password123",
    "cnic": "12345-1234567-1",
    "address": "Test Address"
  }'
```

## 📁 Project Structure

```
sunx-loyalty-program/
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── scripts/            # Database scripts
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static files
├── docker-compose.yml      # Docker composition
├── .env.example           # Environment template
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/sunx_loyalty` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `ADMIN_EMAIL` | Default admin email | `admin@sunx.com` |
| `ADMIN_PASSWORD` | Default admin password | `admin123` |
| `REACT_APP_API_URL` | Frontend API URL | `http://localhost:5000/api` |

### Database Schema

The application uses the following main collections:
- **installers** - Installer user accounts
- **serialnumbers** - Inverter installation records
- **payments** - Payment requests and history
- **promotions** - Promotional campaigns
- **admins** - Admin user accounts

## 🚀 Production Deployment

### Build for Production

```bash
# Build frontend
cd frontend
npm run build

# The build folder contains the production-ready files
```

### Production Environment

1. Set `NODE_ENV=production`
2. Use a secure `JWT_SECRET`
3. Configure proper MongoDB connection
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Configure proper CORS origins

### Security Considerations

- Change default admin credentials
- Use strong JWT secrets
- Enable rate limiting
- Implement proper input validation
- Use HTTPS in production
- Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication and registration
  - Serial number management
  - Payment system
  - Admin panel
  - Promotions system
  - Dark mode support
  - Docker configuration
