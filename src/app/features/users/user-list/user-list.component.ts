// src/app/features/users/user-list/user-list.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  LucideAngularModule,
  UserPlus,
} from 'lucide-angular';

import { TaskManagerService } from '../../../core/services/task-manager.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);

  // ícone do botão "Novo usuário"
  readonly addUserIcon = UserPlus;

  constructor(private readonly taskManager: TaskManagerService) {}

  ngOnInit(): void {
    // Seed já foi executado no AppComponent
    this.users.set(this.taskManager.getAllUsers());
  }
}
