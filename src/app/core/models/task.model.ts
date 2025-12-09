// src/app/core/models/task.model.ts

import {
  appConfig,
  TaskPriority,
  TaskStatus,
  TaskType,
} from '../config/app-config';
import { User } from './user.model';
import { Tag } from './tag.model';
import { Comment } from './comment.model';

export class Task {
  readonly id: number;

  private _title: string;
  private _description: string;
  private _status: TaskStatus; // valores PT-BR vindos do appConfig
  private _priority: TaskPriority;
  private _type: TaskType | 'GENERIC';
  private _estimatedHours: number;

  responsible: User | null;
  tags: Tag[];
  comments: Comment[];

  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null = null; // usado pelo TaskDetailComponent

  constructor(params: {
    id: number;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    type?: TaskType | 'GENERIC';
    responsible?: User | null;
    tags?: Tag[];
    comments?: Comment[];
    createdAt?: Date;
    closedAt?: Date | null;
  }) {
    const {
      id,
      title,
      description = '',
      status = appConfig.taskStatus.TODO,
      priority = appConfig.taskPriorities.MEDIUM,
      type = 'GENERIC',
      responsible = null,
      tags = [],
      comments = [],
      createdAt = new Date(),
      closedAt = null,
    } = params;

    this.id = id;
    this._title = title;
    this._description = description;

    this._status = status;
    this._priority = priority;
    this._type = type;
    this._estimatedHours = 0;

    this.responsible = responsible instanceof User ? responsible : null;
    this.tags = Array.isArray(tags) ? tags.filter((t) => t instanceof Tag) : [];
    this.comments = Array.isArray(comments)
      ? comments.filter((c) => c instanceof Comment)
      : [];

    this.createdAt = createdAt;
    this.updatedAt = createdAt;
    this.closedAt = closedAt;
  }

  // ============================================================
  // ==================== GETTERS & SETTERS =====================
  // ============================================================

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    if (!value || typeof value !== 'string') return;
    this._title = value.trim();
    this.touch();
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    if (typeof value !== 'string') return;
    this._description = value.trim();
    this.touch();
  }

  get status(): TaskStatus {
    return this._status;
  }

  get priority(): TaskPriority {
    return this._priority;
  }

  set priority(value: TaskPriority) {
    if (!Object.values(appConfig.taskPriorities).includes(value)) return;
    this._priority = value;
    this.touch();
  }

  get type(): TaskType | 'GENERIC' {
    return this._type;
  }

  /**
   * Setter de tipo – passa SEMPRE por aqui.
   * Isso garante que o assign `task.type = ...` funcione corretamente,
   * e resolve o problema de o tipo não atualizar em tela.
   */
  set type(value: TaskType | 'GENERIC') {
    const validTypes = Object.values(appConfig.taskTypes);

    // permite "GENERIC" como fallback
    if (value !== 'GENERIC' && !validTypes.includes(value as TaskType)) {
      return;
    }

    this._type = value;
    this.touch();
  }

  get estimatedHours(): number {
    return this._estimatedHours;
  }

  set estimatedHours(value: number) {
    if (typeof value !== 'number' || value < 0) return;
    this._estimatedHours = value;
    this.touch();
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }

  // ============================================================
  // ===================== CONTROLE DE STATUS ===================
  // ============================================================

  /**
   * NÃO INICIADO
   */
  markTodo(): void {
    this._status = appConfig.taskStatus.TODO;
    this.closedAt = null;
    this.touch();
  }

  /**
   * EM ANDAMENTO
   */
  start(): void {
    if (this._status === appConfig.taskStatus.DONE) return;
    this._status = appConfig.taskStatus.IN_PROGRESS;
    this.closedAt = null;
    this.touch();
  }

  /**
   * PARADO
   */
  block(): void {
    if (this._status === appConfig.taskStatus.DONE) return;
    this._status = appConfig.taskStatus.BLOCKED;
    this.closedAt = null;
    this.touch();
  }

  /**
   * CONCLUÍDO
   */
  complete(): void {
    this._status = appConfig.taskStatus.DONE;
    this.closedAt = new Date();
    this.touch();
  }

  /**
   * Reabre:
   * - Se estava CONCLUÍDO → volta para NÃO INICIADO
   * - Se estava PARADO → volta para EM ANDAMENTO
   */
  reopen(): void {
    if (this._status === appConfig.taskStatus.DONE) {
      this._status = appConfig.taskStatus.TODO;
      this.closedAt = null;
    } else if (this._status === appConfig.taskStatus.BLOCKED) {
      this._status = appConfig.taskStatus.IN_PROGRESS;
      this.closedAt = null;
    } else {
      return;
    }

    this.touch();
  }

  // ============================================================
  // ======================= RESPONSÁVEL ========================
  // ============================================================

  setResponsible(user: User): void {
    if (!(user instanceof User)) return;
    this.responsible = user;
    this.touch();
  }

  // ============================================================
  // ======================= TAGS & COMENTÁRIOS =================
  // ============================================================

  addTag(tag: Tag): void {
    if (!(tag instanceof Tag)) return;
    if (this.tags.some((t) => t.equals(tag))) return;

    this.tags.push(tag);
    this.touch();
  }

  removeTag(tagId: number): boolean {
    const index = this.tags.findIndex((t) => t.id === tagId);
    if (index === -1) return false;

    this.tags.splice(index, 1);
    this.touch();
    return true;
  }

  addComment(comment: Comment): void {
    if (!(comment instanceof Comment)) return;
    this.comments.push(comment);
    this.touch();
  }

  // ============================================================
  // ========================= ESTIMATIVA =======================
  // ============================================================

  estimate(): number {
    this._estimatedHours = 1;
    return this._estimatedHours;
  }

  // ============================================================
  // ========================= UTILITÁRIOS ======================
  // ============================================================

  printSummary(): void {
    console.log('\n📝 Resumo da tarefa:');
    console.log(`ID: ${this.id}`);
    console.log(`Título: ${this._title}`);
    console.log(`Descrição: ${this._description}`);
    console.log(`Tipo: ${this._type}`);
    console.log(`Prioridade: ${this._priority}`);
    console.log(`Status: ${this._status}`);
    console.log(
      `Responsável: ${this.responsible ? this.responsible.name : 'Nenhum'}`,
    );
    console.log(`Estimativa: ${this._estimatedHours}h`);
    console.log(`Criada: ${this.createdAt.toLocaleString('pt-BR')}`);
    console.log(`Atualizada: ${this.updatedAt.toLocaleString('pt-BR')}`);
    console.log(
      `Concluída: ${
        this.closedAt ? this.closedAt.toLocaleString('pt-BR') : '—'
      }`,
    );
  }

  equals(otherTask: unknown): boolean {
    return otherTask instanceof Task && this.id === otherTask.id;
  }

  toJSON() {
    return {
      id: this.id,
      title: this._title,
      description: this._description,
      status: this._status,
      priority: this._priority,
      type: this._type,
      estimatedHours: this._estimatedHours,
      responsibleId: this.responsible ? this.responsible.id : null,
      tagIds: this.tags.map((t) => t.id),
      commentIds: this.comments.map((c) => c.id),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      closedAt: this.closedAt ? this.closedAt.toISOString() : null,
    };
  }
}
