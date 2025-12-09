// src/app/features/users/user-edit/user-edit.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  LucideAngularModule,
  User,
  Mail,
  BadgeCheck,
  ArrowLeft,
  Save,
} from 'lucide-angular';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { User as UserModel } from '../../../core/models/user.model';

type UserRole = 'DEV' | 'QA' | 'DOC';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  // ícones
  readonly userIcon = User;
  readonly mailIcon = Mail;
  readonly roleIcon = BadgeCheck;
  readonly backIcon = ArrowLeft;
  readonly saveIcon = Save;

  // modelo
  userId: number | null = null;

  name = '';
  email = '';
  role: UserRole = 'DEV';
  isActive = true;

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  notFound = false;

  constructor(
    private readonly taskManager: TaskManagerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  get roles(): UserRole[] {
    return ['DEV', 'QA', 'DOC'];
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
        this.notFound = true;
        return;
    }

    const existing = this.taskManager.getUserById(id);

    if (!existing) {
        this.notFound = true;
        return;
    }

    this.userId = existing.id;
    this.name = existing.name;
    this.email = existing.email;
    this.role = existing.role as UserRole;

    // 🔥 Correto: usar o getter isActive
    this.isActive = existing.isActive;
  }

  onSubmit(): void {
    if (this.userId == null) {
      this.errorMessage = 'Usuário não encontrado.';
      return;
    }

    this.clearFeedback();

    const name = this.name.trim();
    const email = this.email.trim();

    if (!name || !email) {
      this.errorMessage = 'Preencha pelo menos nome e e-mail.';
      return;
    }

    this.isSubmitting = true;

    try {
      const updated = this.taskManager.updateUser(this.userId, {
        name,
        email,
        role: this.role,
        isActive: this.isActive,
      });

      if (!updated) {
        this.errorMessage = 'Usuário não encontrado para atualização.';
        this.isSubmitting = false;
        return;
      }

      this.successMessage = 'Usuário atualizado com sucesso! Redirecionando...';

      setTimeout(() => {
        this.isSubmitting = false;
        this.router.navigate(['/users', this.userId]);
      }, 900);
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Ocorreu um erro ao atualizar o usuário. Tente novamente.';
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    if (this.userId != null) {
      this.router.navigate(['/users', this.userId]);
    } else {
      this.router.navigate(['/users']);
    }
  }

  private clearFeedback(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
