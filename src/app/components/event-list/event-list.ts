import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth';
import { EventCreate } from '../event-create/event-create';
import { EventEdit } from '../event-edit/event-edit';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EventCreate, EventEdit ],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css']
})
export class EventList {
  showCreateModal = false;

  showEditModal = false;
  selectedEventId = '';
  selectedEventData: any = null;

  constructor(private auth: AuthService, private router: Router) {}

  // logout
  logout() {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }

  // event details
  viewEventDetails(eventId: string) {
    this.router.navigate(['/event-details', eventId]);
  }

  // create event
  openCreateModal() {
    console.log('Opening modal');
    this.showCreateModal = true;
  }

  closeCreateModal() {
    console.log('Closing modal');
    this.showCreateModal = false;
  }

  createNewEvent(eventData: any) {
    console.log('Creating event:', eventData);
    // Call EventService.createEvent(eventData)
    // Handle API response
  }

  // edit event
  openEditModal(eventId: string, eventData: any) {
    console.log('Opening edit modal for event:', eventId);
    this.selectedEventId = eventId;
    this.selectedEventData = eventData;
    this.showEditModal = true;
  }

  closeEditModal() {
    console.log('Closing edit modal');
    this.showEditModal = false;
    this.selectedEventId = '';
    this.selectedEventData = null;
  }

  saveEditEvent(updatedData: any) {
    console.log('Saving updated event:', updatedData);
    // Call EventService.updateEvent(this.selectedEventId, updatedData)
    // Handle API response
  }
}
