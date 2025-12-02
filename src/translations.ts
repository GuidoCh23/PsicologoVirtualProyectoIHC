export interface Translations {
  // Navigation
  nav: {
    home: string;
    tasks: string;
    history: string;
    settings: string;
    startSession: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    recentSessions: string;
    noSessions: string;
    pendingTasks: string;
    noTasks: string;
    viewAllTasks: string;
    stats: {
      totalPoints: string;
      currentStreak: string;
      days: string;
    };
  };

  // Tasks
  tasks: {
    title: string;
    subtitle: string;
    pending: string;
    completed: string;
    noTasksYet: string;
    completeSessionFirst: string;
    markComplete: string;
    points: string;
    frequency: string;
    daily: string;
    weekly: string;
    oneTime: string;
    completedOn: string;
    earnedPoints: string;
  };

  // History
  history: {
    title: string;
    subtitle: string;
    noSessions: string;
    startFirst: string;
    viewConversation: string;
    deleteSession: string;
    duration: string;
    minutes: string;
    predominantEmotion: string;
    intensity: string;
    evolution: string;
    improved: string;
    worsened: string;
    stayedSame: string;
    exercisesCompleted: string;
    tasksAssigned: string;
    conversation: string;
    close: string;
    confirmDelete: string;
    deleteWarning: string;
    cancel: string;
    delete: string;
  };

  // Settings
  settings: {
    title: string;
    subtitle: string;
    privacySecurity: string;
    dataEncryption: string;
    dataProtected: string;
    active: string;
    secureStorage: string;
    storageDescription: string;
    dataManagement: string;
    exportData: string;
    exportDescription: string;
    importData: string;
    importDescription: string;
    deleteAllHistory: string;
    deleteDescription: string;
    assistantConfig: string;
    voiceGender: string;
    voiceGenderDescription: string;
    male: string;
    female: string;
    appLanguage: string;
    appLanguageDescription: string;
    spanish: string;
    english: string;
    assistantLanguage: string;
    assistantLanguageDescription: string;
    about: string;
    appVersion: string;
    appDescription: string;
    disclaimer: string;
    clearConfirm: {
      title: string;
      question: string;
      willDelete: string;
      allSessions: string;
      allTasks: string;
      allPoints: string;
      allSettings: string;
      cannotUndo: string;
      cancel: string;
      confirmDelete: string;
    };
  };

  // Session
  session: {
    listening: string;
    speak: string;
    processing: string;
    micUnavailable: string;
    micDescription: string;
    typeMessage: string;
    send: string;
    endSession: string;
    sessionDuration: string;
    minutes: string;
  };

  // Session Summary
  summary: {
    title: string;
    duration: string;
    minutes: string;
    predominantEmotion: string;
    intensity: string;
    evolution: string;
    improved: string;
    worsened: string;
    stayedSame: string;
    topEmotions: string;
    exercisesCompleted: string;
    assignedTasks: string;
    points: string;
    saveSession: string;
    discardSession: string;
  };

  // Breathing Exercise
  breathing: {
    title: string;
    subtitle: string;
    inhale: string;
    hold: string;
    exhale: string;
    complete: string;
    round: string;
    of: string;
  };

  // Crisis Modal
  crisis: {
    title: string;
    description: string;
    resources: string;
    emergencyLine: string;
    lineDescription: string;
    support: string;
    supportDescription: string;
    close: string;
  };

  // Disclaimer Modal
  disclaimer: {
    title: string;
    important: string;
    point1: string;
    point2: string;
    point3: string;
    recommendations: string;
    rec1: string;
    rec2: string;
    rec3: string;
    understand: string;
  };

  // Common
  common: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}

export const translations: Record<'es' | 'en', Translations> = {
  es: {
    nav: {
      home: 'Inicio',
      tasks: 'Tareas',
      history: 'Historial',
      settings: 'Ajustes',
      startSession: 'Iniciar Sesión',
    },
    dashboard: {
      title: '👋 Bienvenido',
      subtitle: 'Tu espacio seguro de apoyo emocional',
      recentSessions: 'Sesiones Recientes',
      noSessions: 'Aún no has realizado ninguna sesión',
      pendingTasks: 'Tareas Pendientes',
      noTasks: 'No tienes tareas pendientes',
      viewAllTasks: 'Ver todas las tareas',
      stats: {
        totalPoints: 'Puntos Totales',
        currentStreak: 'Racha Actual',
        days: 'días',
      },
    },
    tasks: {
      title: '✅ Mis Tareas',
      subtitle: 'Completa tus tareas terapéuticas',
      pending: 'Pendientes',
      completed: 'Completadas',
      noTasksYet: 'No tienes tareas aún',
      completeSessionFirst: 'Completa tu primera sesión para recibir tareas personalizadas',
      markComplete: 'Marcar como completada',
      points: 'puntos',
      frequency: 'Frecuencia',
      daily: 'Diaria',
      weekly: 'Semanal',
      oneTime: 'Única',
      completedOn: 'Completada el',
      earnedPoints: 'Ganaste',
    },
    history: {
      title: '📊 Historial',
      subtitle: 'Revisa tus sesiones anteriores',
      noSessions: 'No tienes sesiones guardadas',
      startFirst: 'Inicia tu primera sesión para comenzar tu seguimiento',
      viewConversation: 'Ver conversación',
      deleteSession: 'Eliminar sesión',
      duration: 'Duración',
      minutes: 'min',
      predominantEmotion: 'Emoción predominante',
      intensity: 'Intensidad',
      evolution: 'Evolución',
      improved: 'Mejoró',
      worsened: 'Empeoró',
      stayedSame: 'Se mantuvo',
      exercisesCompleted: 'Ejercicios realizados',
      tasksAssigned: 'Tareas asignadas',
      conversation: 'Conversación',
      close: 'Cerrar',
      confirmDelete: '¿Eliminar Sesión?',
      deleteWarning: 'Esta acción eliminará permanentemente esta sesión y todas las tareas asociadas.',
      cancel: 'Cancelar',
      delete: 'Eliminar',
    },
    settings: {
      title: '⚙ Configuración',
      subtitle: 'Gestiona tu privacidad y datos',
      privacySecurity: 'Privacidad y Seguridad',
      dataEncryption: 'Encriptación de datos',
      dataProtected: 'Tus datos están protegidos',
      active: 'Activa',
      secureStorage: 'Almacenamiento Seguro',
      storageDescription: 'Tus conversaciones están guardadas de forma segura en nuestros servidores y protegidas mediante tokens cifrados.',
      dataManagement: 'Gestión de Datos',
      exportData: 'Exportar mis datos',
      exportDescription: 'Descarga una copia de toda tu información',
      importData: 'Importar mis datos',
      importDescription: 'Restaura una copia de seguridad de tu información',
      deleteAllHistory: 'Eliminar todo mi historial',
      deleteDescription: 'Borra permanentemente todas tus sesiones y tareas',
      assistantConfig: 'Configuración del Asistente',
      voiceGender: 'Género de la voz',
      voiceGenderDescription: 'Elige la voz del asistente',
      male: 'Masculina',
      female: 'Femenina',
      appLanguage: 'Idioma de la aplicación',
      appLanguageDescription: 'Cambia el idioma de la interfaz',
      spanish: 'Español',
      english: 'English',
      assistantLanguage: 'Idioma del asistente',
      assistantLanguageDescription: 'El idioma en que el asistente responde',
      about: 'Acerca de',
      appVersion: 'Psicólogo Virtual v1.0',
      appDescription: 'Una herramienta de apoyo emocional y bienestar',
      disclaimer: '⚠ Esta aplicación NO es un psicólogo real y no proporciona diagnósticos médicos ni tratamientos clínicos.',
      clearConfirm: {
        title: '⚠ Eliminar Todos los Datos',
        question: '¿Estás seguro de que quieres eliminar TODOS tus datos?',
        willDelete: 'Esta acción eliminará permanentemente:',
        allSessions: 'Todas las sesiones registradas',
        allTasks: 'Todas las tareas',
        allPoints: 'Todos tus puntos y rachas',
        allSettings: 'Todas las configuraciones',
        cannotUndo: 'Esta acción NO se puede deshacer.',
        cancel: 'Cancelar',
        confirmDelete: '❌ Sí, Eliminar Todo',
      },
    },
    session: {
      listening: 'Escuchando...',
      speak: 'Hablar',
      processing: 'Procesando...',
      micUnavailable: 'Micrófono no disponible',
      micDescription: 'Por favor, permite el acceso al micrófono o usa el teclado',
      typeMessage: 'Escribe tu mensaje...',
      send: 'Enviar',
      endSession: 'Terminar Sesión',
      sessionDuration: 'Duración de la sesión',
      minutes: 'min',
    },
    summary: {
      title: '📝 Resumen de la Sesión',
      duration: 'Duración',
      minutes: 'minutos',
      predominantEmotion: 'Emoción Predominante',
      intensity: 'Intensidad',
      evolution: 'Evolución',
      improved: 'Mejoró',
      worsened: 'Empeoró',
      stayedSame: 'Se mantuvo',
      topEmotions: 'Emociones Principales',
      exercisesCompleted: 'Ejercicios Realizados',
      assignedTasks: 'Tareas Asignadas',
      points: 'puntos',
      saveSession: '💾 Guardar Sesión',
      discardSession: 'Descartar',
    },
    breathing: {
      title: 'Ejercicio de Respiración 4-7-8',
      subtitle: 'Sigue el ritmo visual para calmar tu mente',
      inhale: 'Inhala',
      hold: 'Sostén',
      exhale: 'Exhala',
      complete: 'Completar Ejercicio',
      round: 'Ronda',
      of: 'de',
    },
    crisis: {
      title: '🆘 Recursos de Crisis',
      description: 'Si estás experimentando una crisis, por favor contacta inmediatamente a:',
      resources: 'Recursos de Ayuda',
      emergencyLine: 'Línea de Emergencia',
      lineDescription: 'Línea gratuita de prevención del suicidio disponible 24/7',
      support: 'Chat de Apoyo',
      supportDescription: 'Habla con un consejero de crisis en línea',
      close: 'Cerrar',
    },
    disclaimer: {
      title: '⚠ Aviso Importante',
      important: 'IMPORTANTE: Por favor lee atentamente',
      point1: 'Esta aplicación NO es un sustituto de atención médica o psicológica profesional.',
      point2: 'NO diagnostica, trata ni cura enfermedades mentales o trastornos psicológicos.',
      point3: 'Es una herramienta de APOYO y BIENESTAR emocional basada en inteligencia artificial.',
      recommendations: 'Recomendaciones:',
      rec1: 'Si experimentas crisis emocionales graves, pensamientos suicidas o autolesivos, busca ayuda profesional inmediata.',
      rec2: 'Si necesitas tratamiento psicológico, consulta con un profesional de salud mental calificado.',
      rec3: 'Usa esta aplicación como complemento a tu bienestar, no como reemplazo de terapia profesional.',
      understand: 'Entiendo y Acepto',
    },
    common: {
      morning: 'mañana',
      afternoon: 'tarde',
      evening: 'noche',
    },
  },
  en: {
    nav: {
      home: 'Home',
      tasks: 'Tasks',
      history: 'History',
      settings: 'Settings',
      startSession: 'Start Session',
    },
    dashboard: {
      title: '👋 Welcome',
      subtitle: 'Your safe space for emotional support',
      recentSessions: 'Recent Sessions',
      noSessions: 'You haven\'t completed any sessions yet',
      pendingTasks: 'Pending Tasks',
      noTasks: 'You have no pending tasks',
      viewAllTasks: 'View all tasks',
      stats: {
        totalPoints: 'Total Points',
        currentStreak: 'Current Streak',
        days: 'days',
      },
    },
    tasks: {
      title: '✅ My Tasks',
      subtitle: 'Complete your therapeutic tasks',
      pending: 'Pending',
      completed: 'Completed',
      noTasksYet: 'You don\'t have any tasks yet',
      completeSessionFirst: 'Complete your first session to receive personalized tasks',
      markComplete: 'Mark as complete',
      points: 'points',
      frequency: 'Frequency',
      daily: 'Daily',
      weekly: 'Weekly',
      oneTime: 'One-time',
      completedOn: 'Completed on',
      earnedPoints: 'You earned',
    },
    history: {
      title: '📊 History',
      subtitle: 'Review your previous sessions',
      noSessions: 'You have no saved sessions',
      startFirst: 'Start your first session to begin tracking',
      viewConversation: 'View conversation',
      deleteSession: 'Delete session',
      duration: 'Duration',
      minutes: 'min',
      predominantEmotion: 'Predominant emotion',
      intensity: 'Intensity',
      evolution: 'Evolution',
      improved: 'Improved',
      worsened: 'Worsened',
      stayedSame: 'Stayed the same',
      exercisesCompleted: 'Exercises completed',
      tasksAssigned: 'Tasks assigned',
      conversation: 'Conversation',
      close: 'Close',
      confirmDelete: 'Delete Session?',
      deleteWarning: 'This action will permanently delete this session and all associated tasks.',
      cancel: 'Cancel',
      delete: 'Delete',
    },
    settings: {
      title: '⚙ Settings',
      subtitle: 'Manage your privacy and data',
      privacySecurity: 'Privacy and Security',
      dataEncryption: 'Data encryption',
      dataProtected: 'Your data is protected',
      active: 'Active',
      secureStorage: 'Secure Storage',
      storageDescription: 'Your conversations are securely stored on our servers and protected with encrypted tokens.',
      dataManagement: 'Data Management',
      exportData: 'Export my data',
      exportDescription: 'Download a copy of all your information',
      importData: 'Import my data',
      importDescription: 'Restore a backup of your information',
      deleteAllHistory: 'Delete all my history',
      deleteDescription: 'Permanently delete all your sessions and tasks',
      assistantConfig: 'Assistant Configuration',
      voiceGender: 'Voice gender',
      voiceGenderDescription: 'Choose the assistant\'s voice',
      male: 'Male',
      female: 'Female',
      appLanguage: 'App language',
      appLanguageDescription: 'Change the interface language',
      spanish: 'Español',
      english: 'English',
      assistantLanguage: 'Assistant language',
      assistantLanguageDescription: 'The language the assistant responds in',
      about: 'About',
      appVersion: 'Virtual Psychologist v1.0',
      appDescription: 'An emotional support and wellness tool',
      disclaimer: '⚠ This application is NOT a real psychologist and does not provide medical diagnoses or clinical treatments.',
      clearConfirm: {
        title: '⚠ Delete All Data',
        question: 'Are you sure you want to delete ALL your data?',
        willDelete: 'This action will permanently delete:',
        allSessions: 'All recorded sessions',
        allTasks: 'All tasks',
        allPoints: 'All your points and streaks',
        allSettings: 'All settings',
        cannotUndo: 'This action CANNOT be undone.',
        cancel: 'Cancel',
        confirmDelete: '❌ Yes, Delete Everything',
      },
    },
    session: {
      listening: 'Listening...',
      speak: 'Speak',
      processing: 'Processing...',
      micUnavailable: 'Microphone unavailable',
      micDescription: 'Please allow microphone access or use the keyboard',
      typeMessage: 'Type your message...',
      send: 'Send',
      endSession: 'End Session',
      sessionDuration: 'Session duration',
      minutes: 'min',
    },
    summary: {
      title: '📝 Session Summary',
      duration: 'Duration',
      minutes: 'minutes',
      predominantEmotion: 'Predominant Emotion',
      intensity: 'Intensity',
      evolution: 'Evolution',
      improved: 'Improved',
      worsened: 'Worsened',
      stayedSame: 'Stayed the same',
      topEmotions: 'Top Emotions',
      exercisesCompleted: 'Exercises Completed',
      assignedTasks: 'Assigned Tasks',
      points: 'points',
      saveSession: '💾 Save Session',
      discardSession: 'Discard',
    },
    breathing: {
      title: '4-7-8 Breathing Exercise',
      subtitle: 'Follow the visual rhythm to calm your mind',
      inhale: 'Inhale',
      hold: 'Hold',
      exhale: 'Exhale',
      complete: 'Complete Exercise',
      round: 'Round',
      of: 'of',
    },
    crisis: {
      title: '🆘 Crisis Resources',
      description: 'If you are experiencing a crisis, please contact immediately:',
      resources: 'Help Resources',
      emergencyLine: 'Emergency Line',
      lineDescription: 'Free suicide prevention hotline available 24/7',
      support: 'Support Chat',
      supportDescription: 'Talk to an online crisis counselor',
      close: 'Close',
    },
    disclaimer: {
      title: '⚠ Important Notice',
      important: 'IMPORTANT: Please read carefully',
      point1: 'This application is NOT a substitute for professional medical or psychological care.',
      point2: 'It does NOT diagnose, treat, or cure mental illnesses or psychological disorders.',
      point3: 'It is a SUPPORT and emotional WELLNESS tool based on artificial intelligence.',
      recommendations: 'Recommendations:',
      rec1: 'If you experience severe emotional crises, suicidal thoughts, or self-harm, seek immediate professional help.',
      rec2: 'If you need psychological treatment, consult with a qualified mental health professional.',
      rec3: 'Use this application as a complement to your well-being, not as a replacement for professional therapy.',
      understand: 'I Understand and Accept',
    },
    common: {
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
    },
  },
};
