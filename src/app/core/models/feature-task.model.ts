// src/app/core/models/feature-task.model.ts

import { Task } from './task.model';
import { appConfig, TaskPriority } from '../config/app-config';

export class FeatureTask extends Task {
  private _complexity: number; // 1 a 5
  private _businessValue: number; // 1 a 5

  constructor(params: {
    id: number;
    title: string;
    description?: string;
    priority?: TaskPriority;
    responsible?: import('./user.model').User | null;
    complexity?: number;
    businessValue?: number;
    createdAt?: Date;
  }) {
    const {
      id,
      title,
      description = '',
      priority = appConfig.taskPriorities.MEDIUM,
      responsible = null,
      complexity = 3,
      businessValue = 3,
      createdAt,
    } = params;

    super({
      id,
      title,
      description,
      priority,
      type: appConfig.taskTypes.FEATURE,
      responsible,
      createdAt,
    });

    this._complexity = complexity;
    this._businessValue = businessValue;
  }

  get complexity(): number {
    return this._complexity;
  }

  set complexity(value: number) {
    if (typeof value !== 'number' || value < 1 || value > 5) {
      console.log('⚠️ Complexidade inválida para FeatureTask (use 1 a 5).');
      return;
    }
    this._complexity = value;
    this['touch']?.();
  }

  get businessValue(): number {
    return this._businessValue;
  }

  set businessValue(value: number) {
    if (typeof value !== 'number' || value < 1 || value > 5) {
      console.log('⚠️ Valor de negócio inválido para FeatureTask (use 1 a 5).');
      return;
    }
    this._businessValue = value;
    this['touch']?.();
  }

  // Regra fictícia: base 2h + complexidade * 2 + impacto do valor de negócio
  override estimate(): number {
    let base = 2;
    base += this._complexity * 2;

    if (this._businessValue >= 4) {
      base += 2; // features de alto valor demandam mais validações
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
    console.log('\n🌟 Resumo da feature:');
    super.printSummary();
    console.log(`   Complexidade: ${this._complexity} (1-5)`);
    console.log(`   Valor de negócio: ${this._businessValue} (1-5)`);
  }
}
