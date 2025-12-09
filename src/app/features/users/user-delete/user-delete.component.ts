// src/app/features/users/user-delete/user-delete.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  LucideAngularModule,
  ArrowLeft,
  Trash2,
  User as UserIcon,
  Mail,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-angular';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-delete',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './user-delete.component.html',
  styleUrls: ['./user-delete.component.css'],
})
export class UserDeleteComponent implements OnInit {
  user = signal<User | null>(null);
  notFound = signal(false);
  isDeleting = signal(false);
  errorMessage = signal('');

  readonly backIcon = ArrowLeft;
  readonly deleteIcon = Trash2;
  readonly userIcon = UserIcon;
  readonly mailIcon = Mail;
  readonly roleIcon = BadgeCheck;
  readonly warningIcon = AlertTriangle;

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

    const found = this.taskManager.getUserById(id) ?? null;
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

  onCancel(): void {
    const current = this.user();
    if (current) {
      this.router.navigate(['/users', current.id]);
    } else {
      this.router.navigate(['/users']);
    }
  }

  onConfirmDelete(): void {
    const current = this.user();
    if (!current) return;

    this.errorMessage.set('');
    this.isDeleting.set(true);

    const ok = this.taskManager.deleteUser(current.id);

    if (!ok) {
      this.errorMessage.set('Não foi possível excluir o usuário. Tente novamente.');
      this.isDeleting.set(false);
      return;
    }

    setTimeout(() => {
      this.isDeleting.set(false);
      this.router.navigate(['/users']);
    }, 600);
  }
}
