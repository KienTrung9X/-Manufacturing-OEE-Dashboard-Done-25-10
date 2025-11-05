# Technology Stack

## Programming Languages
- **TypeScript 5.8.2** - Primary language with strict type checking
- **JavaScript (ES Modules)** - Module system and build target

## Frontend Framework
- **React 19.2.0** - Component-based UI library
- **React DOM 19.2.0** - DOM rendering for React components

## Build System & Development
- **Vite 6.2.0** - Fast build tool and development server
- **@vitejs/plugin-react 5.0.0** - React integration for Vite
- **Node.js** - Runtime environment (prerequisite)

## Key Dependencies
- **Recharts 3.3.0** - Data visualization and charting library
- **@google/genai 1.27.0** - Google Gemini AI integration
- **lucide-react 0.548.0** - Icon library for UI components
- **simple-statistics 7.8.8** - Statistical calculations and analysis

## Development Tools
- **@types/node 22.14.0** - Node.js type definitions
- **TypeScript compiler** - Type checking and compilation

## Development Commands

### Setup
```bash
npm install
```

### Environment Configuration
Set `GEMINI_API_KEY` in `.env.local` file for AI functionality

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Configuration Files
- `tsconfig.json` - TypeScript compiler configuration
- `vite.config.ts` - Vite build and development server settings
- `package.json` - Project dependencies and scripts
- `.env.local` - Environment variables (API keys)

## Architecture Decisions
- **ES Modules**: Modern JavaScript module system
- **Vite over Webpack**: Faster development builds and HMR
- **TypeScript**: Type safety and better developer experience
- **React 19**: Latest React features and performance improvements
- **Recharts**: Declarative charting library optimized for React