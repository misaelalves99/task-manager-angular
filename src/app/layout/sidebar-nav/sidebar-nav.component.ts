// src/app/layout/sidebar-nav/sidebar-nav.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  LucideAngularModule,
  LayoutDashboard,
  ListChecks,
  Users,
  Tag,
} from 'lucide-angular';

interface NavItem {
  label: string;
  icon: any; // LucideIconData
  route: string;
}

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.css'],
})
export class SidebarNavComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/' },
    { label: 'Tarefas', icon: ListChecks, route: '/tasks' },
    { label: 'Usuários', icon: Users, route: '/users' },
    { label: 'Tags', icon: Tag, route: '/tags' },
  ];
}
