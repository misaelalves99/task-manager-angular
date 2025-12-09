// src/app/features/tags/tag-delete/tag-delete.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { Tag } from '../../../core/models/tag.model';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-tag-delete',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tag-delete.component.html',
  styleUrls: ['./tag-delete.component.css'],
})
export class TagDeleteComponent implements OnInit {
  tag: Tag | null = null;
  relatedTasks: Task[] = [];

  isDeleting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskManager: TaskManagerService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.errorMessage = 'ID de tag inválido.';
      return;
    }

    const found = this.taskManager.findTagById(id);
    if (!found) {
      this.errorMessage = 'Tag não encontrada.';
      return;
    }

    this.tag = found;

    // Tarefas que usam esta tag
    this.relatedTasks = this.taskManager
      .getAllTasks()
      .filter((t: Task) =>
        Array.isArray((t as any).tags) &&
        (t as any).tags.some((tg: Tag) => tg.id === id),
      );
  }

  onConfirmDelete(): void {
    if (!this.tag) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isDeleting = true;

    try {
      this.taskManager.deleteTag(this.tag.id);
      this.successMessage = 'Tag removida com sucesso!';

      setTimeout(() => {
        this.isDeleting = false;
        this.router.navigate(['/tags']);
      }, 900);
    } catch (e) {
      console.error('Erro ao excluir tag:', e);
      this.errorMessage =
        'Ocorreu um erro ao excluir a tag. Verifique o console.';
      this.isDeleting = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/tags']);
  }
}
