// src/app/features/tags/tag-create/tag-create.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { Tag, TagCategory } from '../../../core/models/tag.model';

@Component({
  selector: 'app-tag-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-create.component.html',
  styleUrls: ['./tag-create.component.css'],
})
export class TagCreateComponent {
  name = '';
  color = '#22c55e';

  // Agora padrão já é TYPE (Tipo)
  category: TagCategory = 'TYPE';

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Dropdown só com Tipo e Prioridade
  categoryOptions: { value: TagCategory; label: string }[] = [
    { value: 'TYPE', label: 'Tipo' },
    { value: 'PRIORITY', label: 'Prioridade' },
  ];

  constructor(
    private readonly taskManager: TaskManagerService,
    private readonly router: Router,
  ) {}

  onSubmit(): void {
    this.clearFeedback();

    const name = this.name.trim();
    const color = this.color.trim();
    const category = this.category;

    if (!name || !color) {
      this.errorMessage =
        'Preencha o nome, escolha uma cor e selecione a categoria da tag.';
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      try {
        const currentTags = this.taskManager.tags;
        const nextId =
          currentTags.length > 0
            ? Math.max(...currentTags.map((t: Tag) => t.id)) + 1
            : 1;

        const newTag = new Tag({
          id: nextId,
          name,
          color,
          category,
        });

        this.taskManager.tags.push(newTag);

        this.successMessage = 'Tag criada com sucesso! Redirecionando...';

        setTimeout(() => {
          this.router.navigate(['/tags']);
        }, 700);
      } catch (e) {
        console.error(e);
        this.errorMessage =
          'Ocorreu um erro ao criar a tag. Tente novamente.';
      } finally {
        this.isSubmitting = false;
      }
    }, 600);
  }

  onCancel(): void {
    this.router.navigate(['/tags']);
  }

  private clearFeedback(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
