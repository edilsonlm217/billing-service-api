# Use the official Node.js image.
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Install pnpm using npm (it vai funcionar bem no Linux)
RUN npm install -g pnpm

# Copy the package.json and pnpm-lock.yaml files
COPY package.json pnpm-lock.yaml ./

# Install the dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the app
RUN pnpm run build

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]
