import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventEdit } from '../event-edit/event-edit';
import { EventService } from '../../services/event/event.service';
import { AuthService } from '../../services/auth/auth';
import { CreateEventDto, EventDTO, UpdateStatusDto } from '../../models/event.models';
import { EventCreate } from '../event-create/event-create';

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
  userRSVP?: 'going' | 'maybe' | 'notgoing' | 'pending';
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EventEdit, EventCreate],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  events: EventViewModel[] = [];
  filteredEvents: EventViewModel[] = [];
  isLoading = signal<boolean>(true)
  sidebarExpanded = false;
  activeTab: 'all' | 'organized' | 'invited' = 'all';

  // Search and filter
  searchQuery = '';
  filterRSVP: 'all' | 'going' | 'maybe' | 'notgoing' | 'pending' = 'all';
  
  // Modals
  showCreateModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  showChangeStatusModal = false;
  selectedEvent: EventViewModel | null = null;

  // Create event form
  newEventTitle = '';
  newEventDate = '';
  newEventTime = '';
  newEventLocation = '';
  newEventDescription = '';
  createError = '';
  dateError = '';

  // Change status
  pendingStatus: 'pending' |'going' | 'maybe' | 'notgoing' = 'going';

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

  switchTab(tab: 'all' | 'organized' | 'invited') {
    this.activeTab = tab;
    this.filterRSVP = 'all';
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);

    let observable;
    switch (this.activeTab) {
      case 'organized':
        observable = this.eventService.getMyOrganizedEvents();
        break;
      case 'invited':
        observable = this.eventService.getMyInvitedEvents();
        break;
      default:
        observable = this.eventService.getAllMyEvents();
    }

    observable.subscribe({
      next: (response) => {
        if (response.events) {
          this.events = this.transformEvents(response.events);
        }
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading.set(false);
        this.events = [];
        this.filteredEvents = [];
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth']);
        }
      },
    });
  }

  // Transform API events to ViewModel format
  private transformEvents(apiEvents: EventDTO[]): EventViewModel[] {
    return apiEvents.map((event) => {
      this.currentUserId = this.authService.getCurrentUserId();
      const isOrganizer = event.organizer._id === this.currentUserId;
      console.log('Organizer _id:', event.organizer._id);
      console.log('Organizer id:', event.organizer.id);
      console.log('Current User ID:', this.currentUserId);

      const currentUserAttendee = event.attendees.find((att) => att.user._id === this.currentUserId);

      const userRole = isOrganizer ? 'organizer' : (currentUserAttendee?.role || 'attendee');
      let userRSVP: 'going' | 'maybe' | 'notgoing' | undefined;

      if (currentUserAttendee && currentUserAttendee.status) {
        const statusMap: { [key: string]: 'going' | 'maybe' | 'notgoing' } = {
          Going: 'going',
          Maybe: 'maybe',
          'Not Going': 'notgoing',
        };
        userRSVP = statusMap[currentUserAttendee.status];
      }
      console.log("event: " + event + ", role: " + userRole);

      return {
        id: event._id,
        title: event.title,
        date: this.formatDate(event.date),
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

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
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
    if (this.activeTab === 'invited' && this.filterRSVP !== 'all') {
      if (this.filterRSVP === 'pending') {
        // Filter for events with no response (pending)
        filtered = filtered.filter(event => !event.userRSVP || event.userRSVP === 'pending');
      } else {
        filtered = filtered.filter(event => event.userRSVP === this.filterRSVP);
      }
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
    if (rsvp === 'pending') return 'badge-pending';
    const classes: { [key: string]: string } = {
      going: 'badge-going',
      maybe: 'badge-maybe',
      notgoing: 'badge-notgoing',
    };
    return classes[rsvp] || 'badge-pending';
  }

  getRSVPLabel(event: EventViewModel): string {
    if (event.userRole === 'organizer') return 'Organizer';
    if (!event.userRSVP) return 'Pending';
    const labels: { [key: string]: string } = {
      going: 'Going',
      maybe: 'Maybe',
      notgoing: 'Not Going',
    };
    return labels[event.userRSVP] || 'Pending';
  }

  // Modal Handlers
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

  handleChildCreate(eventData: CreateEventDto) {
  // Set parent form fields from child
  this.newEventTitle = eventData.title;
  this.newEventDate = eventData.date;
  this.newEventTime = eventData.time;
  this.newEventLocation = eventData.location;
  this.newEventDescription = eventData.description;

  this.createEvent();
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

  openChangeStatusModal(event: EventViewModel) {
    this.selectedEvent = event;
    this.pendingStatus = event.userRSVP || 'pending';
    this.showChangeStatusModal = true;
  }

  closeChangeStatusModal() {
    this.showChangeStatusModal = false;
    this.selectedEvent = null;
  }

  changeRSVPStatus() {
    if (this.selectedEvent) {

      const statusMap: { [key: string]: UpdateStatusDto['status'] } = {
        going: 'Going',
        maybe: 'Maybe',
        notgoing: 'Not Going',
      };

      const apiStatus = statusMap[this.pendingStatus];

      const statusData: UpdateStatusDto = {
        status: apiStatus
      };

      this.eventService
        .updateAttendanceStatus(this.selectedEvent.id, statusData)
        .subscribe({
          next: (response) => {
            console.log('RSVP status updated successfully:', response);
            this.loadEvents();
            this.closeChangeStatusModal();
          },
          error: (error) => {
            console.error('Error updating RSVP status:', error);
            alert('Failed to update RSVP status. Please try again.');
          },
        });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
