import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventDTO, Attendee, UpdateStatusDto, InviteUsersDto } from '../../models/event.models';
import { AuthService } from '../../services/auth/auth';
import { EventService } from '../../services/event/event.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails implements OnInit {
  event: EventDTO | null = null;
  isLoading = true;
  isOrganizer = false;
  currentUserStatus: string = 'Pending';

  // Invite modal
  showInviteModal = false;
  inviteEmails: string = '';
  inviteError = '';

  // Attendees modal
  showAttendeesModal = false;
  attendeesList: Attendee[] = [];
  loadingAttendees = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetails(eventId);
    } else {
      this.router.navigate(['/events']);
    }
  }

  loadEventDetails(eventId: string) {
    this.isLoading = true;
    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        if (response.event) {
          this.event = response.event;
          this.checkUserRole();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading event details:', error);
        this.isLoading = false;
        if (error.status === 403) {
          alert('You do not have access to this event');
          this.router.navigate(['/events']);
        } else if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth']);
        } else {
          alert('Failed to load event details');
          this.router.navigate(['/events']);
        }
      },
    });
  }

  checkUserRole() {
    if (!this.event) return;

    // Get current user from token or from attendees list
    const currentUserAttendee = this.event.attendees.find((att) => att.role === 'organizer');

    if (currentUserAttendee) {
      this.isOrganizer = currentUserAttendee.role === 'organizer';
      this.currentUserStatus = currentUserAttendee.status;
    }
  }

  // Update RSVP status (for attendees only)
  updateRSVP(status: 'Going' | 'Maybe' | 'Not Going') {
    if (!this.event || this.isOrganizer) return;

    const statusData: UpdateStatusDto = { status };

    this.eventService.updateAttendanceStatus(this.event._id, statusData).subscribe({
      next: (response) => {
        console.log('RSVP updated successfully');
        if (response.event) {
          this.event = response.event;
          this.checkUserRole();
        }
      },
      error: (error) => {
        console.error('Error updating RSVP:', error);
        alert(error.error?.message || 'Failed to update RSVP');
      },
    });
  }

  // Open invite modal (organizer only)
  openInviteModal() {
    if (!this.isOrganizer) return;
    this.showInviteModal = true;
    this.inviteEmails = '';
    this.inviteError = '';
  }

  closeInviteModal() {
    this.showInviteModal = false;
    this.inviteEmails = '';
    this.inviteError = '';
  }

  // Invite users to event
  inviteUsers() {
    if (!this.event) return;

    this.inviteError = '';

    // Parse emails (split by comma, semicolon, or newline)
    const emailArray = this.inviteEmails
      .split(/[,;\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailArray.length === 0) {
      this.inviteError = 'Please enter at least one email address';
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailArray.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      this.inviteError = `Invalid email(s): ${invalidEmails.join(', ')}`;
      return;
    }

    const inviteData: InviteUsersDto = { emails: emailArray };

    this.eventService.inviteUsers(this.event._id, inviteData).subscribe({
      next: (response) => {
        console.log('Users invited successfully:', response);
        if (response.event) {
          this.event = response.event;
        }
        alert(`Successfully invited ${response.invitedEmails?.length || 0} user(s)`);
        this.closeInviteModal();
      },
      error: (error) => {
        console.error('Error inviting users:', error);
        this.inviteError = error.error?.message || 'Failed to invite users. Please try again.';
      },
    });
  }

  // Open attendees modal (organizer only)
  openAttendeesModal() {
    if (!this.event || !this.isOrganizer) return;

    this.showAttendeesModal = true;
    this.loadAttendees();
  }

  closeAttendeesModal() {
    this.showAttendeesModal = false;
    this.attendeesList = [];
  }

  loadAttendees() {
    if (!this.event) return;

    this.loadingAttendees = true;
    this.eventService.getEventAttendees(this.event._id).subscribe({
      next: (response) => {
        if (response.attendees) {
          this.attendeesList = response.attendees;
        }
        this.loadingAttendees = false;
      },
      error: (error) => {
        console.error('Error loading attendees:', error);
        this.loadingAttendees = false;
        alert('Failed to load attendees list');
      },
    });
  }

  // Get badge class for status
  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      Going: 'badge-going',
      Maybe: 'badge-maybe',
      'Not Going': 'badge-notgoing',
      Pending: 'badge-pending',
    };
    return classes[status] || 'badge-pending';
  }

  // Navigate back to events list
  goBack() {
    this.router.navigate(['/events']);
  }

  // Edit event (organizer only)
  editEvent() {
    if (!this.event || !this.isOrganizer) return;
    this.router.navigate(['/events', this.event._id, 'edit']);
  }

  // Delete event (organizer only)
  deleteEvent() {
    if (!this.event || !this.isOrganizer) return;

    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(this.event._id).subscribe({
        next: () => {
          alert('Event deleted successfully');
          this.router.navigate(['/events']);
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          alert('Failed to delete event');
        },
      });
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Check if date is in the past
  isPastEvent(): boolean {
    if (!this.event) return false;
    const eventDate = new Date(this.event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  }
}
