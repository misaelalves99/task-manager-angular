// src/app/core/services/task-manager.service.ts

import { Injectable } from '@angular/core';

import { Tag, TagCategory } from '../models/tag.model';
import { Task } from '../models/task.model';
import { BugTask } from '../models/bug-task.model';
import { FeatureTask } from '../models/feature-task.model';
import { DocumentationTask } from '../models/documentation-task.model';
import { appConfig } from '../config/app-config';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';

export interface AddCommentPayload {
  taskId: number;
  content: string;
  authorId: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskManagerService {
  /** Todas as tags do sistema (inclui tipo, prioridade e novas criadas) */
  tags: Tag[] = [];

  /** Todas as tarefas do sistema (seed + criadas pelo usuário) */
  tasks: Task[] = [];

  /** Todos os usuários do sistema (seed + criados pelo usuário) */
  users: User[] = [];

  constructor() {
    this.seedDefaultTags();
    this.seedDefaultUsers();
    this.seedDemoTasks();
  }

  // ============================================================
  // ======================= USERS ==============================
  // ============================================================

  private seedDefaultUsers(): void {
    if (this.users.length > 0) return;

    const u1 = new User({
      id: 1,
      name: 'Misael Alves',
      email: 'misael@example.com',
      role: 'DEV',
      active: true,
    });

    const u2 = new User({
      id: 2,
      name: 'Ana Tester',
      email: 'ana.qa@example.com',
      role: 'QA',
      active: true,
    });

    const u3 = new User({
      id: 3,
      name: 'Carlos Docs',
      email: 'carlos.docs@example.com',
      role: 'DOC',
      active: true,
    });

    this.users.push(u1, u2, u3);
  }

  /** Retorna todos os usuários cadastrados. */
  getAllUsers(): User[] {
    return this.users;
  }

  /** Busca um usuário pelo id (ou undefined se não existir). */
  getUserById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  /** Cria um novo usuário e devolve a instância criada. */
  createUser(params: {
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }): User {
    const { name, email, role, isActive } = params;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nextId =
      this.users.length > 0
        ? Math.max(...this.users.map((u: User) => u.id)) + 1
        : 1;

    const newUser = new User({
      id: nextId,
      name: trimmedName,
      email: trimmedEmail,
      role,
      active: isActive,
    });

    this.users.push(newUser);
    return newUser;
  }

  /** Atualiza um usuário existente e devolve a instância atualizada ou null se não encontrar. */
  updateUser(
    id: number,
    changes: {
      name: string;
      email: string;
      role: string;
      isActive: boolean;
    },
  ): User | null {
    const target = this.getUserById(id);
    if (!target) return null;

    target.name = changes.name.trim();
    target.email = changes.email.trim();
    target.role = changes.role;

    // Mantém a API de ativação/desativação encapsulada na classe User
    if (changes.isActive) {
      target.activate();
    } else {
      target.deactivate();
    }

    return target;
  }

  /**
   * Remove um usuário:
   * - remove da lista de usuários
   * - remove a referência de responsável das tarefas que apontavam para ele
   */
  deleteUser(id: number): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    // Remove usuário da lista
    this.users.splice(index, 1);

    // Limpa referência em tarefas que tinham esse responsável
    this.tasks.forEach((task: Task) => {
      const anyTask = task as any;
      if (anyTask.responsible && anyTask.responsible.id === id) {
        anyTask.responsible = null;
      }
    });

    return true;
  }

  // ============================================================
  // ================= TAGS (SEM DUPLICAÇÕES) ===================
  // ============================================================

  private seedDefaultTags(): void {
    if (this.tags.length > 0) return;

    let id = 1;

    const createTag = (name: string, color: string, category: TagCategory) =>
      new Tag({ id: id++, name, color, category });

    // TYPE — alinhado com appConfig.taskTypes
    const bugTag = createTag(appConfig.taskTypes.BUG, '#e74c3c', 'TYPE');
    const featureTag = createTag(appConfig.taskTypes.FEATURE, '#3498db', 'TYPE');
    const documentationTag = createTag(
      appConfig.taskTypes.DOCUMENTATION,
      '#2ecc71',
      'TYPE',
    );

    // PRIORITY — usa labels PT-BR do appConfig
    const lowTag = createTag(
      appConfig.taskPriorities.LOW,
      '#3498db',
      'PRIORITY',
    );
    const mediumTag = createTag(
      appConfig.taskPriorities.MEDIUM,
      '#ffff00',
      'PRIORITY',
    );
    const highTag = createTag(
      appConfig.taskPriorities.HIGH,
      '#e74c3c',
      'PRIORITY',
    );
    const criticalTag = createTag(
      appConfig.taskPriorities.CRITICAL,
      '#ff0000',
      'PRIORITY',
    );

    this.tags.push(
      bugTag,
      featureTag,
      documentationTag,
      lowTag,
      mediumTag,
      highTag,
      criticalTag,
    );
  }

  getAllTags(): Tag[] {
    return this.tags;
  }

  findTagById(id: number): Tag | undefined {
    return this.tags.find((t) => t.id === id);
  }

  findTagByName(name: string): Tag | undefined {
    const target = name.trim().toUpperCase();
    return this.tags.find((t) => t.name.trim().toUpperCase() === target);
  }

  createTag(
    name: string,
    color: string,
    category: TagCategory = 'GENERIC',
  ): Tag {
    const trimmedName = name.trim();
    const trimmedColor = color.trim();

    const nextId =
      this.tags.length > 0
        ? Math.max(...this.tags.map((t: Tag) => t.id)) + 1
        : 1;

    const newTag = new Tag({
      id: nextId,
      name: trimmedName,
      color: trimmedColor || '#888888',
      category,
    });

    this.tags.push(newTag);
    return newTag;
  }

  /** Atualiza uma tag existente (nome, cor e categoria). */
  updateTag(
    id: number,
    data: { name: string; color: string; category: TagCategory },
  ): Tag | null {
    const tag = this.findTagById(id);
    if (!tag) return null;

    tag.name = data.name.trim();
    tag.color = data.color.trim() || tag.color;
    tag.category = data.category;

    return tag;
  }

  /**
   * Remove uma tag do sistema:
   * - remove da lista de tags
   * - remove referência dessa tag em todas as tarefas
   */
  deleteTag(id: number): void {
    // Remove da lista de tags
    this.tags = this.tags.filter((t) => t.id !== id);

    // Remove das tarefas que possuíam essa tag
    this.tasks.forEach((task: Task) => {
      const anyTask = task as any;
      if (Array.isArray(anyTask.tags)) {
        anyTask.tags = anyTask.tags.filter((t: Tag) => t.id !== id);
      }
    });
  }

  // ============================================================
  // =================== TAREFAS (SEED DEMO) ====================
  // ============================================================

  private seedDemoTasks(): void {
    if (this.tasks.length > 0) return;

    // Tags globais (já alinhadas ao appConfig)
    const bugTag = this.findTagByName(appConfig.taskTypes.BUG);
    const featureTag = this.findTagByName(appConfig.taskTypes.FEATURE);
    const docTag = this.findTagByName(appConfig.taskTypes.DOCUMENTATION);
    const lowTag = this.findTagByName(appConfig.taskPriorities.LOW);
    const mediumTag = this.findTagByName(appConfig.taskPriorities.MEDIUM);
    const highTag = this.findTagByName(appConfig.taskPriorities.HIGH);
    const criticalTag = this.findTagByName(appConfig.taskPriorities.CRITICAL);

    const [dev, qa, doc] = this.users;

    const now = new Date();

    // 1) Corrigir erro de login (BUG, CRÍTICO, NÃO INICIADO)
    const t1 = new BugTask({
      id: 1,
      title: 'Corrigir erro de login',
      description: 'Usuário não consegue logar com credenciais válidas.',
      priority: appConfig.taskPriorities.CRITICAL,
      createdAt: now,
      responsible: qa ?? null,
      severity: 'CRITICAL',
    });
    if (bugTag) t1.addTag(bugTag);
    if (criticalTag) t1.addTag(criticalTag);
    t1.markTodo();
    t1.estimatedHours = 7;

    // 2) Implementar dashboard de tarefas (FEATURE, MÉDIO, NÃO INICIADO)
    const t2 = new FeatureTask({
      id: 2,
      title: 'Implementar dashboard de tarefas',
      description:
        'Criar um dashboard com cards e filtros avançados para visualizar tarefas.',
      priority: appConfig.taskPriorities.MEDIUM,
      createdAt: now,
      responsible: dev ?? null,
      complexity: 3,
      businessValue: 4,
    });
    if (featureTag) t2.addTag(featureTag);
    if (mediumTag) t2.addTag(mediumTag);
    t2.markTodo();
    t2.estimatedHours = 12;

    // 3) Documentar fluxo de criação de tarefas (DOC, BAIXO, NÃO INICIADO)
    const t3 = new DocumentationTask({
      id: 3,
      title: 'Documentar fluxo de criação de tarefas',
      description: 'Escrever passo a passo do fluxo de criação de tarefas.',
      priority: appConfig.taskPriorities.LOW,
      createdAt: now,
      responsible: doc ?? null,
      pages: 3,
      isTechnical: true,
    });
    if (docTag) t3.addTag(docTag);
    if (lowTag) t3.addTag(lowTag);
    t3.markTodo();
    t3.estimatedHours = 10;

    // 4) Erro 500 ao salvar usuário (BUG, CRÍTICO, EM ANDAMENTO, QA)
    const t4 = new BugTask({
      id: 4,
      title: 'Erro 500 ao salvar usuário',
      description:
        'Ocorre erro 500 ao tentar salvar um novo usuário no sistema.',
      priority: appConfig.taskPriorities.CRITICAL,
      createdAt: now,
      responsible: qa ?? null,
      severity: 'CRITICAL',
    });
    if (bugTag) t4.addTag(bugTag);
    if (criticalTag) t4.addTag(criticalTag);
    t4.start();
    t4.estimatedHours = 8;

    // 5) Layout quebrado no dashboard mobile (BUG, ALTO, NÃO INICIADO, QA)
    const t5 = new BugTask({
      id: 5,
      title: 'Layout quebrado no dashboard mobile',
      description:
        'No modo mobile, o dashboard apresenta colunas sobrepostas.',
      priority: appConfig.taskPriorities.HIGH,
      createdAt: now,
      responsible: qa ?? null,
      severity: 'HIGH',
    });
    if (bugTag) t5.addTag(bugTag);
    if (highTag) t5.addTag(highTag);
    t5.markTodo();
    t5.estimatedHours = 9;

    // 6) Implementar filtro avançado de tarefas (FEATURE, MÉDIO, NÃO INICIADO, DEV, 10h)
    const t6 = new FeatureTask({
      id: 6,
      title: 'Implementar filtro avançado de tarefas',
      description:
        'Permitir filtro por status, tipo e responsável na listagem de tarefas.',
      priority: appConfig.taskPriorities.MEDIUM,
      createdAt: now,
      responsible: dev ?? null,
      complexity: 3,
      businessValue: 5,
    });
    if (featureTag) t6.addTag(featureTag);
    if (mediumTag) t6.addTag(mediumTag);
    t6.markTodo();
    t6.estimatedHours = 10;

    // 7) Integração com ferramenta de chat (FEATURE, ALTO, CONCLUÍDO, DEV)
    const t7 = new FeatureTask({
      id: 7,
      title: 'Integração com ferramenta de chat',
      description:
        'Integrar o sistema de tarefas com uma ferramenta externa de chat.',
      priority: appConfig.taskPriorities.HIGH,
      createdAt: now,
      responsible: dev ?? null,
      complexity: 4,
      businessValue: 5,
    });
    if (featureTag) t7.addTag(featureTag);
    if (highTag) t7.addTag(highTag);
    t7.complete();
    t7.estimatedHours = 11;

    // 8) Atualizar manual do usuário (DOC, BAIXO, NÃO INICIADO, DOC)
    const t8 = new DocumentationTask({
      id: 8,
      title: 'Atualizar manual do usuário',
      description: 'Atualizar o manual com as novas funcionalidades lançadas.',
      priority: appConfig.taskPriorities.LOW,
      createdAt: now,
      responsible: doc ?? null,
      pages: 5,
      isTechnical: false,
    });
    if (docTag) t8.addTag(docTag);
    if (lowTag) t8.addTag(lowTag);
    t8.markTodo();
    t8.estimatedHours = 10;

    // 9) Escrever documentação técnica da API (DOC, ALTO, PARADO, DOC, 11h)
    const t9 = new DocumentationTask({
      id: 9,
      title: 'Escrever documentação técnica da API',
      description: 'Documentar endpoints, parâmetros e exemplos da API.',
      priority: appConfig.taskPriorities.HIGH,
      createdAt: now,
      responsible: doc ?? null,
      pages: 12,
      isTechnical: true,
    });
    if (docTag) t9.addTag(docTag);
    if (highTag) t9.addTag(highTag);
    t9.block();
    t9.estimatedHours = 11;

    this.tasks.push(t1, t2, t3, t4, t5, t6, t7, t8, t9);
  }

  // ============================================================
  // ======================= TAREFAS API ========================
  // ============================================================

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  /**
   * Atualiza uma tarefa existente no array interno e retorna a instância atualizada.
   * Mantém a MESMA referência de objeto quando possível.
   */
  updateTask(updated: Task): Task | null {
    if (!updated) return null;

    const index = this.tasks.findIndex((t) => t.id === updated.id);
    if (index === -1) {
      return null;
    }

    const current: any = this.tasks[index] as any;
    const updatedAny: any = updated as any;

    // Copia apenas campos de dados (ignora funções/métodos)
    Object.keys(updatedAny).forEach((key) => {
      const value = updatedAny[key];
      if (typeof value !== 'function') {
        current[key] = value;
      }
    });

    return this.tasks[index];
  }

  // ============================================================
  // ==================== COMENTÁRIOS ===========================
  // ============================================================

  /**
   * Adiciona um comentário a uma tarefa específica.
   * Usado pelo TaskDetailComponent.onAddComment().
   */
  addCommentToTask(payload: AddCommentPayload): void {
    const task = this.tasks.find((t) => t.id === payload.taskId);
    if (!task) {
      throw new Error('addCommentToTask: tarefa não encontrada.');
    }

    const author = this.users.find((u) => u.id === payload.authorId);
    if (!author) {
      throw new Error('addCommentToTask: autor não encontrado.');
    }

    const comment = new Comment({
      id: Date.now(),
      content: payload.content,
      author,
      createdAt: new Date(),
    });

    // Usa API OOP da Task (garante touch/updatedAt)
    if (typeof (task as any).addComment === 'function') {
      (task as any).addComment(comment);
    } else {
      const anyTask = task as any;
      const comments: Comment[] = Array.isArray(anyTask.comments)
        ? anyTask.comments
        : [];
      comments.push(comment);
      anyTask.comments = comments;
      anyTask.updatedAt = new Date();
    }
  }
}
