// src/app/features/users/user-form/user-form.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent {
  // ícones
  readonly userIcon = User;
  readonly mailIcon = Mail;
  readonly roleIcon = BadgeCheck;
  readonly backIcon = ArrowLeft;
  readonly saveIcon = Save;

  // form model
  name = '';
  email = '';
  role: UserRole = 'DEV';
  isActive = true;

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly taskManager: TaskManagerService,
    private readonly router: Router,
  ) {}

  get roles(): UserRole[] {
    return ['DEV', 'QA', 'DOC'];
  }

  onSubmit(): void {
    this.clearFeedback();

    const name = this.name.trim();
    const email = this.email.trim();

    if (!name || !email) {
      this.errorMessage = 'Preencha pelo menos nome e e-mail.';
      return;
    }

    this.isSubmitting = true;

    try {
      const newUser: UserModel = this.taskManager.createUser({
        name,
        email,
        role: this.role,
        isActive: this.isActive,
      }) as UserModel;

      console.log('[USER CREATE] Novo usuário criado:', newUser);

      this.successMessage = 'Usuário criado com sucesso! Redirecionando...';

      setTimeout(() => {
        this.isSubmitting = false;
        this.router.navigate(['/users']);
      }, 900);
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Ocorreu um erro ao criar o usuário. Tente novamente.';
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  private clearFeedback(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
