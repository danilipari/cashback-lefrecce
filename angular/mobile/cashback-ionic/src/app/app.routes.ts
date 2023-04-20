import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'm/folder/inbox',
    pathMatch: 'full',
  },
  {
    path: 'm',
    redirectTo: 'm/folder/inbox',
    pathMatch: 'full',
  },
  {
    path: 'm/folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
];
