import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Attendee {
  id: string;
  email: string;
  name: string;
  status: 'going' | 'pending';
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: { id: string; name: string; email: string };
  attendees: Attendee[];
  userRole: 'organizer' | 'attendee';
  userRSVP?: 'going' | 'notgoing';
}

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails implements OnInit {
  event: Event | null = null;
  isLoading = true;
  showDeleteConfirm = false;
  showInviteModal = false;
  inviteEmail = '';
  inviteError = '';
  successMessage = '';

  goingCount = 0;
  pendingCount = 0;
  notGoingCount = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const eventId = params['id'];
      this.loadEvent(eventId);
    });
  }

  loadEvent(eventId: string) {
    // Mock data - replace with actual API call
    this.event = {
      id: eventId,
      title: 'Team Building Workshop',
      date: '2025-11-15',
      time: '14:00',
      location: 'Conference Room A, Main Office',
      description: 'Join us for an exciting team building workshop where we will engage in collaborative activities, problem-solving exercises, and networking opportunities. This event is designed to strengthen team bonds and improve communication skills.',
      organizer: { id: 'org1', name: 'Sarah Wilson', email: 'sarah@example.com' },
      attendees: [
        { id: '1', email: 'john@example.com', name: 'John Doe', status: 'going' },
        { id: '3', email: 'bob@example.com', name: 'Bob Johnson', status: 'pending' },
        { id: '4', email: 'alice@example.com', name: 'Alice Brown', status: 'going' }
      ],
      userRole: 'organizer',
      userRSVP: undefined,
    };

    const attendees = this.event.attendees || [];
    this.goingCount = attendees.filter(a => a.status === 'going').length;
    this.pendingCount = attendees.filter(a => a.status === 'pending').length;

    this.isLoading = false;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'going': 'badge-going',
      'pending': 'badge-pending',
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'going': 'Going',
      'pending': 'Pending',
    };
    return labels[status] || status;
  }

  goBack() {
    this.router.navigate(['/event-list']);
  }

  editEvent() {
    console.log('Edit event:', this.event?.id);
  }

  deleteEvent() {
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    console.log('Deleting event:', this.event?.id);
    this.showDeleteConfirm = false;
    this.router.navigate(['/event-list']);
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  openInviteModal() {
    this.showInviteModal = true;
    this.inviteEmail = '';
    this.inviteError = '';
  }

  closeInviteModal() {
    this.showInviteModal = false;
    this.inviteEmail = '';
    this.inviteError = '';
  }

  sendInvite() {
    const email = this.inviteEmail.trim();
    this.inviteError = '';

    if (!email) {
      this.inviteError = 'Please enter an email address';
      return;
    }

    if (!this.validateEmail(email)) {
      this.inviteError = 'Please enter a valid email address';
      return;
    }

    if (this.event?.attendees.some(a => a.email === email)) {
      this.inviteError = 'This person is already invited';
      return;
    }

    console.log('Inviting:', email);
    this.successMessage = `Invitation sent to ${email}!`;
    this.inviteEmail = '';

    setTimeout(() => {
      this.closeInviteModal();
      this.successMessage = '';
    }, 1500);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  updateRSVP(status: 'going' | 'notgoing') {
    console.log('Updating RSVP to:', status);
    if (this.event) {
      this.event.userRSVP = status;
    }
  }

  removeAttendee(attendeeId: string) {
    console.log('Removing attendee:', attendeeId);
    if (this.event) {
      this.event.attendees = this.event.attendees.filter(a => a.id !== attendeeId);
    }
  }
}