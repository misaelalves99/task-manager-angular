// src/app/core/services/seed-data.service.ts

import { Injectable } from '@angular/core';

import { TaskManagerService } from './task-manager.service';

@Injectable({
  providedIn: 'root',
})
export class SeedDataService {
  private seeded = false;

  constructor(private readonly taskManager: TaskManagerService) {}

  /**
   * Chame este método uma vez (por exemplo, no AppComponent)
   * apenas para garantir usuários extras de exemplo.
   *
   * Agora **não** criamos mais tarefas aqui, só usuários.
   * As 9 tarefas oficiais vêm exclusivamente de TaskManagerService.seedDemoTasks().
   */
  runSeedIfNeeded(): void {
    if (this.seeded) return;
    this.seeded = true;

    console.log(
      '\n💾 SeedDataService: garantindo usuários extras de exemplo...\n',
    );

    // Já existem alguns usuários iniciais definidos no TaskManagerService
    // (Misael, Ana, Carlos). Aqui adicionamos apenas se ainda não existirem.

    const ensureUser = (name: string, email: string, role: string) => {
      const alreadyExists = this.taskManager.users.some(
        (u) =>
          u.name.trim().toLowerCase() === name.trim().toLowerCase() ||
          u.email.trim().toLowerCase() === email.trim().toLowerCase(),
      );

      if (!alreadyExists) {
        this.taskManager.createUser({
          name,
          email,
          role,
          isActive: true,
        });
      }
    };

    // Usuários extras de exemplo
    ensureUser('Alice Developer', 'alice@example.com', 'DEV');
    ensureUser('Bob Tester', 'bob@example.com', 'QA');
    ensureUser('Carol Writer', 'carol@example.com', 'DOC');

    // 🔥 Importante: NÃO criamos tarefas aqui.
    // As únicas tarefas de exemplo são as 9 definidas em TaskManagerService.seedDemoTasks().
  }
}
