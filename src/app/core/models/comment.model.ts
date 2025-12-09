// src/app/core/models/comment.model.ts

import { User } from './user.model';

export class Comment {
  readonly id: number;
  private _author: User | null;
  private _content: string;
  private _createdAt: Date;

  constructor(params: {
    id: number;
    author?: User | null;
    content: string;
    createdAt?: Date;
  }) {
    const {
      id,
      author = null,
      content,
      createdAt = new Date(),
    } = params;

    if (author && !(author instanceof User)) {
      throw new Error('Comment: author deve ser uma instância de User ou null.');
    }

    this.id = id;
    this._author = author;
    this._content = content;
    this._createdAt = createdAt;
  }

  get author(): User | null {
    return this._author;
  }

  get content(): string {
    return this._content;
  }

  set content(newContent: string) {
    if (!newContent || typeof newContent !== 'string') {
      console.log('⚠️ Conteúdo de comentário inválido.');
      return;
    }
    this._content = newContent.trim();
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  printSummary(): void {
    console.log('💬 Comentário:');
    console.log(`   ID: ${this.id}`);
    console.log(
      `   Autor: ${this._author ? this._author.name : 'Anônimo'}`
    );
    console.log(`   Criado em: ${this._createdAt.toLocaleString('pt-BR')}`);
    console.log(`   Conteúdo: ${this._content}`);
  }

  equals(otherComment: unknown): boolean {
    if (!(otherComment instanceof Comment)) return false;
    return this.id === otherComment.id;
  }
}
