import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth';
import { EventCreate } from '../event-create/event-create';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EventCreate ],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css']
})
export class EventList {
  showCreateModal = false;
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }

  openCreateModal() {
    console.log('Opening modal');
    this.showCreateModal = true;
  }

  closeCreateModal() {
    console.log('Closing modal');
    this.showCreateModal = false;
  }
}
