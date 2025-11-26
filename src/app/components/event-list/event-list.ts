import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventEdit } from '../event-edit/event-edit'; 

interface Event {
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
  imports: [CommonModule, FormsModule , EventEdit],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  isLoading = true;
  sidebarExpanded = false;
  
  // Search and filter
  searchQuery = '';
  filterRSVP: 'all' | 'going' | 'maybe' | 'notgoing' = 'all';
  
  // Modals
  showCreateModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  selectedEvent: Event | null = null;
  
  // Create event form
  newEventTitle = '';
  newEventDate = '';
  newEventTime = '';
  newEventLocation = '';
  newEventDescription = '';
  createError = '';
  dateError = '';
  
  constructor(private router: Router) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    // Mock data - replace with actual API call
    this.events = [
      {
        id: '1',
        title: 'Team Building Workshop',
        date: '2025-11-15',
        time: '14:00',
        location: 'Conference Room A',
        description: 'Team building activities and networking',
        organizer: { id: 'org1', name: 'Sarah Wilson', email: 'sarah@example.com' },
        attendees: [],
        userRole: 'organizer',
        userRSVP: undefined
      },
      {
        id: '2',
        title: 'Project Kickoff Meeting',
        date: '2025-12-01',
        time: '10:00',
        location: 'Main Office, Room 302',
        description: 'Initial meeting for the new project',
        organizer: { id: 'org2', name: 'John Smith', email: 'john@example.com' },
        attendees: [],
        userRole: 'attendee',
        userRSVP: 'going'
      },
      {
        id: '3',
        title: 'Annual Company Dinner',
        date: '2025-12-20',
        time: '18:00',
        location: 'Grand Hotel Ballroom',
        description: 'Year-end celebration dinner',
        organizer: { id: 'org3', name: 'Emily Davis', email: 'emily@example.com' },
        attendees: [],
        userRole: 'attendee',
        userRSVP: 'maybe'
      },
      {
        id: '4',
        title: 'Training Session',
        date: '2025-11-28',
        time: '09:00',
        location: 'Training Center',
        description: 'Professional development training',
        organizer: { id: 'org4', name: 'Mike Johnson', email: 'mike@example.com' },
        attendees: [],
        userRole: 'attendee',
        userRSVP: 'notgoing'
      }
    ];
    
    this.filteredEvents = [...this.events];
    this.isLoading = false;
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
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.date.includes(query) ||
        event.userRole.toLowerCase().includes(query)
      );
    }
    
    // RSVP filter
    if (this.filterRSVP !== 'all') {
      filtered = filtered.filter(event => event.userRSVP === this.filterRSVP);
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
      'going': 'badge-going',
      'maybe': 'badge-maybe',
      'notgoing': 'badge-notgoing',
    };
    return classes[rsvp] || '';
  }

  getRSVPLabel(event: Event): string {
    if (event.userRole === 'organizer') return 'Organizer';
    if (!event.userRSVP) return 'No Response';
    const labels: { [key: string]: string } = {
      'going': 'Going',
      'maybe': 'Maybe',
      'notgoing': 'Not Going',
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

    if (!this.newEventTitle || !this.newEventDate || !this.newEventTime || 
        !this.newEventLocation || !this.newEventDescription) {
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

    const newEvent: Event = {
      id: Date.now().toString(),
      title: this.newEventTitle,
      date: this.newEventDate,
      time: this.newEventTime,
      location: this.newEventLocation,
      description: this.newEventDescription,
      organizer: { id: 'current', name: 'Current User', email: 'user@example.com' },
      attendees: [],
      userRole: 'organizer',
      userRSVP: undefined
    };

    console.log('Creating event:', newEvent);
    this.events.unshift(newEvent);
    this.applyFilters();
    this.closeCreateModal();
  }

  openEditModal(event: Event) {
    this.selectedEvent = event;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedEvent = null;
  }

  saveEditedEvent(eventData: any) {
    if (this.selectedEvent) {
      const index = this.events.findIndex(e => e.id === this.selectedEvent!.id);
      if (index !== -1) {
        this.events[index] = { ...this.events[index], ...eventData };
        this.applyFilters();
      }
    }
    this.closeEditModal();
  }

  openDeleteConfirm(event: Event) {
    this.selectedEvent = event;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.selectedEvent = null;
  }

  confirmDelete() {
    if (this.selectedEvent) {
      console.log('Deleting event:', this.selectedEvent.id);
      this.events = this.events.filter(e => e.id !== this.selectedEvent!.id);
      this.applyFilters();
    }
    this.closeDeleteConfirm();
  }

  logout() {
    console.log('Logging out...');
    this.router.navigate(['/auth']);
  }
}