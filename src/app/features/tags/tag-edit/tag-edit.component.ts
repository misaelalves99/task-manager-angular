// src/app/features/tags/tag-edit/tag-edit.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { Tag, TagCategory } from '../../../core/models/tag.model';

@Component({
  selector: 'app-tag-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.css'],
})
export class TagEditComponent implements OnInit {
  tag: Tag | null = null;

  name = '';
  color = '#888888';
  category: TagCategory = 'GENERIC';

  isSaving = false;
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
    this.name = found.name;
    this.color = found.color || '#888888';
    this.category = found.category;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.tag) {
      this.errorMessage = 'Tag não encontrada.';
      return;
    }

    const trimmedName = this.name.trim();
    if (!trimmedName) {
      this.errorMessage = 'Informe um nome para a tag.';
      return;
    }

    this.isSaving = true;

    try {
      this.taskManager.updateTag(this.tag.id, {
        name: trimmedName,
        color: this.color,
        category: this.category,
      });

      this.successMessage = 'Tag atualizada com sucesso!';

      setTimeout(() => {
        this.isSaving = false;
        this.router.navigate(['/tags']);
      }, 900);
    } catch (e) {
      console.error('Erro ao atualizar tag:', e);
      this.errorMessage =
        'Ocorreu um erro ao atualizar a tag. Verifique o console.';
      this.isSaving = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/tags']);
  }
}
