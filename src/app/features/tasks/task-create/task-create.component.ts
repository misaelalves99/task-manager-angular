// src/app/features/tasks/task-create/task-create.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import {
  appConfig,
  TaskPriority,
  TaskType,
  TaskStatus,
} from '../../../core/config/app-config';

import { Tag } from '../../../core/models/tag.model';
import { User } from '../../../core/models/user.model';
import { Task } from '../../../core/models/task.model';
import { BugTask } from '../../../core/models/bug-task.model';
import { FeatureTask } from '../../../core/models/feature-task.model';
import { DocumentationTask } from '../../../core/models/documentation-task.model';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css'],
})
export class TaskCreateComponent implements OnInit {
  // Campos do formulário (binds com ngModel)
  title = '';
  description = '';

  typeTagId: number | null = null;
  priorityTagId: number | null = null;

  // Responsável e estimativa
  responsibleUserId: number | null = null;
  estimateHours: number | null = null;

  // Status da tarefa (dropdown) – começa sem seleção (null)
  status: TaskStatus | null = null;

  // Lista de todas as tags vindas do TaskManagerService
  allTags: Tag[] = [];

  // Lista de usuários
  users: User[] = [];

  // Feedback de UI
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly taskManager: TaskManagerService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.allTags = this.taskManager.getAllTags();
    this.users = this.taskManager.getAllUsers();
  }

  // ============================================================
  // ============== TAGS POR CATEGORIA + PREVIEW ================
  // ============================================================

  get typeTags(): Tag[] {
    return this.allTags.filter((t) => t.category === 'TYPE');
  }

  get priorityTags(): Tag[] {
    return this.allTags.filter((t) => t.category === 'PRIORITY');
  }

  get currentTypeTag(): Tag | null {
    if (this.typeTagId == null) return null;
    return this.typeTags.find((t) => t.id === this.typeTagId) ?? null;
  }

  get currentPriorityTag(): Tag | null {
    if (this.priorityTagId == null) return null;
    return this.priorityTags.find((t) => t.id === this.priorityTagId) ?? null;
  }

  get currentResponsible(): User | null {
    if (this.responsibleUserId == null) return null;
    return this.users.find((u) => u.id === this.responsibleUserId) ?? null;
  }

  // 🔥 Opções do dropdown de status (PT-BR)
  get statusOptions(): { value: TaskStatus; label: string }[] {
    return [
      {
        value: appConfig.taskStatus.TODO,
        label: 'NÃO INICIADO',
      },
      {
        value: appConfig.taskStatus.IN_PROGRESS,
        label: 'EM ANDAMENTO',
      },
      {
        value: appConfig.taskStatus.BLOCKED,
        label: 'PARADO',
      },
      {
        value: appConfig.taskStatus.DONE,
        label: 'CONCLUÍDO',
      },
    ];
  }

  // ============================================================
  // =================== MAPEAMENTO TAG → TIPO ==================
  // ============================================================

  private mapTypeFromTag(tag: Tag | null): TaskType | null {
    if (!tag) return null;

    const name = tag.name.trim().toUpperCase();

    if (name.includes('BUG')) {
      return appConfig.taskTypes.BUG;
    }

    if (
      name.includes('DOC') ||
      name.includes('DOCUMENTATION') ||
      name.includes('DOCUMENTAÇÃO')
    ) {
      return appConfig.taskTypes.DOCUMENTATION;
    }

    if (
      name.includes('FEATURE') ||
      name.includes('FEAT') ||
      name.includes('FUNC') ||
      name.includes('ATUALIZA') ||
      name.includes('UPDATE')
    ) {
      return appConfig.taskTypes.FEATURE;
    }

    if (tag.category === 'TYPE') {
      return appConfig.taskTypes.FEATURE;
    }

    return null;
  }

  private mapPriorityFromTag(tag: Tag | null): TaskPriority | null {
    if (!tag) return null;

    const name = tag.name.trim().toUpperCase();

    if (name.includes('BAIXO') || name.includes('LOW')) {
      return appConfig.taskPriorities.LOW;
    }
    if (
      name.includes('MÉDIO') ||
      name.includes('MEDIO') ||
      name.includes('MEDIUM')
    ) {
      return appConfig.taskPriorities.MEDIUM;
    }
    if (name.includes('ALTO') || name.includes('HIGH')) {
      return appConfig.taskPriorities.HIGH;
    }
    if (
      name.includes('CRÍTICO') ||
      name.includes('CRITICO') ||
      name.includes('CRITICAL')
    ) {
      return appConfig.taskPriorities.CRITICAL;
    }

    if (tag.category === 'PRIORITY') {
      return appConfig.taskPriorities.MEDIUM;
    }

    return null;
  }

  // ============================================================
  // =================== APLICA STATUS INICIAL ==================
  // ============================================================

  private applyInitialStatus(task: Task, status: TaskStatus): void {
    switch (status) {
      case appConfig.taskStatus.TODO:
        // default já é NÃO INICIADO
        break;
      case appConfig.taskStatus.IN_PROGRESS:
        (task as any).start?.();
        break;
      case appConfig.taskStatus.BLOCKED:
        (task as any).block?.();
        break;
      case appConfig.taskStatus.DONE:
        (task as any).complete?.();
        break;
      default:
        break;
    }
  }

  // ============================================================
  // ========================= SUBMIT ===========================
  // ============================================================

  onSubmit(): void {
    this.clearFeedback();

    if (!this.title.trim()) {
      this.errorMessage = 'Informe um título para a tarefa.';
      return;
    }

    if (this.typeTagId == null) {
      this.errorMessage = 'Selecione uma Tag para o tipo da tarefa.';
      return;
    }

    if (this.priorityTagId == null) {
      this.errorMessage = 'Selecione uma Tag para a prioridade da tarefa.';
      return;
    }

    if (!this.status) {
      this.errorMessage = 'Selecione um status para a tarefa.';
      return;
    }

    const typeTag = this.currentTypeTag;
    const priorityTag = this.currentPriorityTag;

    const type = this.mapTypeFromTag(typeTag);
    const priority = this.mapPriorityFromTag(priorityTag);

    if (!type) {
      this.errorMessage =
        'Não foi possível determinar o tipo da tarefa a partir da Tag selecionada.';
      return;
    }

    if (!priority) {
      this.errorMessage =
        'Não foi possível determinar a prioridade da tarefa a partir da Tag selecionada.';
      return;
    }

    this.isSubmitting = true;

    try {
      let nextId =
        this.taskManager.tasks.length > 0
          ? Math.max(...this.taskManager.tasks.map((t) => t.id))
          : 0;

      const newTaskId = (): number => {
        nextId += 1;
        return nextId;
      };

      const id = newTaskId();
      const createdAt = new Date();
      const responsible: User | null = this.currentResponsible;

      const baseProps = {
        id,
        title: this.title.trim(),
        description: this.description.trim(),
        priority,
        createdAt,
        responsible,
      };

      let newTask: BugTask | FeatureTask | DocumentationTask;

      if (type === appConfig.taskTypes.BUG) {
        newTask = new BugTask({
          ...baseProps,
          severity: 'MEDIUM',
          stepsToReproduce: '',
        });
      } else if (type === appConfig.taskTypes.FEATURE) {
        newTask = new FeatureTask({
          ...baseProps,
          complexity: 3,
          businessValue: 3,
        });
      } else {
        newTask = new DocumentationTask({
          ...baseProps,
          pages: 3,
          isTechnical: true,
        });
      }

      // aplica status inicial
      this.applyInitialStatus(newTask, this.status);

      if (typeTag) {
        newTask.addTag(typeTag);
      }
      if (priorityTag) {
        newTask.addTag(priorityTag);
      }

      if (this.estimateHours != null && !Number.isNaN(this.estimateHours)) {
        (newTask as any).estimatedHours = this.estimateHours;
      } else {
        newTask.estimate?.();
      }

      this.taskManager.tasks.push(newTask);

      this.successMessage = 'Tarefa criada com sucesso! Redirecionando...';

      setTimeout(() => {
        this.isSubmitting = false;
        this.router.navigate(['/tasks']);
      }, 900);
    } catch (err) {
      console.error('Erro ao criar tarefa (task-create):', err);
      this.errorMessage =
        'Ocorreu um erro ao criar a tarefa. Verifique o console para mais detalhes.';
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  private clearFeedback(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
