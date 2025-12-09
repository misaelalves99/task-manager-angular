// src/app/app.component.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeedDataService } from './core/services/seed-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  readonly title = 'Task Manager Angular';

  constructor(private readonly seedDataService: SeedDataService) {
    // Executa o seed apenas uma vez (SeedDataService controla internamente)
    this.seedDataService.runSeedIfNeeded();
  }
}
