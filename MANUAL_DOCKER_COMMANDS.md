# 🐳 Manual Docker Commands Guide for sherluck007

## 🎯 **Where to Run Commands**

### **Method 1: Command Prompt (Easiest)**
1. **Press `Windows Key + R`**
2. **Type `cmd`** and press Enter
3. **A black terminal window opens**

### **Method 2: PowerShell**
1. **Press `Windows Key + X`**
2. **Click "Windows PowerShell"**

### **Method 3: Docker Desktop Terminal**
1. **Open Docker Desktop**
2. **Click terminal icon**

---

## 🚀 **Commands to Copy and Paste**

### **Step 1: Check Docker (Copy this line)**
```
docker --version
```
**Expected Output:** `Docker version 20.x.x` or similar

---

### **Step 2: Login to Docker Hub (Copy this line)**
```
docker login
```
**What happens:**
- It will ask for **Username**: Type `sherluck007`
- It will ask for **Password**: Type your Docker Hub password
- You'll see: `Login Succeeded`

---

### **Step 3: Navigate to Your Project (Copy this line)**
```
cd C:\Users\Administrator\Desktop\sunx-loyalty
```

---

### **Step 4: Build Frontend Image (Copy this line)**
```
docker build -t sherluck007/sunx-loyalty-frontend:latest ./frontend
```
**What happens:**
- You'll see lots of text scrolling
- Takes 2-5 minutes
- Ends with: `Successfully tagged sherluck007/sunx-loyalty-frontend:latest`

---

### **Step 5: Build Backend Image (Copy this line)**
```
docker build -t sherluck007/sunx-loyalty-backend:latest ./backend
```
**What happens:**
- More text scrolling
- Takes 1-3 minutes
- Ends with: `Successfully tagged sherluck007/sunx-loyalty-backend:latest`

---

### **Step 6: Push Frontend to Docker Hub (Copy this line)**
```
docker push sherluck007/sunx-loyalty-frontend:latest
```
**What happens:**
- Shows upload progress bars
- Takes 2-10 minutes depending on internet
- Ends with: `latest: digest: sha256:...`

---

### **Step 7: Push Backend to Docker Hub (Copy this line)**
```
docker push sherluck007/sunx-loyalty-backend:latest
```
**What happens:**
- More upload progress
- Takes 1-5 minutes
- Ends with: `latest: digest: sha256:...`

---

### **Step 8: Verify Everything Worked (Copy this line)**
```
docker images
```
**Expected Output:**
```
REPOSITORY                           TAG       IMAGE ID       CREATED         SIZE
sherluck007/sunx-loyalty-frontend   latest    abc123def456   2 minutes ago   500MB
sherluck007/sunx-loyalty-backend    latest    def456ghi789   3 minutes ago   200MB
```

---

## 🎯 **All Commands in One Block (Copy Everything Below)**

```
docker --version
docker login
cd C:\Users\Administrator\Desktop\sunx-loyalty
docker build -t sherluck007/sunx-loyalty-frontend:latest ./frontend
docker build -t sherluck007/sunx-loyalty-backend:latest ./backend
docker push sherluck007/sunx-loyalty-frontend:latest
docker push sherluck007/sunx-loyalty-backend:latest
docker images
```

---

## ⚠️ **Before You Start**

### **1. Make Sure Docker Desktop is Running**
- Look for Docker whale icon in system tray (bottom right)
- If not running, start Docker Desktop application
- Wait until icon shows "Docker Desktop is running"

### **2. Create Frontend Repository on Docker Hub**
- Go to https://hub.docker.com
- Login with `sherluck007`
- Click "Create Repository"
- Name: `sunx-loyalty-frontend`
- Make it **Public**
- Click "Create"

---

## 🚨 **If You Get Errors**

### **"docker: command not found"**
- Docker Desktop is not installed or not running
- Download from: https://www.docker.com/products/docker-desktop

### **"repository does not exist"**
- You need to create the repository on Docker Hub first
- Go to hub.docker.com and create `sunx-loyalty-frontend`

### **"access denied"**
- Run `docker login` again
- Make sure username is `sherluck007`

---

## ✅ **Success Indicators**

You'll know it worked when:
1. ✅ Both images build without errors
2. ✅ Both images push to Docker Hub successfully
3. ✅ You can see your images at:
   - https://hub.docker.com/r/sherluck007/sunx-loyalty-frontend
   - https://hub.docker.com/r/sherluck007/sunx-loyalty-backend

---

## 🎉 **After Success**

Your images will be available worldwide at:
- `docker pull sherluck007/sunx-loyalty-frontend:latest`
- `docker pull sherluck007/sunx-loyalty-backend:latest`

**Ready for one-command deployment on any server!** 🚀
