// src/app/features/tasks/task-delete/task-delete.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Task } from '../../../core/models/task.model';
import { TaskManagerService } from '../../../core/services/task-manager.service';

@Component({
  selector: 'app-task-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-delete.component.html',
  styleUrls: ['./task-delete.component.css'],
})
export class TaskDeleteComponent implements OnInit {
  task: Task | null = null;
  isLoading = true;
  deleteError = '';

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
    this.isLoading = false;
  }

  get hasTask(): boolean {
    return !!this.task;
  }

  onCancel(): void {
    if (!this.task) {
      this.router.navigate(['/tasks']);
      return;
    }
    this.router.navigate(['/tasks', this.task.id]);
  }

  onConfirmDelete(): void {
    this.deleteError = '';
    if (!this.task) return;

    try {
      // Se o serviço tiver o método de remoção, usamos
      if (typeof (this.taskManager as any).removeTaskById === 'function') {
        (this.taskManager as any).removeTaskById(this.task.id);
      } else {
        console.warn(
          '[TaskDelete] TaskManagerService.removeTaskById não encontrado. Implemente no serviço para remoção real.',
        );
      }

      // Depois da remoção, volta para a lista
      this.router.navigate(['/tasks']);
    } catch (err) {
      console.error(err);
      this.deleteError = 'Ocorreu um erro ao excluir a tarefa.';
    }
  }
}
