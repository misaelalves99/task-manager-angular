// src/app/core/models/tag.model.ts

// Categoria de uso da tag dentro do Task Manager
// - TYPE: usada como "Tipo de tarefa" (BUG, FEATURE, DOCUMENTATION...)
// - PRIORITY: usada como "Prioridade" (LOW, MEDIUM, HIGH, CRITICAL...)
// - GENERIC: qualquer outra tag livre
export type TagCategory = 'TYPE' | 'PRIORITY' | 'GENERIC';

// Classe Tag representando uma etiqueta para tarefas.
// Mantém:
// - id somente leitura
// - nome e cor com validação
// - categoria (TYPE | PRIORITY | GENERIC)
// - método equals para comparação
export class Tag {
  readonly id: number;

  private _name: string;
  private _color: string;
  private _category: TagCategory;

  constructor(params: {
    id: number;
    name: string;
    color?: string;
    category?: TagCategory;
  }) {
    const {
      id,
      name,
      color = '#888888',
      category = 'GENERIC',
    } = params;

    this.id = id;
    this._name = name;
    this._color = color;
    this._category = category;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    if (!value || typeof value !== 'string') {
      console.log('⚠️ Nome da tag inválido.');
      return;
    }
    this._name = value.trim();
  }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    if (!value || typeof value !== 'string') {
      console.log('⚠️ Cor da tag inválida.');
      return;
    }
    this._color = value.trim();
  }

  get category(): TagCategory {
    return this._category;
  }

  set category(value: TagCategory) {
    if (!value) {
      console.log('⚠️ Categoria da tag inválida.');
      return;
    }
    this._category = value;
  }

  printSummary(): void {
    console.log('🏷️ Tag:');
    console.log(`   ID: ${this.id}`);
    console.log(`   Nome: ${this._name}`);
    console.log(`   Cor: ${this._color}`);
    console.log(`   Categoria: ${this._category}`);
  }

  equals(otherTag: unknown): boolean {
    if (!(otherTag instanceof Tag)) return false;
    return this.id === otherTag.id;
  }

  // Seed padrão: tipos e prioridades
  // Obs.: nomes em inglês para casar com TaskType / TaskPriority (LOW, HIGH etc)
  static createDefaultTypeAndPriorityTags(): Tag[] {
    let nextId = 1;

    const next = () => nextId++;

    return [
      // ===== Tipo de tarefa =====
      new Tag({
        id: next(),
        name: 'BUG',
        color: '#e74c3c', // BUG
        category: 'TYPE',
      }),
      new Tag({
        id: next(),
        name: 'FEATURE',
        color: '#3498db', // FEATURE
        category: 'TYPE',
      }),
      new Tag({
        id: next(),
        name: 'DOCUMENTATION',
        color: '#2ecc71', // DOCUMENTATION
        category: 'TYPE',
      }),

      // ===== Prioridade =====
      new Tag({
        id: next(),
        name: 'LOW',
        color: '#3498db', // BAIXO
        category: 'PRIORITY',
      }),
      new Tag({
        id: next(),
        name: 'MEDIUM',
        color: '#FFFF00', // MÉDIO
        category: 'PRIORITY',
      }),
      new Tag({
        id: next(),
        name: 'HIGH',
        color: '#e74c3c', // ALTO
        category: 'PRIORITY',
      }),
      new Tag({
        id: next(),
        name: 'CRITICAL',
        color: '#FF0000', // CRÍTICO
        category: 'PRIORITY',
      }),
    ];
  }
}
