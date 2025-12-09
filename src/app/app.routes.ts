// src/app/app.routes.ts

import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';

// ======================= TASKS =======================
import { TaskListComponent } from './features/tasks/task-list/task-list.component';
import { TaskCreateComponent } from './features/tasks/task-create/task-create.component';
import { TaskDetailComponent } from './features/tasks/task-detail/task-detail.component';
import { TaskEditComponent } from './features/tasks/task-edit/task-edit.component';
import { TaskDeleteComponent } from './features/tasks/task-delete/task-delete.component';

// ======================= USERS =======================
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserFormComponent } from './features/users/user-form/user-form.component';
import { UserDetailComponent } from './features/users/user-detail/user-detail.component';
import { UserEditComponent } from './features/users/user-edit/user-edit.component';
import { UserDeleteComponent } from './features/users/user-delete/user-delete.component';

// ======================= TAGS =======================
import { TagListComponent } from './features/tags/tag-list/tag-list.component';
import { TagCreateComponent } from './features/tags/tag-create/tag-create.component';
import { TagEditComponent } from './features/tags/tag-edit/tag-edit.component';
import { TagDeleteComponent } from './features/tags/tag-delete/tag-delete.component';

// ======================= AUTH =======================
import { AuthPageComponent } from './features/auth/auth-page.component';

export const routes: Routes = [
  // 🔐 Página de autenticação
  {
    path: 'auth',
    component: AuthPageComponent,
  },

  // 🏛 Área logada — Shell com sidebar + header
  {
    path: '',
    component: ShellComponent,
    children: [
      // Dashboard
      {
        path: 'dashboard',
        component: DashboardPageComponent,
      },

      // =====================================================
      // ======================== TASKS ======================
      // =====================================================

      {
        path: 'tasks',
        component: TaskListComponent,
      },
      {
        path: 'tasks/new',
        component: TaskCreateComponent,
      },
      {
        path: 'tasks/:id/edit',
        component: TaskEditComponent,
      },
      {
        path: 'tasks/:id/delete',
        component: TaskDeleteComponent,
      },
      {
        path: 'tasks/:id',
        component: TaskDetailComponent,
      },

      // =====================================================
      // ======================== USERS ======================
      // =====================================================

      {
        path: 'users',
        component: UserListComponent,
      },
      {
        path: 'users/new',
        component: UserFormComponent,
      },
      {
        path: 'users/:id',
        component: UserDetailComponent,
      },
      {
        path: 'users/:id/edit',
        component: UserEditComponent,
      },
      {
        path: 'users/:id/delete',
        component: UserDeleteComponent,
      },

      // =====================================================
      // ========================= TAGS ======================
      // =====================================================

      {
        path: 'tags',
        component: TagListComponent,
      },
      {
        path: 'tags/new',
        component: TagCreateComponent,
      },
      {
        path: 'tags/:id/edit',
        component: TagEditComponent,
      },
      {
        path: 'tags/:id/delete',
        component: TagDeleteComponent,
      },

      // Redirecionamento padrão da área logada
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // Rotas inválidas → login
  {
    path: '**',
    redirectTo: 'auth',
  },
];
