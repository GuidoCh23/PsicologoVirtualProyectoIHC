# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a therapeutic voice assistant application built with React, TypeScript, and Vite. The app provides emotional support through AI-powered conversations, breathing exercises, task management, and session tracking. Users can interact via voice or text input.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on port 3000, auto-opens browser)
npm run dev

# Build for production (outputs to build/ directory)
npm run build
```

## Architecture Overview

### Core Application Flow

1. **App.tsx**: Main application container managing view routing, session state, and localStorage persistence
   - Manages 5 main views: dashboard, tasks, history, settings, session, summary
   - Handles disclaimer modal for first-time users
   - Persists all data (sessions, tasks, points, streaks) to localStorage
   - Coordinates session lifecycle from start to summary to storage

2. **Session Management**: Three-phase flow
   - **SessionView**: Active conversation with AI, voice/text input, real-time interaction
   - **SessionSummary**: Post-session review and task assignment
   - **Storage**: Session saved to history, tasks added to task list

3. **AI Service Architecture** (src/services/aiService.ts):
   - Supports 4 AI providers: OpenAI, Anthropic, Gemini, Groq
   - Maintains conversation history with system prompt
   - API keys stored in localStorage
   - Each provider has its own API implementation method
   - System prompt defines therapeutic conversation guidelines

### Key Components

- **SessionView**: Real-time therapy session with speech recognition, text input, and AI responses
  - Uses Web Speech API for voice input (webkitSpeechRecognition)
  - Text-to-speech for AI responses
  - Crisis detection triggers CrisisModal
  - Can trigger BreathingExercise based on AI suggestion detection

- **DashboardView**: Shows user progress, pending tasks preview, last session summary

- **TasksView**: Gamified task management with points and completion tracking

- **HistoryView**: Past sessions with emotional analysis and exercise history

- **SettingsView**: User preferences and data management

- **BreathingExercise**: Guided 4-7-8 breathing technique with visual feedback

- **AIConfigModal**: Configure AI provider and API key (shown on first session if not configured)

### Data Models (src/types.ts)

**Session**:
- Contains emotional analysis (predominant emotion, intensity, evolution, top 4 emotions)
- Tracks exercises completed during session
- User feedback (final emotional state, star rating)
- Assigned tasks for follow-up

**Task**:
- Linked to origin session
- Has points value for gamification
- Tracks completion status and dates
- Frequency: unique, daily, or weekly

### State Management

All state is managed in App.tsx using useState with localStorage persistence:
- Sessions array
- Tasks array
- Total points (sum of completed tasks)
- Current streak (days)
- Active session object
- Current view routing

### Styling

- Tailwind CSS via globals.css
- Gradient backgrounds (purple to pink theme)
- shadcn/ui components in src/components/ui/
- Responsive design with mobile-first approach

## Important Implementation Notes

### AI Service Configuration

- **IMPORTANT**: The Groq API key is hardcoded in src/services/aiService.ts constructor
- No user configuration needed - the AI service initializes automatically with Groq provider
- API key: `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`
- AIConfigModal component exists but is not used in current implementation
- Each provider has different message format requirements:
  - OpenAI/Groq: Standard messages array with system role
  - Anthropic: Separate system parameter from messages
  - Gemini: Converts to user/model role format with system prompt prepended

### Voice Recognition Handling

- Speech recognition starts without explicit permission request (browser handles it)
- Error handling for: not-allowed, no-speech, audio-capture, aborted
- Falls back to text input if microphone unavailable
- Uses Spanish language (es-ES) by default

### Crisis Detection

- Scans user messages for crisis keywords (suicide, self-harm, etc.)
- Immediately shows CrisisModal with emergency resources
- Bypasses normal AI response when triggered

### Session Data Generation

- When ending session, App generates complete Session object
- Currently uses placeholder emotional analysis data
- Tasks are pre-defined (breathing exercise, gratitude journal, walking)
- Future improvement: AI could generate personalized tasks

## Key Patterns

1. **Component Communication**: Props-based parent-child communication (no context/redux)
2. **Data Persistence**: localStorage on every state change via useEffect
3. **Error Handling**: Try-catch blocks with fallback responses for AI failures
4. **Type Safety**: TypeScript interfaces for Session and Task ensure type safety
