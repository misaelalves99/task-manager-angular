// src/app/core/config/app-config.ts

// Configuração geral do aplicativo de tarefas (versão Angular).
// Comentários em português, nomes em inglês.

export const appConfig = {
  appName: 'Task Manager JS',
  defaultLanguage: 'pt-BR',

  // ============================================================
  // ==================== STATUS DA TAREFA =======================
  // ============================================================
  // Os valores são as labels em português que aparecem na UI
  taskStatus: {
    TODO: 'NÃO INICIADO',
    IN_PROGRESS: 'EM ANDAMENTO',
    BLOCKED: 'PARADO',
    DONE: 'CONCLUÍDO',
  } as const,

  // ============================================================
  // ==================== PRIORIDADES ============================
  // ============================================================
  // Valores também são labels em português
  taskPriorities: {
    LOW: 'BAIXO',
    MEDIUM: 'MÉDIO',
    HIGH: 'ALTO',
    CRITICAL: 'CRÍTICO',
  } as const,

  // ============================================================
  // ==================== TIPOS DE TAREFA ========================
  // ============================================================
  // IMPORTANTE:
  //  - usamos strings "internas" em inglês (BUG, FEATURE, DOCUMENTATION)
  //    para bater com as subclasses BugTask / FeatureTask / DocumentationTask
  //  - se quiser label PT-BR na UI, usamos um map separado (ex.: taskTypeLabels)
  taskTypes: {
    BUG: 'BUG',
    FEATURE: 'FEATURE',
    DOCUMENTATION: 'DOCUMENTATION',
  } as const,

  // ============================================================
  // =================== FILTROS PRÉ-DEFINIDOS ==================
  // ============================================================
  filters: {
    showOnlyOpen: {
      label: 'Somente tarefas abertas',
      predicate: (task: { status: string }) =>
        task.status !== ((
          appConfig.taskStatus.DONE
        )),
    },
    showOnlyBugs: {
      label: 'Somente bugs',
      predicate: (task: { type: string }) =>
        task.type === appConfig.taskTypes.BUG,
    },
    showHighPriority: {
      label: 'Alta prioridade ou crítica',
      predicate: (task: { priority: string }) =>
        task.priority === appConfig.taskPriorities.HIGH ||
        task.priority === appConfig.taskPriorities.CRITICAL,
    },
  },

  // Configurações gerais
  settings: {
    allowAnonymousComments: false,
    maxCommentsPerTask: 100,
    estimateStrategy: 'per_type',
  },
} as const;

// ============================================================
// ===================== TIPOS AUXILIARES =====================
// ============================================================

export type TaskStatus =
  (typeof appConfig.taskStatus)[keyof typeof appConfig.taskStatus];

export type TaskPriority =
  (typeof appConfig.taskPriorities)[keyof typeof appConfig.taskPriorities];

export type TaskType =
  (typeof appConfig.taskTypes)[keyof typeof appConfig.taskTypes];
