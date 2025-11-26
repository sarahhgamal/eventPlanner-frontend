import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventEdit } from '../event-edit/event-edit';
import { EventService } from '../../services/event/event.service';
import { AuthService } from '../../services/auth/auth';
import { CreateEventDto, EventDTO } from '../../models/event.models';

interface EventViewModel {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: { id: string; name: string; email: string };
  attendees: any[];
  userRole: 'organizer' | 'attendee';
  userRSVP?: 'going' | 'maybe' | 'notgoing';
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EventEdit],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  events: EventViewModel[] = [];
  filteredEvents: EventViewModel[] = [];
  isLoading = true;
  sidebarExpanded = false;

  // Search and filter
  searchQuery = '';
  filterRSVP: 'all' | 'going' | 'maybe' | 'notgoing' = 'all';

  // Modals
  showCreateModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  selectedEvent: EventViewModel | null = null;

  // Create event form
  newEventTitle = '';
  newEventDate = '';
  newEventTime = '';
  newEventLocation = '';
  newEventDescription = '';
  createError = '';
  dateError = '';

  // Current user ID for role determination
  private currentUserId: string = '';

  constructor(
    private router: Router,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    this.eventService.getAllMyEvents().subscribe({
      next: (response) => {
        if (response.events) {
          this.events = this.transformEvents(response.events);
          this.filteredEvents = [...this.events];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
        if (error.status === 401) {
          // Token expired or invalid
          this.authService.logout();
          this.router.navigate(['/auth']);
        }
      },
    });
  }

  // Transform API events to ViewModel format
  private transformEvents(apiEvents: EventDTO[]): EventViewModel[] {
    return apiEvents.map((event) => {
      const currentUserAttendee = event.attendees.find(
        (att) => att.user._id === this.currentUserId || att.user.id === this.currentUserId
      );

      const userRole = currentUserAttendee?.role || 'attendee';
      let userRSVP: 'going' | 'maybe' | 'notgoing' | undefined;

      if (currentUserAttendee && currentUserAttendee.status) {
        const statusMap: { [key: string]: 'going' | 'maybe' | 'notgoing' } = {
          Going: 'going',
          Maybe: 'maybe',
          'Not Going': 'notgoing',
        };
        userRSVP = statusMap[currentUserAttendee.status];
      }

      return {
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description || '',
        organizer: {
          id: event.organizer._id || event.organizer.id || '',
          name: event.organizer.name,
          email: event.organizer.email,
        },
        attendees: event.attendees,
        userRole,
        userRSVP,
      };
    });
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  navigateToDetails(eventId: string) {
    this.router.navigate(['/event-details', eventId]);
  }

  applyFilters() {
    let filtered = [...this.events];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.date.includes(query) ||
          event.userRole.toLowerCase().includes(query)
      );
    }

    // RSVP filter
    if (this.filterRSVP !== 'all') {
      filtered = filtered.filter((event) => event.userRSVP === this.filterRSVP);
    }

    this.filteredEvents = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  getRSVPBadgeClass(rsvp: string | undefined): string {
    if (!rsvp) return 'badge-organizer';
    const classes: { [key: string]: string } = {
      going: 'badge-going',
      maybe: 'badge-maybe',
      notgoing: 'badge-notgoing',
    };
    return classes[rsvp] || '';
  }

  getRSVPLabel(event: EventViewModel): string {
    if (event.userRole === 'organizer') return 'Organizer';
    if (!event.userRSVP) return 'No Response';
    const labels: { [key: string]: string } = {
      going: 'Going',
      maybe: 'Maybe',
      notgoing: 'Not Going',
    };
    return labels[event.userRSVP] || 'Unknown';
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.resetCreateForm();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
  }

  resetCreateForm() {
    this.newEventTitle = '';
    this.newEventDate = '';
    this.newEventTime = '';
    this.newEventLocation = '';
    this.newEventDescription = '';
    this.createError = '';
    this.dateError = '';
  }

  createEvent() {
    this.createError = '';
    this.dateError = '';

    if (
      !this.newEventTitle ||
      !this.newEventDate ||
      !this.newEventTime ||
      !this.newEventLocation ||
      !this.newEventDescription
    ) {
      this.createError = 'Please fill in all required fields';
      return;
    }

    const selectedDate = new Date(this.newEventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.dateError = 'Please select a future date';
      return;
    }

    const newEventData: CreateEventDto = {
      title: this.newEventTitle,
      date: this.newEventDate,
      time: this.newEventTime,
      location: this.newEventLocation,
      description: this.newEventDescription,
    };

    this.eventService.createEvent(newEventData).subscribe({
      next: (response) => {
        console.log('Event created successfully:', response);
        this.loadEvents(); // Reload events
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.createError = error.error?.message || 'Failed to create event. Please try again.';
      },
    });
  }

  openEditModal(event: EventViewModel) {
    this.selectedEvent = event;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedEvent = null;
  }

  saveEditedEvent(eventData: any) {
    if (this.selectedEvent) {
      this.eventService.updateEvent(this.selectedEvent.id, eventData).subscribe({
        next: (response) => {
          console.log('Event updated successfully:', response);
          this.loadEvents(); // Reload events
          this.closeEditModal();
        },
        error: (error) => {
          console.error('Error updating event:', error);
          alert('Failed to update event. Please try again.');
        },
      });
    }
  }

  openDeleteConfirm(event: EventViewModel) {
    this.selectedEvent = event;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.selectedEvent = null;
  }

  confirmDelete() {
    if (this.selectedEvent) {
      this.eventService.deleteEvent(this.selectedEvent.id).subscribe({
        next: (response) => {
          console.log('Event deleted successfully:', response);
          this.loadEvents(); // Reload events
          this.closeDeleteConfirm();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          alert('Failed to delete event. Please try again.');
          this.closeDeleteConfirm();
        },
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
