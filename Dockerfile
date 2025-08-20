# ---- Stage 1: Build ----
# Use the official Node.js 20 Alpine image as a base for building.
# Alpine is a lightweight version of Linux, which makes our container smaller.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker's layer caching.
# This means 'npm install' only re-runs if these files change.
COPY package*.json ./

# Install all dependencies, including devDependencies needed for the build
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the frontend (Vite) and backend (esbuild) for production
RUN npm run build


# ---- Stage 2: Production ----
# Start from a fresh, clean Node.js image for the final container.
FROM node:20-alpine AS production

WORKDIR /app

# Copy only the built application from the 'builder' stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install ONLY production dependencies to keep the final container small
RUN npm install

# Expose the port the app runs on
EXPOSE 5000

# The command to run when the container starts
CMD ["npm", "run", "start"]