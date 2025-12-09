// src/app/shared/components/toolbar/toolbar.component.ts

import {
  Component,
  ElementRef,
  HostListener,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

// Ícones da lib lucide
import {
  LucideAngularModule,
  ClipboardList,
  User
} from 'lucide-angular';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent {
  
  // Ícone da logo
  readonly logoIcon = ClipboardList;

  // Ícone do avatar
  readonly userIcon = User;

  readonly menuOpen = signal(false);

  constructor(
    private router: Router,
    private eRef: ElementRef<HTMLElement>,
  ) {}

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }

  logout(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    console.log('Usuário deslogado (fake). Limpando sessão...');
    this.menuOpen.set(false);

    this.router.navigate(['/auth']);
  }
}
