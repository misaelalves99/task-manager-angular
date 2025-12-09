// src/app/core/models/documentation-task.model.ts

import { Task } from './task.model';
import { appConfig, TaskPriority } from '../config/app-config';

export class DocumentationTask extends Task {
  private _pages: number; // quantidade aproximada de páginas
  private _isTechnical: boolean; // técnica ou de usuário

  constructor(params: {
    id: number;
    title: string;
    description?: string;
    priority?: TaskPriority;
    responsible?: import('./user.model').User | null;
    pages?: number;
    isTechnical?: boolean;
    createdAt?: Date;
  }) {
    const {
      id,
      title,
      description = '',
      priority = appConfig.taskPriorities.LOW,
      responsible = null,
      pages = 1,
      isTechnical = true,
      createdAt,
    } = params;

    super({
      id,
      title,
      description,
      priority,
      type: appConfig.taskTypes.DOCUMENTATION,
      responsible,
      createdAt,
    });

    this._pages = pages;
    this._isTechnical = isTechnical;
  }

  get pages(): number {
    return this._pages;
  }

  set pages(value: number) {
    if (typeof value !== 'number' || value <= 0) {
      console.log('⚠️ Quantidade de páginas inválida para DocumentationTask.');
      return;
    }
    this._pages = Math.ceil(value);
    this['touch']?.();
  }

  get isTechnical(): boolean {
    return this._isTechnical;
  }

  set isTechnical(value: boolean) {
    this._isTechnical = Boolean(value);
    this['touch']?.();
  }

  // Regra:
  // - 1h por página
  // - se técnico, +50%
  // - ajustes por prioridade
  override estimate(): number {
    let base = this._pages * 1;

    if (this._isTechnical) {
      base *= 1.5;
    }

    if (this.priority === appConfig.taskPriorities.HIGH) {
      base += 1;
    } else if (this.priority === appConfig.taskPriorities.CRITICAL) {
      base += 2;
    }

    this.estimatedHours = base;
    return this.estimatedHours;
  }

  override printSummary(): void {
    console.log('\n📚 Resumo da documentação:');
    super.printSummary();
    console.log(`   Páginas estimadas: ${this._pages}`);
    console.log(
      `   Tipo: ${
        this._isTechnical ? 'Documentação técnica' : 'Documentação de usuário'
      }`
    );
  }
}
