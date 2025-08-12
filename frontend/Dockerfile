FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install serve globally first
RUN npm install -g serve

# Copy package files
COPY package*.json ./

# Install dependencies with more robust settings
RUN npm config set registry https://registry.npmjs.org/
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
