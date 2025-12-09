// src/app/features/tasks/task-list/task-list.component.ts

import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { Task } from '../../../core/models/task.model';
import { Tag } from '../../../core/models/tag.model';
import { appConfig } from '../../../core/config/app-config';
import { TaskManagerService } from '../../../core/services/task-manager.service';

type TaskFilterKey = 'all' | 'open' | 'bugs' | 'highPriority';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  // Lista completa de tarefas (seed + criadas)
  allTasks = signal<Task[]>([]);

  // Filtro atual
  filter = signal<TaskFilterKey>('all');

  // Lista filtrada reativa
  filteredTasks = computed(() => {
    const tasks = this.allTasks();
    const f = this.filter();

    switch (f) {
      case 'open':
        return tasks.filter(
          (t) => t.status !== appConfig.taskStatus.DONE,
        );
      case 'bugs':
        return tasks.filter(
          (t) => t.type === appConfig.taskTypes.BUG,
        );
      case 'highPriority':
        return tasks.filter(
          (t) =>
            t.priority === appConfig.taskPriorities.HIGH ||
            t.priority === appConfig.taskPriorities.CRITICAL,
        );
      case 'all':
      default:
        return tasks;
    }
  });

  constructor(
    private readonly taskManager: TaskManagerService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    // Fonte única → TaskManagerService
    const tasks = this.taskManager.getAllTasks();
    this.allTasks.set(tasks);
  }

  // ===== Filtro de header =====

  setFilter(filterKey: TaskFilterKey): void {
    this.filter.set(filterKey);
  }

  getFilterLabel(filterKey: TaskFilterKey): string {
    switch (filterKey) {
      case 'all':
        return 'Todas';
      case 'open':
        return 'Abertas';
      case 'bugs':
        return 'Bugs';
      case 'highPriority':
        return 'Alta prioridade';
      default:
        return filterKey;
    }
  }

  goToCreate(): void {
    this.router.navigate(['/tasks', 'new']);
  }

  // ============================================================
  // ============ LABELS DINÂMICOS (USANDO TAGS) ================
  // ============================================================

  /** Texto que aparece na coluna "Tipo" */
  getTypeLabel(task: Task): string {
    const tags = (task as any).tags as Tag[] | undefined;

    // 1) Tag ligada à tarefa com categoria TYPE
    const typeTag = tags?.find((t) => t.category === 'TYPE');
    if (typeTag?.name?.trim()) {
      return typeTag.name;
    }

    // 2) Tag global TYPE cujo nome bate com o enum
    const upperType = String(task.type ?? '').trim().toUpperCase();
    const globalTypeTag = this.taskManager.tags.find(
      (t) =>
        t.category === 'TYPE' &&
        t.name.trim().toUpperCase() === upperType,
    );
    if (globalTypeTag?.name?.trim()) {
      return globalTypeTag.name;
    }

    // 3) Fallback → enum
    return String(task.type);
  }

  /** Texto que aparece na coluna "Prioridade" */
  getPriorityLabel(task: Task): string {
    const tags = (task as any).tags as Tag[] | undefined;

    // 1) Tag ligada à tarefa com categoria PRIORITY
    const priorityTag = tags?.find((t) => t.category === 'PRIORITY');
    if (priorityTag?.name?.trim()) {
      return priorityTag.name;
    }

    // 2) Fallback → mapeia enum para texto padrão (sincronizado com Detail/Edit)
    switch (task.priority) {
      case appConfig.taskPriorities.LOW:
        return 'BAIXO';
      case appConfig.taskPriorities.MEDIUM:
        return 'MÉDIO';
      case appConfig.taskPriorities.HIGH:
        return 'ALTO';
      case appConfig.taskPriorities.CRITICAL:
        return 'CRÍTICO';
      default:
        return String(task.priority ?? '');
    }
  }

  /** Label amigável de status (igual ao TaskDetailComponent.statusLabel) */
  getStatusLabel(task: Task): string {
    switch (task.status) {
      case appConfig.taskStatus.TODO:
        return 'NÃO INICIADO';
      case appConfig.taskStatus.IN_PROGRESS:
        return 'EM ANDAMENTO';
      case appConfig.taskStatus.BLOCKED:
        return 'PARADO';
      case appConfig.taskStatus.DONE:
        return 'CONCLUÍDO';
      default:
        return String(task.status ?? '');
    }
  }

  // ============================================================
  // =================== CORES DINÂMICAS (TAGS) =================
  // ============================================================

  /** Cor do "Tipo" baseada primeiro na Tag, depois no enum. */
  getTypeColor(task: Task): string {
    const tags = (task as any).tags as Tag[] | undefined;

    // 1) Tag ligada à tarefa
    const typeTag = tags?.find((t) => t.category === 'TYPE');
    if (typeTag?.color) {
      return typeTag.color;
    }

    // 2) Tag global com mesmo nome do tipo
    const upperType = String(task.type ?? '').trim().toUpperCase();
    const globalTypeTag = this.taskManager.tags.find(
      (t) =>
        t.category === 'TYPE' &&
        t.name.trim().toUpperCase() === upperType,
    );

    if (globalTypeTag?.color) {
      return globalTypeTag.color;
    }

    // 3) Fallback baseado no enum
    switch (task.type) {
      case appConfig.taskTypes.BUG:
        return '#e74c3c';
      case appConfig.taskTypes.FEATURE:
        return '#3498db';
      case appConfig.taskTypes.DOCUMENTATION:
        return '#2ecc71';
      default:
        return '#64748b';
    }
  }

  /** Cor da "Prioridade" baseada primeiro na Tag, depois no enum. */
  getPriorityColor(task: Task): string {
    const tags = (task as any).tags as Tag[] | undefined;

    // 1) Tag ligada à tarefa
    const priorityTag = tags?.find((t) => t.category === 'PRIORITY');
    if (priorityTag?.color) {
      return priorityTag.color;
    }

    // 2) Tag global mapeada pela prioridade padrão
    let tagName = '';

    switch (task.priority) {
      case appConfig.taskPriorities.LOW:
        tagName = 'BAIXO';
        break;
      case appConfig.taskPriorities.MEDIUM:
        tagName = 'MÉDIO';
        break;
      case appConfig.taskPriorities.HIGH:
        tagName = 'ALTO';
        break;
      case appConfig.taskPriorities.CRITICAL:
        tagName = 'CRÍTICO';
        break;
      default:
        tagName = '';
    }

    if (tagName) {
      const globalPriorityTag = this.taskManager.tags.find(
        (t) =>
          t.category === 'PRIORITY' &&
          t.name.trim().toUpperCase() === tagName.toUpperCase(),
      );
      if (globalPriorityTag?.color) {
        return globalPriorityTag.color;
      }
    }

    // 3) Fallback baseado na prioridade
    switch (task.priority) {
      case appConfig.taskPriorities.LOW:
        return '#3498db'; // BAIXO
      case appConfig.taskPriorities.MEDIUM:
        return '#FFFF00'; // MÉDIO
      case appConfig.taskPriorities.HIGH:
        return '#e74c3c'; // ALTO
      case appConfig.taskPriorities.CRITICAL:
        return '#FF0000'; // CRÍTICO
      default:
        return '#64748b';
    }
  }

  // ============================================================
  // ==================== STATUS → CLASSES ======================
  // ============================================================

  /**
   * Classe de status para pill (sincronizado com TaskDetailComponent.statusClass).
   * Mantém a mesma estratégia: base "pill" no template + classe dinâmica aqui.
   */
  getStatusClass(task: Task): string {
    if (!task?.status) return '';
    const statusLower = String(task.status).toLowerCase();
    return `pill-status-${statusLower}`;
  }
}
