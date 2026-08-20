FROM node:18-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package.json ./
RUN npm install

# Copy source files
COPY . .

# Build standard standalone next.js bundle
RUN npm run build

# Expose port
EXPOSE 3000

# Start development or production server
CMD ["npm", "run", "start"]
