
# Asistente de Voz Terapéutico - Resumen del Proyecto

Este documento proporciona una visión general de la arquitectura técnica, las tecnologías utilizadas y el núcleo funcional del proyecto "Asistente de Voz Terapéutico".

## Tecnologías Utilizadas

El proyecto está construido como una aplicación web moderna de una sola página (SPA) utilizando las siguientes tecnologías:

- **Framework Frontend:** [React](https://react.dev/) (v18.3.1) para construir la interfaz de usuario interactiva y componentizada.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) para añadir tipado estático a JavaScript, mejorando la robustez y mantenibilidad del código.
- **Bundler/Build Tool:** [Vite](https://vitejs.dev/) para un desarrollo rápido y una compilación optimizada del proyecto.
- **Estilos:**
    - [Tailwind CSS](https://tailwindcss.com/): Un framework CSS "utility-first" para diseñar rápidamente interfaces personalizadas.
    - [shadcn/ui](https://ui.shadcn.com/): Una colección de componentes de UI reutilizables y accesibles, construidos sobre Radix UI y Tailwind CSS. Los componentes se encuentran en `src/components/ui`.
- **Gestión de Estado:** El estado principal se maneja localmente en el componente `App.tsx` usando los hooks de React (`useState`, `useEffect`). Los datos de la sesión, tareas y progreso se persisten en el `localStorage` del navegador para simular una base de datos local.
- **Iconos:** [Lucide React](https://lucide.dev/) para un conjunto de iconos limpio y consistente.
- **Inteligencia Artificial (IA):**
    - El servicio `aiService.ts` está diseñado para ser compatible con múltiples proveedores de LLM como **OpenAI (GPT-4o-mini)**, **Anthropic (Claude 3.5 Sonnet)**, **Google (Gemini 1.5 Flash)** y **Groq (Llama 3.1)**.
    - Por defecto, el proyecto utiliza **Groq** con una clave de API preconfigurada para demostración, garantizando un rendimiento rápido y sin costo inicial.
- **Reconocimiento y Síntesis de Voz:** Se utiliza la **Web Speech API** nativa del navegador:
    - `SpeechRecognition` para la conversión de voz a texto.
    - `SpeechSynthesis` para la conversión de texto a voz, dando vida al asistente.

## Núcleo del Proyecto

El corazón de la aplicación es la **interacción conversacional terapéutica en tiempo real**. La lógica principal se concentra en tres archivos clave que trabajan en conjunto para crear la experiencia del usuario.

### 1. Ubicación del Código Principal

- **`src/App.tsx`**: Actúa como el orquestador principal de la aplicación. Gestiona el estado global (sesiones, tareas, puntos), la navegación entre las diferentes vistas (`Dashboard`, `SessionView`, `HistoryView`, etc.) y la persistencia de datos en `localStorage`.
- **`src/components/SessionView.tsx`**: Es el componente central donde ocurre la magia. Aquí se gestiona la sesión de chat en vivo con el asistente.
- **`src/services/aiService.ts`**: Este servicio encapsula toda la lógica para comunicarse con los modelos de lenguaje de IA.

### 2. Explicación del Flujo Principal

El flujo de una sesión terapéutica se puede describir de la siguiente manera:

1.  **Inicio de la Sesión**: El usuario inicia una nueva sesión desde el `DashboardView`. El componente `App.tsx` crea un nuevo objeto de sesión y renderiza `SessionView`.

2.  **Interacción del Usuario (Voz o Texto)**:
    - En `SessionView.tsx`, el usuario puede presionar un botón para activar el micrófono.
    - La **Web Speech API** (`SpeechRecognition`) captura el audio, lo transcribe a texto y lo muestra en la interfaz.
    - Alternativamente, el usuario puede escribir y enviar un mensaje de texto.

3.  **Procesamiento del Mensaje**:
    - El mensaje del usuario (ya sea por voz o texto) se envía a la función `processUserMessage`.
    - **Detección de Crisis**: Antes de cualquier otra cosa, el mensaje se analiza localmente en `aiService.ts` (`detectCrisis`) para buscar palabras clave de alto riesgo (ej. "suicidio", "matarme"). Si se detecta una crisis, se muestra un modal con recursos de ayuda inmediata (`CrisisModal.tsx`).
    - **Llamada a la IA**: Si no es una crisis, el mensaje se envía al `aiService.ts`.

4.  **Comunicación con la IA**:
    - `aiService.ts` mantiene un historial de la conversación para dar contexto al modelo.
    - Envía el historial y el nuevo mensaje al proveedor de IA configurado (por defecto, **Groq**). El `SYSTEM_PROMPT` define la personalidad y las directrices del asistente (ser empático, no diagnosticar, etc.).
    - El servicio recibe la respuesta generada por el LLM.

5.  **Respuesta del Asistente**:
    - La respuesta de la IA se devuelve a `SessionView.tsx`.
    - El mensaje se muestra en la interfaz de chat.
    - La **Web Speech API** (`SpeechSynthesis`) lee la respuesta en voz alta, completando el ciclo de conversación.
    - **Detección de Sugerencias**: La respuesta también se analiza (`detectBreathingExerciseSuggestion`) para ver si la IA sugirió un ejercicio. Si es así, se le ofrece al usuario la posibilidad de realizarlo (`BreathingExercise.tsx`).

6.  **Finalización y Resumen**:
    - Cuando el usuario termina la sesión, `SessionView` recopila todos los datos (duración, conversación, ejercicios) y los pasa a `App.tsx`.
    - Se muestra un resumen (`SessionSummary.tsx`) donde la IA (en una implementación futura podría analizar la conversación) asigna tareas y analiza las emociones.
    - Finalmente, la sesión y las nuevas tareas se guardan en el estado global y en `localStorage`.
