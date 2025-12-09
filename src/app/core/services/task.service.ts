// src/app/core/services/task.service.ts

import { Injectable } from '@angular/core';

import {
  appConfig,
  TaskPriority,
  TaskType,
} from '../config/app-config';
import { Task } from '../models/task.model';
import { BugTask } from '../models/bug-task.model';
import { FeatureTask } from '../models/feature-task.model';
import { DocumentationTask } from '../models/documentation-task.model';
import { TaskManagerService } from './task-manager.service';

interface CreateTaskParams {
  title: string;
  description?: string;
  /** Vem do formulário, baseado na Tag de tipo (BUG / FEATURE / DOCUMENTATION / outro) */
  type?: string;
  /** Enum interno de prioridade */
  priority?: TaskPriority;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(
    private readonly taskManager: TaskManagerService,
  ) {}

  /** Lista todas as tarefas (já com seed + novas) */
  getAllTasks(): Task[] {
    return this.taskManager.getAllTasks();
  }

  /** Normaliza o tipo recebido (string) para o enum interno + 'GENERIC' */
  private normalizeTaskType(type?: string): TaskType | 'GENERIC' {
    if (!type) return 'GENERIC';

    const upper = type.toUpperCase();

    if (upper === appConfig.taskTypes.BUG) {
      return appConfig.taskTypes.BUG;
    }
    if (upper === appConfig.taskTypes.FEATURE) {
      return appConfig.taskTypes.FEATURE;
    }
    if (upper === appConfig.taskTypes.DOCUMENTATION) {
      return appConfig.taskTypes.DOCUMENTATION;
    }

    return 'GENERIC';
  }

  /** Cria uma nova tarefa usando a hierarquia OOP */
  createTask(params: CreateTaskParams): Task {
    const { title, description = '', type, priority } = params;

    if (!title || typeof title !== 'string') {
      throw new Error('Título da tarefa é obrigatório.');
    }

    const normalizedType = this.normalizeTaskType(type);
    const finalPriority = priority ?? appConfig.taskPriorities.MEDIUM;

    const tasks = this.taskManager.tasks;
    const nextId =
      tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;

    const base = {
      id: nextId,
      title: title.trim(),
      description: description.trim(),
      priority: finalPriority,
      createdAt: new Date(),
      responsible: null,
    };

    let task: Task;

    switch (normalizedType) {
      case appConfig.taskTypes.BUG:
        task = new BugTask({
          ...base,
          severity: 'MEDIUM',
        });
        break;

      case appConfig.taskTypes.FEATURE:
        task = new FeatureTask({
          ...base,
          complexity: 3,
          businessValue: 3,
        });
        break;

      case appConfig.taskTypes.DOCUMENTATION:
        task = new DocumentationTask({
          ...base,
          pages: 1,
          isTechnical: true,
        });
        break;

      default:
        task = new Task({
          ...base,
          type: 'GENERIC',
        });
        break;
    }

    tasks.push(task);
    return task;
  }
}
