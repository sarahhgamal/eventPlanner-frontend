import { Routes } from '@angular/router';
import { Auth } from './components/auth/auth';
import { EventList } from './components/event-list/event-list';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: Auth },
  { path: 'event-list', component: EventList }
];