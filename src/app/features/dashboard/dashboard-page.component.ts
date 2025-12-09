// src/app/features/dashboard/dashboard-page.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Task } from '../../core/models/task.model';
import { Tag } from '../../core/models/tag.model';
import { appConfig } from '../../core/config/app-config';
import { TaskManagerService } from '../../core/services/task-manager.service';

import {
  LucideAngularModule,
  ClipboardList,
  Hourglass,
  Zap,
  Puzzle,
} from 'lucide-angular';

interface DashboardStats {
  totalTasks: number;
  totalBugs: number;
  totalFeatures: number;
  totalDocs: number;
  openTasks: number;
  doneTasks: number;
  criticalTasks: number;
  highPriorityTasks: number;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
})
export class DashboardPageComponent implements OnInit {
  // Ícones Lucide usados nos cards
  readonly totalIcon = ClipboardList;
  readonly openIcon = Hourglass;
  readonly priorityIcon = Zap;
  readonly typeIcon = Puzzle;

  // Todas as tarefas vindas do TaskManagerService
  tasks = signal<Task[]>([]);

  stats = signal<DashboardStats>({
    totalTasks: 0,
    totalBugs: 0,
    totalFeatures: 0,
    totalDocs: 0,
    openTasks: 0,
    doneTasks: 0,
    criticalTasks: 0,
    highPriorityTasks: 0,
  });

  // Últimas 5 tarefas (mesmo estilo da lista)
  latestTasks = computed(() =>
    this.tasks()
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
      .slice(0, 5),
  );

  constructor(
    private readonly taskManager: TaskManagerService,
  ) {}

  ngOnInit(): void {
    // Fonte única de verdade → TaskManagerService
    const allTasks = this.taskManager.getAllTasks();
    this.tasks.set(allTasks);
    this.computeStats(allTasks);
  }

  // ============================================================
  // ===================== ESTATÍSTICAS =========================
  // ============================================================

  private computeStats(allTasks: Task[]): void {
    const totalTasks = allTasks.length;

    const totalBugs = allTasks.filter(
      (t) => t.type === appConfig.taskTypes.BUG,
    ).length;
    const totalFeatures = allTasks.filter(
      (t) => t.type === appConfig.taskTypes.FEATURE,
    ).length;
    const totalDocs = allTasks.filter(
      (t) => t.type === appConfig.taskTypes.DOCUMENTATION,
    ).length;

    const openTasks = allTasks.filter(
      (t) => t.status !== appConfig.taskStatus.DONE,
    ).length;
    const doneTasks = allTasks.filter(
      (t) => t.status === appConfig.taskStatus.DONE,
    ).length;

    const criticalTasks = allTasks.filter(
      (t) => t.priority === appConfig.taskPriorities.CRITICAL,
    ).length;
    const highPriorityTasks = allTasks.filter(
      (t) => t.priority === appConfig.taskPriorities.HIGH,
    ).length;

    this.stats.set({
      totalTasks,
      totalBugs,
      totalFeatures,
      totalDocs,
      openTasks,
      doneTasks,
      criticalTasks,
      highPriorityTasks,
    });
  }

  // ============================================================
  // ============ LABELS DINÂMICOS (USANDO TAGS) ================
  // ============================================================

  /** Texto que aparece na coluna "Tipo" (igual TaskList) */
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

  /** Texto que aparece na coluna "Prioridade" (igual TaskList) */
  getPriorityLabel(task: Task): string {
    const tags = (task as any).tags as Tag[] | undefined;

    // 1) Tag ligada à tarefa com categoria PRIORITY
    const priorityTag = tags?.find((t) => t.category === 'PRIORITY');
    if (priorityTag?.name?.trim()) {
      return priorityTag.name;
    }

    // 2) Fallback → mapeia enum para texto padrão
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

  // ============================================================
  // =================== CORES DINÂMICAS (TAGS) =================
  // ============================================================

  /** Cor do "Tipo" baseada primeiro na Tag, depois no enum (igual TaskList). */
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

  /** Cor da "Prioridade" baseada primeiro na Tag, depois no enum (igual TaskList). */
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
}
