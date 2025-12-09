// src/app/features/tasks/task-edit/task-edit.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Task } from '../../../core/models/task.model';
import { BugTask } from '../../../core/models/bug-task.model';
import { FeatureTask } from '../../../core/models/feature-task.model';
import { DocumentationTask } from '../../../core/models/documentation-task.model';
import { TaskManagerService } from '../../../core/services/task-manager.service';
import {
  appConfig,
  TaskStatus,
  TaskPriority,
  TaskType,
} from '../../../core/config/app-config';
import { Tag } from '../../../core/models/tag.model';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.css'],
})
export class TaskEditComponent implements OnInit {
  task: Task | null = null;
  isLoading = true;
  isSaving = false;

  saveError = '';
  saveSuccess = '';

  // Dropdowns “espelho”
  selectedStatus: TaskStatus | '' = '';
  selectedType: TaskType | '' = '';
  selectedPriority: TaskPriority | '' = '';

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

    const all = this.taskManager.getAllTasks();
    const found = all.find((t) => t.id === id) ?? null;

    this.task = found ?? null;

    // sincroniza dropdowns com os valores atuais da tarefa
    if (this.task) {
      this.selectedStatus = this.task.status ?? '';

      const rawType = this.task.type as TaskType | 'GENERIC' | undefined;
      this.selectedType =
        rawType && rawType !== 'GENERIC' ? (rawType as TaskType) : '';

      this.selectedPriority = this.task.priority ?? '';
    }

    this.isLoading = false;
  }

  // ===== Helpers =====

  get hasTask(): boolean {
    return !!this.task;
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

  get bugTask(): BugTask | null {
    return this.isBug ? (this.task as BugTask) : null;
  }

  get featureTask(): FeatureTask | null {
    return this.isFeature ? (this.task as FeatureTask) : null;
  }

  get documentationTask(): DocumentationTask | null {
    return this.isDocumentation ? (this.task as DocumentationTask) : null;
  }

  // ===== Select options =====

  get priorityOptions(): TaskPriority[] {
    return Object.values(appConfig.taskPriorities);
  }

  get typeOptions(): TaskType[] {
    return Object.values(appConfig.taskTypes);
  }

  get statusOptions(): { value: TaskStatus; label: string }[] {
    return [
      { value: appConfig.taskStatus.TODO,        label: 'NÃO INICIADO' },
      { value: appConfig.taskStatus.IN_PROGRESS, label: 'EM ANDAMENTO' },
      { value: appConfig.taskStatus.BLOCKED,     label: 'PARADO' },
      { value: appConfig.taskStatus.DONE,        label: 'CONCLUÍDO' },
    ];
  }

  // ===== Handlers de mudança de dropdown =====

  onTypeChange(newType: TaskType | ''): void {
    if (!this.task || !newType) return;

    // 1) Atualiza o tipo oficial da Task (setter da classe)
    this.task.type = newType;
    this.selectedType = newType;

    // 2) Sincroniza TAGs de categoria TYPE
    const anyTask = this.task as any;
    const currentTags: Tag[] = Array.isArray(anyTask.tags)
      ? anyTask.tags
      : [];

    // remove todas as tags TYPE atuais
    const withoutTypeTags = currentTags.filter(
      (t) => t.category !== 'TYPE',
    );

    // mapeia o enum do tipo para o nome da Tag de TYPE
    const targetTagName = (() => {
      switch (newType) {
        case appConfig.taskTypes.BUG:
          return 'BUG';
        case appConfig.taskTypes.FEATURE:
          return 'FEATURE';
        case appConfig.taskTypes.DOCUMENTATION:
          // no seed usamos 'DOCUMENTATION' para a Tag TYPE
          return 'DOCUMENTATION';
        default:
          return '';
      }
    })();

    let newTypeTag: Tag | undefined;
    if (targetTagName) {
      newTypeTag = this.taskManager.tags.find(
        (t) =>
          t.category === 'TYPE' &&
          t.name.trim().toUpperCase() === targetTagName.toUpperCase(),
      );
    }

    anyTask.tags = newTypeTag
      ? [...withoutTypeTags, newTypeTag]
      : withoutTypeTags;

    anyTask.updatedAt = new Date();
  }

  onPriorityChange(newPriority: TaskPriority | ''): void {
    if (!this.task || !newPriority) return;

    // usa o setter da classe Task
    this.task.priority = newPriority;

    // mantém dropdown sincronizado
    this.selectedPriority = newPriority;
  }

  onStatusChange(newStatus: TaskStatus | ''): void {
    if (!this.task || !newStatus) return;

    const current = this.task.status;
    if (current === newStatus) {
      this.selectedStatus = current;
      return;
    }

    switch (newStatus) {
      case appConfig.taskStatus.TODO:
        this.task.markTodo();
        break;
      case appConfig.taskStatus.IN_PROGRESS:
        this.task.start();
        break;
      case appConfig.taskStatus.BLOCKED:
        this.task.block();
        break;
      case appConfig.taskStatus.DONE:
        this.task.complete();
        break;
    }

    this.selectedStatus = this.task.status;
    (this.task as any).updatedAt = new Date();
  }

  // ===== Ações =====

  onSave(): void {
    this.saveError = '';
    this.saveSuccess = '';

    if (!this.task) return;

    this.isSaving = true;

    try {
      (this.task as any).updatedAt = new Date();

      // Como a task é a MESMA instância do array do serviço,
      // essa chamada garante consistência (mesmo que hoje seja no-op).
      this.taskManager.updateTask(this.task);

      this.saveSuccess =
        'Tarefa atualizada com sucesso! Voltando para os detalhes...';

      setTimeout(() => {
        this.isSaving = false;
        this.router.navigate(['/tasks', this.task!.id]);
      }, 800);
    } catch (err) {
      console.error(err);
      this.saveError = 'Ocorreu um erro ao salvar a tarefa.';
      this.isSaving = false;
    }
  }

  onCancel(): void {
    if (!this.task) {
      this.router.navigate(['/tasks']);
      return;
    }
    this.router.navigate(['/tasks', this.task.id]);
  }
}
