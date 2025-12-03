# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a therapeutic voice assistant web application built with React, TypeScript, and Vite. The application provides emotional support through AI-powered conversational therapy sessions with voice interaction capabilities, breathing exercises, task management, and session tracking.

## Development Commands

### Installation
```bash
npm i
```

### Development
```bash
npm run dev
```
Starts the development server at `http://localhost:3000` with hot module replacement enabled.

### Build
```bash
npm run build
```
Creates production build in the `build/` directory using Vite.

## Architecture

### Application Structure

The application follows a single-page application (SPA) architecture with view-based navigation controlled by state in `App.tsx`:

- **Main Views**: dashboard, tasks, history, settings, session, summary
- **State Management**: All state is managed locally using React hooks and persisted to `localStorage`
- **Navigation**: Bottom navigation bar for switching between views
- **Data Persistence**: Sessions, tasks, points, and streaks are stored in browser's `localStorage`

### Key Data Models (src/types.ts)

**Session**: Represents a therapy session with emotional analysis, exercises completed, conversation history, and assigned tasks
- `analisis_emocional`: Tracks emotion data (predominant emotion, intensity, evolution)
- `conversacion`: Array of user/assistant message exchanges
- `tareas_asignadas`: Tasks generated from the session

**Task**: Represents therapeutic tasks assigned to users
- Linked to originating session via `sesion_origen`
- Tracks completion status and awards points

### Core Components

**SessionView** (src/components/SessionView.tsx)
- Main therapy session interface with voice and text input
- Integrates Web Speech API for voice recognition (Spanish)
- Integrates Web Speech Synthesis API for text-to-speech responses
- Crisis detection and intervention via `CrisisModal`
- Breathing exercise suggestions via `BreathingExercise`
- Text input fallback when microphone is unavailable
- Chunked speech synthesis to handle long responses (browser limitations)

**AI Service** (src/services/aiService.ts)
- Multi-provider AI integration supporting OpenAI, Anthropic, Gemini, and Groq
- Currently configured with hardcoded Groq API key (llama-3.3-70b-versatile model)
- Maintains conversation history with system prompt for therapeutic context
- Helper functions: `detectBreathingExerciseSuggestion()`, `detectCrisis()`
- System prompt defines therapeutic behavior and constraints

**DashboardView** (src/components/DashboardView.tsx)
- Overview of recent sessions, pending tasks, points, and streak tracking
- Entry point for starting new therapy sessions

**TasksView** (src/components/TasksView.tsx)
- Gamified task management with point system
- Displays pending and completed therapeutic tasks

**HistoryView** (src/components/HistoryView.tsx)
- Historical session data with emotional analytics
- Allows viewing past conversations and session deletion

**SettingsView** (src/components/SettingsView.tsx)
- Data export functionality (JSON format)
- Clear all data with confirmation modal
- Privacy and security information display

**BreathingExercise** (src/components/BreathingExercise.tsx)
- Interactive 4-7-8 breathing technique visualization
- Triggered during sessions when AI detects anxiety/stress

**CrisisModal** (src/components/CrisisModal.tsx)
- Emergency resource display for crisis situations
- Shown when detecting suicide ideation or self-harm keywords

### Voice Interaction Implementation

- **Speech Recognition**: Uses `webkitSpeechRecognition` or `SpeechRecognition` API
- **Language**: Spanish (es-ES)
- **Text-to-Speech**: Uses `SpeechSynthesis` API with chunking for long text
- **Fallback**: Text input available when microphone permission denied or unavailable

### UI Components

Located in `src/components/ui/` - extensive Radix UI component library with shadcn/ui styling:
- Modals, dialogs, sheets
- Form controls, buttons, inputs
- Charts and data visualization (recharts)
- Navigation components

### Styling

- **Framework**: Tailwind CSS (imported via configuration, no separate config file visible)
- **Theme**: Gradient backgrounds (purple, pink, blue tones)
- **Design System**: Using class-variance-authority for component variants

## Important Implementation Details

### Session Flow
1. User clicks "Start Session" from dashboard
2. `SessionView` initializes with AI greeting via text-to-speech
3. User can speak (voice) or type (text) their responses
4. AI processes messages through configured provider (currently Groq)
5. Responses are displayed and spoken back to user
6. Crisis detection runs on each user message
7. Breathing exercises suggested automatically by AI when appropriate
8. Session ends manually, generating summary with tasks

### Data Privacy Considerations
- All data stored locally in browser `localStorage`
- AI API calls made directly from browser (API key exposed in client code)
- No backend server or database
- Settings view claims "server storage with encrypted tokens" but this is UI text only - actual storage is local

### AI Configuration
The `AIService` class has infrastructure for multiple providers but is hardcoded to use Groq with a fixed API key. The system prompt defines the assistant as empathetic, validates emotions, suggests coping techniques, and explicitly avoids medical diagnoses or medication recommendations.

## Working with This Codebase

### Adding New Features
- All state management flows through `App.tsx`
- Add new views by extending the `View` type and adding conditional rendering
- New components should follow the existing pattern of accepting props and managing local state
- Therapeutic content changes require updating system prompt in `aiService.ts:11`

### Modifying AI Behavior
- System prompt: `src/services/aiService.ts` line 11-27
- Crisis keywords: `detectCrisis()` function in `aiService.ts:237`
- Breathing exercise triggers: `detectBreathingExerciseSuggestion()` in `aiService.ts:227`

### Voice Features
- Recognition config: `SessionView.tsx:131-138`
- Speech synthesis config: `SessionView.tsx:97-101`
- Both require browser support - implement appropriate fallbacks

### Gamification System
- Points awarded on task completion in `App.tsx:117-120`
- Task generation happens in `SessionView.tsx:269-288`
- Streak tracking exists but calculation logic not visible in reviewed files

## Path Aliases

The project uses `@/` alias pointing to `./src` directory (configured in `vite.config.ts`).
