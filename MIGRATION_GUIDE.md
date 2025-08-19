# 🚀 Analogy AI - Complete Migration Guide from Replit to Local Machine

This guide provides a complete, step-by-step migration process to run your Analogy AI project locally with identical functionality to Replit.

## 📋 Project Overview

**Project Type**: Full-stack Node.js TypeScript Application  
**Main Entry Point**: `server/index.ts`  
**Frontend**: React + TypeScript + Vite  
**Backend**: Express.js + TypeScript  
**Database**: PostgreSQL (currently uses Neon Database)  
**Authentication**: OpenID Connect with Replit Auth  
**AI Integration**: OpenAI GPT-4o API  

### Replit-Specific Files Explained
- `.replit` - Replit configuration (modules, run commands, ports)
- `replit.md` - Project documentation and architecture notes  
- `@replit/vite-plugin-*` - Replit-specific Vite plugins (will be removed)

## 🏗️ System Requirements & Dependencies

### Required Software Versions
- **Node.js**: 20.x (LTS)
- **npm**: Comes with Node.js
- **PostgreSQL**: 16.x (local database)
- **Git**: Latest version

### All Project Dependencies

#### Production Dependencies (82 packages)
```json
{
  "@hookform/resolvers": "^3.10.0",
  "@neondatabase/serverless": "^0.10.4",
  "@radix-ui/react-*": "Multiple UI components",
  "@tanstack/react-query": "^5.60.5",
  "express": "^4.21.2",
  "react": "^18.3.1",
  "openai": "^5.12.2",
  "drizzle-orm": "^0.39.1",
  "typescript": "5.6.3",
  "zod": "^3.24.2"
}
```

#### Development Dependencies (23 packages)
```json
{
  "vite": "^5.4.19",
  "@vitejs/plugin-react": "^4.3.2",
  "tailwindcss": "^3.4.17",
  "drizzle-kit": "^0.30.4",
  "tsx": "^4.19.1",
  "esbuild": "^0.25.0"
}
```

## 🖥️ Local Environment Setup

### Windows Setup
```powershell
# Install Node.js 20
# Download from: https://nodejs.org/en/download/
# Or use Chocolatey:
choco install nodejs --version=20.15.1

# Install PostgreSQL 16
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql16 --params '/Password:yourpassword'

# Install Git
# Download from: https://git-scm.com/download/win
winget install Git.Git
```

### macOS Setup
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js 20
brew install node@20
brew link node@20

# Install PostgreSQL 16
brew install postgresql@16
brew services start postgresql@16

# Install Git
brew install git
```

### Linux (Ubuntu/Debian) Setup
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 16
sudo apt install postgresql-16 postgresql-client-16 postgresql-contrib-16

# Install Git
sudo apt install git

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🔐 Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/analogyai
PGHOST=localhost
PGPORT=5432
PGDATABASE=analogyai
PGUSER=your_username
PGPASSWORD=your_password

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Security (generate a random 32-character string)
SESSION_SECRET=your_super_secret_session_key_here_32_chars_min

# Authentication (for local development, these can be placeholders)
REPL_ID=local-dev
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=localhost
```

### Generate SESSION_SECRET
```bash
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🗄️ Database Setup

### PostgreSQL Local Setup

#### Create Database and User
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create user and database
CREATE USER your_username WITH PASSWORD 'your_password';
CREATE DATABASE analogyai OWNER your_username;
GRANT ALL PRIVILEGES ON DATABASE analogyai TO your_username;

# Exit PostgreSQL
\q
```

#### Test Database Connection
```bash
# Test connection
psql -h localhost -U your_username -d analogyai -c "SELECT version();"
```

## 📥 Migration Steps

### Step 1: Clone/Download Project
```bash
# If you have git access to your Replit project:
git clone https://replit.com/@yourusername/your-repl-name.git analogy-ai
cd analogy-ai

# Alternative: Download as ZIP from Replit and extract
# File > Download as zip, then extract to analogy-ai folder
```

### Step 2: Clean Replit-Specific Files
Remove or modify Replit-specific configurations:

```bash
# Remove Replit-specific files (optional, they won't interfere locally)
rm -f .replit replit.nix

# Note: Keep replit.md as it contains useful project documentation
```

### Step 3: Update Vite Configuration
Create a `vite.config.local.ts` to remove Replit plugins:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: "localhost",
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
```

### Step 4: Install Dependencies
```bash
# Install all dependencies
npm install

# Install additional development tools (optional)
npm install -g tsx nodemon
```

### Step 5: Setup Environment Variables
```bash
# Copy the .env template and fill in your values
cp .env.example .env
# Edit .env with your actual values

# For Windows users:
copy .env.example .env
# Edit .env with notepad or your preferred editor
```

### Step 6: Database Migration
```bash
# Push database schema to your local PostgreSQL
npm run db:push

# This will create all necessary tables using Drizzle ORM
```

### Step 7: Authentication Adaptation
The original app uses Replit's OpenID Connect. For local development, you have two options:

#### Option A: Mock Authentication (Simplest)
Create `server/mockAuth.ts`:
```typescript
import type { RequestHandler } from "express";

export const mockAuth: RequestHandler = (req, res, next) => {
  // Mock user session for local development
  req.user = {
    claims: {
      sub: "local-user-123",
      email: "test@local.dev",
      first_name: "Test",
      last_name: "User",
      profile_image_url: "https://via.placeholder.com/150"
    }
  };
  next();
};

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
```

Update `server/routes.ts` to use mock auth:
```typescript
// Replace Replit auth import with mock auth for local development
import { mockAuth, isAuthenticated } from "./mockAuth";

// Add mock auth middleware before other routes
app.use(mockAuth);
```

#### Option B: Setup Local OAuth (Advanced)
Follow OAuth setup documentation for your preferred provider (Google, GitHub, etc.)

## 🚀 Running the Application

### Development Mode
```bash
# Start the development server
npm run dev

# This will start both frontend (Vite) and backend (Express) servers
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# The app will be available at: http://localhost:5000
```

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start

# Application will be available at: http://localhost:5000
```

## ✅ Testing & Verification

### Test Checklist
1. **Database Connection**: Verify PostgreSQL is running and accessible
2. **Environment Variables**: Ensure all required vars are set
3. **Dependencies**: All npm packages installed successfully
4. **Authentication**: Mock user can access protected routes
5. **AI Integration**: OpenAI API calls work with your API key
6. **Frontend**: React app loads at localhost:5000
7. **API Endpoints**: Backend responds to /api/* routes

### Verification Commands
```bash
# Check Node.js version
node --version  # Should be v20.x.x

# Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1;"

# Check if all dependencies are installed
npm list --depth=0

# Test TypeScript compilation
npm run check

# Test database schema
npm run db:push
```

### Test Application Features
1. **Landing Page**: Should load with glassmorphism design
2. **Authentication**: Should automatically log in with mock user
3. **Analogy Generation**: Test with OpenAI API key
4. **Database Operations**: Create, read, update, delete analogies
5. **History**: View past analogies
6. **Favorites**: Add/remove favorites

## 🐛 Common Issues & Troubleshooting

### Issue 1: Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process and restart
```

### Issue 2: Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Test connection manually
psql -h localhost -U your_username -d analogyai
```

### Issue 3: OpenAI API Errors
- Verify API key is valid and has credits
- Check network connectivity
- Ensure API key has GPT-4o access

### Issue 4: Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: TypeScript Errors
```bash
# Check TypeScript configuration
npm run check

# Update TypeScript if needed
npm install typescript@latest
```

## 🐳 Optional: Docker Setup

For guaranteed reproducibility, create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
```

And `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/analogyai
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: analogyai
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 🎯 Final Launch Command

Once everything is set up, use this single command to start your application:

```bash
# Make sure PostgreSQL is running, then:
npm run dev
```

Your Analogy AI application will be available at: `http://localhost:5000`

## 📝 Additional Notes

### Key Differences from Replit
1. **Database**: Uses local PostgreSQL instead of Replit's managed database
2. **Authentication**: Uses mock authentication instead of Replit OAuth
3. **Environment**: Local environment variables instead of Replit secrets
4. **Port Configuration**: Uses localhost:5000 instead of Replit's port mapping
5. **File Watching**: Uses local file system instead of Replit's cloud filesystem

### Performance Considerations
- Local database will be faster than remote Neon database
- No network latency for file operations
- Direct filesystem access for faster development

### Security Notes
- Never commit `.env` file to version control
- Use strong, unique SESSION_SECRET for production
- Rotate API keys regularly
- Set up proper authentication for production deployment

---

**🎉 Success!** Your Analogy AI application should now be running locally with identical functionality to the Replit version. If you encounter any issues, refer to the troubleshooting section or check the project's `replit.md` file for additional context.