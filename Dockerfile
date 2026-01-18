# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from server folder
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy server source code
COPY server/ ./

# Expose port
EXPOSE 3000

# Set environment variable
ENV PORT=3000

# Start the server
CMD ["node", "index.js"]
