// src/app/core/models/bug-task.model.ts

import { Task } from './task.model';
import { appConfig, TaskPriority } from '../config/app-config';
import { User } from './user.model';

export type BugSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class BugTask extends Task {
  private _severity: BugSeverity;
  private _stepsToReproduce: string;

  constructor(params: {
    id: number;
    title: string;
    description?: string;
    priority?: TaskPriority;
    responsible?: User | null;
    severity?: BugSeverity;
    stepsToReproduce?: string;
    createdAt?: Date;
  }) {
    const {
      id,
      title,
      description = '',
      priority = appConfig.taskPriorities.MEDIUM,
      responsible = null,
      severity = 'MEDIUM',
      stepsToReproduce = '',
      createdAt,
    } = params;

    super({
      id,
      title,
      description,
      priority,
      type: appConfig.taskTypes.BUG,
      responsible,
      createdAt,
    });

    this._severity = severity;
    this._stepsToReproduce = stepsToReproduce;
  }

  // ============================================================
  // ==================== GETTERS / SETTERS =====================
  // ============================================================

  get severity(): BugSeverity {
    return this._severity;
  }

  set severity(value: BugSeverity) {
    const allowed: BugSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!allowed.includes(value)) {
      console.warn('⚠️ Severidade inválida para BugTask.');
      return;
    }
    this._severity = value;
    this.touch(); // agora usamos o protected da Task diretamente
  }

  get stepsToReproduce(): string {
    return this._stepsToReproduce;
  }

  set stepsToReproduce(value: string) {
    if (typeof value !== 'string') {
      console.warn('⚠️ Passos para reproduzir inválidos.');
      return;
    }
    this._stepsToReproduce = value.trim();
    this.touch();
  }

  // ============================================================
  // ========================= ESTIMATIVA =======================
  // ============================================================

  // Polimorfismo: estimativa diferente dependendo do tipo (BUG) e severidade
  override estimate(): number {
    let base = 2; // base em horas

    switch (this._severity) {
      case 'LOW':
        base = 1;
        break;
      case 'MEDIUM':
        base = 2;
        break;
      case 'HIGH':
        base = 4;
        break;
      case 'CRITICAL':
        base = 8;
        break;
      default:
        base = 2;
    }

    // Ajuste por prioridade herdada
    if (this.priority === appConfig.taskPriorities.CRITICAL) {
      base += 2;
    } else if (this.priority === appConfig.taskPriorities.HIGH) {
      base += 1;
    }

    this.estimatedHours = base;
    return this.estimatedHours;
  }

  // ============================================================
  // ========================= DEBUG / JSON =====================
  // ============================================================

  override printSummary(): void {
    console.log('\n🐞 Resumo do bug:');
    super.printSummary();
    console.log(`   Severidade: ${this._severity}`);
    console.log(
      `   Passos para reproduzir: ${
        this._stepsToReproduce || '(não informados)'
      }`,
    );
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      severity: this._severity,
      stepsToReproduce: this._stepsToReproduce,
    };
  }
}
