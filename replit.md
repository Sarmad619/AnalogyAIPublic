# Analogy AI - Personalized Learning Platform

## Overview

Analogy AI is a web platform that transforms complex concepts into simple, personalized analogies. The application leverages AI to create educational content tailored to individual user interests and knowledge levels. Built as a full-stack TypeScript application, it features a modern React frontend with a glassmorphism design aesthetic and an Express.js backend with AI integration through OpenAI's GPT-4o model.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Custom component library built on Radix UI primitives with Tailwind CSS
- **Design System**: Glassmorphism aesthetic with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with consistent error handling and request logging
- **Session Management**: Simple session-based authentication (MVP implementation)
- **Build System**: ESBuild for production bundling with platform-specific optimizations

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Type-safe schema definitions with Drizzle Kit for migrations
- **Development Storage**: In-memory storage implementation for rapid prototyping
- **Session Storage**: connect-pg-simple for PostgreSQL-backed session storage

### Authentication and Authorization
- **MVP Approach**: Simplified session-based authentication with demo user
- **User Management**: Basic profile system with preferences and personalization settings
- **Authorization**: Simple user ID extraction from session for resource access control

### AI Integration
- **Model**: OpenAI GPT-4o for analogy generation
- **Personalization Engine**: Context-aware prompt engineering based on user interests and knowledge level
- **Response Processing**: Structured JSON responses for consistent analogy and example formatting
- **Regeneration**: Feedback-based analogy improvement with previous context awareness

## External Dependencies

### Cloud Services
- **Database**: Neon Database (PostgreSQL-compatible serverless database)
- **AI Provider**: OpenAI API for GPT-4o model access
- **Deployment Target**: Designed for Google Cloud Run containerized deployment

### Development Tools
- **Package Manager**: npm with lockfile for dependency consistency
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier integration through Replit environment
- **Build Pipeline**: Vite for frontend, ESBuild for backend with development/production modes

### Key Libraries
- **UI Components**: Comprehensive Radix UI component library for accessibility
- **Styling**: Tailwind CSS with custom design tokens and glassmorphism utilities
- **Validation**: Zod for runtime type validation and schema generation
- **HTTP Client**: Native fetch with custom wrapper for error handling and authentication
- **Date Handling**: date-fns for consistent date manipulation and formatting

### Development Environment
- **Platform**: Replit-optimized with custom Vite plugins for development experience
- **Hot Reload**: Vite HMR with runtime error overlay for enhanced debugging
- **Environment Variables**: Structured configuration for database and API keys
- **Asset Management**: Custom alias resolution for clean import paths