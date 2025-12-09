// src/app/features/auth/auth-page.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  LucideAngularModule,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Chrome,
  Facebook,
  Instagram,
} from 'lucide-angular';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css'],
})
export class AuthPageComponent {
  mode: AuthMode = 'login';

  // Ícones Lucide usados no template
  readonly mailIcon = Mail;
  readonly lockIcon = Lock;
  readonly loginIcon = LogIn;
  readonly registerIcon = UserPlus;
  readonly googleIcon = Chrome; // usamos Chrome como "Google"
  readonly facebookIcon = Facebook;
  readonly instagramIcon = Instagram;

  // Fake form
  email = '';
  password = '';

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private router: Router) {}

  // Alternar entre Login e Cadastro
  setMode(mode: AuthMode): void {
    if (this.mode === mode) return;

    this.mode = mode;
    this.clearFeedback();
    this.password = '';
  }

  // "Esqueceu senha" fake
  onForgotPassword(): void {
    this.clearFeedback();

    if (!this.email.trim()) {
      this.errorMessage =
        'Informe seu e-mail para enviar o link de recuperação.';
      return;
    }

    this.successMessage = `Se este e-mail estiver cadastrado, enviaremos um link de recuperação para ${this.email}. (Fake)`;
  }

  // Login/Cadastro fake
  onSubmit(): void {
    this.clearFeedback();

    const email = this.email.trim();
    const password = this.password.trim();

    if (!email || !password) {
      this.errorMessage = 'Preencha e-mail e senha para continuar.';
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      // Simulação de sucesso
      if (this.mode === 'login') {
        console.log('[FAKE AUTH] Login', email);
      } else {
        console.log('[FAKE AUTH] Register', email);
      }

      this.isSubmitting = false;

      // 🔑 Redireciona para o dashboard após o "login fake"
      this.router.navigate(['/dashboard']);
    }, 900);
  }

  // Social logins fake
  onSocialLogin(provider: 'google' | 'facebook' | 'instagram'): void {
    this.clearFeedback();
    console.log('[FAKE SOCIAL LOGIN]', provider);

    // Se quiser mostrar uma mensagem rápida antes de redirecionar:
    this.successMessage = `Login social fake com ${provider.toUpperCase()} realizado! (Simulação)`;

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 600);
  }

  private clearFeedback(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
