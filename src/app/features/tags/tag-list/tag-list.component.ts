// src/app/features/tags/tag-list/tag-list.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { Tag } from '../../../core/models/tag.model';

import {
  LucideAngularModule,
  Edit3,
  Trash2,
} from 'lucide-angular';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css'],
})
export class TagListComponent implements OnInit {
  tags = signal<Tag[]>([]);

  // Ícones usados via [img] (não depende de provider global)
  readonly editIcon = Edit3;
  readonly deleteIcon = Trash2;

  constructor(private readonly taskManager: TaskManagerService) {}

  ngOnInit(): void {
    this.tags.set(this.taskManager.getAllTags());
  }

  /** Tags de Tipo (TYPE) – usadas no dropdown de tipo da tarefa. */
  get typeTags(): Tag[] {
    const all = this.tags();

    return all.filter((t) => {
      if (t.category === 'TYPE') return true;

      const name = t.name?.trim().toUpperCase();
      return (
        name === 'BUG' ||
        name === 'FEATURE' ||
        name === 'DOCUMENTATION'
      );
    });
  }

  /** Tags de Prioridade (PRIORITY) – usadas no dropdown de prioridade. */
  get priorityTags(): Tag[] {
    const all = this.tags();

    return all.filter((t) => {
      if (t.category === 'PRIORITY') return true;

      const name = t.name?.trim().toUpperCase();
      return (
        name === 'BAIXO' ||
        name === 'MÉDIO' ||
        name === 'MEDIO' ||
        name === 'ALTO' ||
        name === 'CRÍTICO' ||
        name === 'CRITICO'
      );
    });
  }
}
