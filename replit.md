# MoodWise - AI Mood Tracking Companion

## Overview

MoodWise is a lightweight AI-powered mood tracking chatbot that provides emotional wellness support through anonymous conversations. The application features an Express.js backend with a React frontend to deliver a compassionate AI chat companion. Users can engage in conversations with the AI and receive real-time mood analysis without any authentication or data persistence requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Handling**: Session-based temporary data storage without persistence

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Data Storage**: In-memory storage with Map-based data structures
- **API Design**: RESTful API with middleware-based request processing
- **Error Handling**: Centralized error handling with custom middleware
- **Development**: Hot reload with tsx for development server

### Anonymous Architecture
- **No Authentication**: Completely anonymous chat sessions
- **No Data Persistence**: All data stored temporarily in memory
- **Session Management**: Temporary session IDs for chat organization
- **Privacy First**: No user accounts, login, or data storage

### AI Integration
- **AI Provider**: Groq API for natural language processing
- **Functionality**: Mood analysis, sentiment scoring, and conversational responses
- **Architecture**: Service-based pattern with dedicated GroqService class
- **Features**: Real-time mood scoring (1-10 scale) and sentiment analysis

### In-Memory Data Structure
The application uses temporary data structures:
- **Chat Sessions**: Anonymous conversation containers with mood analytics
- **Chat Messages**: Individual messages with sender identification and mood scores
- **Session Storage**: Temporary session management without persistence

### API Structure
The backend exposes minimal RESTful endpoints:
- **Chat Sessions**: `/api/chat/session` for anonymous session creation
- **Chat Messages**: `/api/chat/message` for AI conversation and mood analysis

### Development Architecture
- **Monorepo Structure**: Shared types and schemas between client and server
- **Build Process**: Separate builds for client (Vite) and server (esbuild)
- **Development Server**: Integrated Vite middleware for hot reloading
- **Type Safety**: Shared TypeScript configurations and path aliases

## External Dependencies

### AI and ML Services
- **Groq API**: Large language model inference for conversational AI
- **Usage**: Mood analysis, sentiment detection, and empathetic responses

### UI and Styling Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Shadcn/ui**: Pre-styled component library built on Radix
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Frontend build tool with React plugin and HMR
- **esbuild**: Fast JavaScript bundler for backend compilation
- **TypeScript**: Static type checking across the entire codebase
- **Drizzle Kit**: Database migration and schema management tools

### Monitoring and Development
- **Replit Integration**: Development environment integration with error overlays
- **Cartographer**: Replit-specific development tooling for enhanced debugging