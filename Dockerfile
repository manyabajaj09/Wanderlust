# 1. Use official Node image
FROM node:18

# 2. Set the working directory
WORKDIR /app

# 3. Copy package files and install deps
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the project files
COPY . .

# 5. Expose port
EXPOSE 3000

# 6. Command to start the app
CMD ["node", "app.js"]
