import { Routes } from '@angular/router';
import { Auth } from './components/auth/auth';
import { EventList } from './components/event-list/event-list';
import { AuthGuard, NoAuthGuard } from './shared/guards/auth.guard';
import { EventDetails } from './components/event-details/event-details';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: Auth, /*canActivate: [NoAuthGuard]*/ },
  { path: 'event-details/:id', component: EventDetails, /*canActivate: [AuthGuard]*/ },
  { path: 'event-list', component: EventList, /*canActivate: [AuthGuard]*/ } // temp disaable auth guard for ui testing
];