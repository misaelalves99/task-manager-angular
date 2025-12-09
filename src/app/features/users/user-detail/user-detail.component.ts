// src/app/features/users/user-detail/user-detail.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  LucideAngularModule,
  ArrowLeft,
  User as UserIcon,
  Mail,
  BadgeCheck,
  Activity,
  Edit3,
  Trash2,
} from 'lucide-angular';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
})
export class UserDetailComponent implements OnInit {
  // estado
  user = signal<User | null>(null);
  notFound = signal(false);

  // ícones
  readonly backIcon = ArrowLeft;
  readonly userIcon = UserIcon;
  readonly mailIcon = Mail;
  readonly roleIcon = BadgeCheck;
  readonly activityIcon = Activity;
  readonly editIcon = Edit3;
  readonly deleteIcon = Trash2;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskManager: TaskManagerService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.notFound.set(true);
      return;
    }

    const found = this.taskManager.getAllUsers().find((u) => u.id === id) || null;

    if (!found) {
      this.notFound.set(true);
      return;
    }

    this.user.set(found);
  }

  get userInitial(): string {
    const current = this.user();
    if (!current?.name) return '?';
    return current.name.trim().charAt(0).toUpperCase();
  }

  get roleLabel(): string {
    const current = this.user();
    if (!current) return '';
    switch (current.role) {
      case 'DEV':
        return 'Desenvolvedor(a)';
      case 'QA':
        return 'Qualidade (QA)';
      case 'DOC':
        return 'Documentação';
      default:
        return current.role;
    }
  }

  handleBack(): void {
    this.router.navigate(['/users']);
  }
}
