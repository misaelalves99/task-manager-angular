// src/app/core/models/user.model.ts

// Classe User representando um usuário responsável por tarefas.
// Versão adaptada para TypeScript/Angular, mantendo a ideia de:
// - Encapsulamento via campos privados
// - id somente leitura
// - Método equals para comparação

export class User {
  private _name: string;
  private _email: string;
  private _active: boolean;

  readonly id: number;
  role: string;

  constructor(params: {
    id: number;
    name: string;
    email: string;
    role?: string;
    active?: boolean;
  }) {
    const {
      id,
      name,
      email,
      role = 'USER',
      active = true,
    } = params;

    this.id = id;
    this._name = name;
    this._email = email;
    this.role = role;
    this._active = active;
  }

  // ===== Getters/Setters =====

  get name(): string {
    return this._name;
  }

  set name(newName: string) {
    if (!newName || typeof newName !== 'string') {
      console.log('⚠️ Nome de usuário inválido.');
      return;
    }
    this._name = newName.trim();
  }

  get email(): string {
    return this._email;
  }

  set email(newEmail: string) {
    if (!newEmail || !newEmail.includes('@')) {
      console.log('⚠️ E-mail de usuário inválido.');
      return;
    }
    this._email = newEmail.trim();
  }

  get isActive(): boolean {
    return this._active;
  }

  deactivate(): void {
    this._active = false;
    console.log(`🚫 Usuário "${this._name}" foi desativado.`);
  }

  activate(): void {
    this._active = true;
    console.log(`✅ Usuário "${this._name}" foi reativado.`);
  }

  // ===== Métodos utilitários =====

  printSummary(): void {
    console.log('👤 Resumo do usuário:');
    console.log(`   ID: ${this.id}`);
    console.log(`   Nome: ${this._name}`);
    console.log(`   E-mail: ${this._email}`);
    console.log(`   Papel: ${this.role}`);
    console.log(`   Ativo: ${this._active ? 'Sim' : 'Não'}`);
  }

  equals(otherUser: unknown): boolean {
    if (!(otherUser instanceof User)) return false;
    return this.id === otherUser.id;
  }
}
