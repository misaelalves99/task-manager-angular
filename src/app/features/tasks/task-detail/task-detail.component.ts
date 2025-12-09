// src/app/features/tasks/task-detail/task-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { Task } from '../../../core/models/task.model';
import { BugTask } from '../../../core/models/bug-task.model';
import { FeatureTask } from '../../../core/models/feature-task.model';
import { DocumentationTask } from '../../../core/models/documentation-task.model';
import { Comment } from '../../../core/models/comment.model';
import { User } from '../../../core/models/user.model';
import { appConfig } from '../../../core/config/app-config';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  isLoading = true;

  // comentário novo
  newCommentContent = '';
  commentError = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskManager: TaskManagerService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.isLoading = false;
      this.task = null;
      return;
    }

    this.loadTask(id);
  }

  private loadTask(id: number): void {
    // usa o método oficial do serviço
    const found = this.taskManager.getTaskById(id) ?? null;
    this.task = found;
    this.isLoading = false;
  }

  // ============================================================
  // ======================== GETTERS UI =========================
  // ============================================================

  get hasTask(): boolean {
    return !!this.task;
  }

  get tags() {
    return (this.task as any)?.tags ?? [];
  }

  get comments(): Comment[] {
    return (this.task as any)?.comments ?? [];
  }

  // ===== Tipo da tarefa (BUG / FEATURE / DOCUMENTATION) =====

  get isBug(): boolean {
    return this.task?.type === appConfig.taskTypes.BUG;
  }

  get isFeature(): boolean {
    return this.task?.type === appConfig.taskTypes.FEATURE;
  }

  get isDocumentation(): boolean {
    return this.task?.type === appConfig.taskTypes.DOCUMENTATION;
  }

  // Casts seguros para o template
  get bugTask(): BugTask | null {
    return this.isBug ? (this.task as BugTask) : null;
  }

  get featureTask(): FeatureTask | null {
    return this.isFeature ? (this.task as FeatureTask) : null;
  }

  get documentationTask(): DocumentationTask | null {
    return this.isDocumentation ? (this.task as DocumentationTask) : null;
  }

  // Datas auxiliares
  get taskCreatedAt(): Date | string | null {
    return this.task?.createdAt ?? null;
  }

  get taskUpdatedAt(): Date | string | null {
    const anyTask = this.task as any;
    return anyTask?.updatedAt ?? null;
  }

  get taskClosedAt(): Date | string | null {
    const anyTask = this.task as any;
    return anyTask?.closedAt ?? null;
  }

  // ===== Pills / labels =====

  // Prioridade → classe de pill
  get priorityClass(): string {
    if (!this.task) return '';

    switch (this.task.priority) {
      case appConfig.taskPriorities.LOW:
        return 'pill-priority-low';
      case appConfig.taskPriorities.MEDIUM:
        return 'pill-priority-medium';
      case appConfig.taskPriorities.HIGH:
        return 'pill-priority-high';
      case appConfig.taskPriorities.CRITICAL:
        return 'pill-priority-critical';
      default:
        return '';
    }
  }

  // Tipo → classe de pill
  get typeClass(): string {
    if (!this.task) return 'pill-type';

    switch (this.task.type) {
      case appConfig.taskTypes.BUG:
        return 'pill-type pill-type-bug';
      case appConfig.taskTypes.FEATURE:
        return 'pill-type pill-type-feature';
      case appConfig.taskTypes.DOCUMENTATION:
        return 'pill-type pill-type-documentation';
      default:
        return 'pill-type';
    }
  }

  // Status → classe de pill
  get statusClass(): string {
    if (!this.task) return '';
    const status = String(this.task.status).toLowerCase();
    return `pill-status-${status}`;
  }

  // Status → label amigável (sincronizado com o Edit)
  get statusLabel(): string {
    if (!this.task) return '';

    switch (this.task.status) {
      case appConfig.taskStatus.TODO:
        return 'NÃO INICIADO';
      case appConfig.taskStatus.IN_PROGRESS:
        return 'EM ANDAMENTO';
      case appConfig.taskStatus.BLOCKED:
        return 'PARADO';
      case appConfig.taskStatus.DONE:
        return 'CONCLUÍDO';
      default:
        return String(this.task.status ?? '');
    }
  }

  // ============================================================
  // ======================= AÇÕES DE STATUS =====================
  // ============================================================

  private markUpdated(): void {
    if (!this.task) return;
    (this.task as any).updatedAt = new Date();

    // mantém o array interno sincronizado (mesma instância)
    this.taskManager.updateTask(this.task);
  }

  // Botões de ação (enable/disable)

  get canStart(): boolean {
    if (!this.task) return false;
    return this.task.status === appConfig.taskStatus.TODO;
  }

  get canComplete(): boolean {
    if (!this.task) return false;
    return this.task.status === appConfig.taskStatus.IN_PROGRESS;
  }

  get canBlock(): boolean {
    if (!this.task) return false;
    return (
      this.task.status === appConfig.taskStatus.TODO ||
      this.task.status === appConfig.taskStatus.IN_PROGRESS
    );
  }

  get canReopen(): boolean {
    if (!this.task) return false;
    return (
      this.task.status === appConfig.taskStatus.DONE ||
      this.task.status === appConfig.taskStatus.BLOCKED
    );
  }

  // Iniciar → EM ANDAMENTO
  onStartTask(): void {
    if (!this.task || !this.canStart) return;

    const anyTask = this.task as any;
    if (typeof anyTask.start === 'function') {
      anyTask.start();
    } else {
      console.warn('[TaskDetail] Método start() não implementado na Task.');
    }

    this.markUpdated();
  }

  // Concluir → CONCLUÍDO
  onCompleteTask(): void {
    if (!this.task || !this.canComplete) return;

    const anyTask = this.task as any;
    if (typeof anyTask.complete === 'function') {
      anyTask.complete();
    } else {
      console.warn(
        '[TaskDetail] Método complete() não implementado na Task.',
      );
    }

    this.markUpdated();
  }

  // Parar → PARADO
  onBlockTask(): void {
    if (!this.task || !this.canBlock) return;

    const anyTask = this.task as any;

    if (typeof anyTask.block === 'function') {
      anyTask.block();
    } else {
      console.warn('[TaskDetail] Método block() não implementado na Task.');
    }

    this.markUpdated();
  }

  // Reabrir → volta para TODO ou IN_PROGRESS (regra da Task)
  onReopenTask(): void {
    if (!this.task || !this.canReopen) return;

    const anyTask = this.task as any;
    if (typeof anyTask.reopen === 'function') {
      anyTask.reopen();
    } else {
      console.warn('[TaskDetail] Método reopen() não implementado na Task.');
    }

    this.markUpdated();
  }

  // ============================================================
  // ======================== COMENTÁRIOS ========================
  // ============================================================

  onAddComment(): void {
    this.commentError = '';
    const content = this.newCommentContent.trim();

    if (!this.task) return;
    if (!content) {
      this.commentError = 'Digite um comentário antes de enviar.';
      return;
    }

    // escolhe um autor padrão (primeiro usuário cadastrado)
    const author: User | undefined = this.taskManager.users[0];

    if (!author) {
      this.commentError =
        'Não há usuários cadastrados para associar ao comentário.';
      return;
    }

    // Usa o método oficial do serviço (sincronizado com o array interno)
    this.taskManager.addCommentToTask({
      taskId: this.task.id,
      content,
      authorId: author.id,
    });

    // recarrega os comentários a partir da task atualizada
    const updated = this.taskManager.getTaskById(this.task.id);
    if (updated) {
      this.task = updated;
    }

    this.newCommentContent = '';
    this.markUpdated();
  }

  // ============================================================
  // ====================== HELPERS DE UI ========================
  // ============================================================

  formatDate(value: Date | string | null | undefined): string {
    if (!value) return '—';
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleString('pt-BR');
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  goToEdit(): void {
    if (!this.task) return;
    this.router.navigate(['/tasks', this.task.id, 'edit']);
  }

  goToDelete(): void {
    if (!this.task) return;
    this.router.navigate(['/tasks', this.task.id, 'delete']);
  }
}
