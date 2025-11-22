import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-edit.html',
  styleUrls: ['./event-edit.css', '../../shared/style/modal-form.css'],
})
export class EventEdit implements OnInit, OnDestroy {
  @Input() eventId: string = '';
  @Input() eventData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  showSuccess = false;
  showError = false;
  errorMessage = '';
  dateError = '';
  isLoading = false;
  attendees: string[] = [];
  attendeeEmail = '';

  title = '';
  date = '';
  time = '';
  location = '';
  description = '';

  ngOnInit() {
    console.log('EditEvent Modal Opened with data:', this.eventData);
    document.body.style.overflow = 'hidden';

    // Pre-populate form with existing event data
    if (this.eventData) {
      this.title = this.eventData.title || '';
      this.date = this.eventData.date || '';
      this.time = this.eventData.time || '';
      this.location = this.eventData.location || '';
      this.description = this.eventData.description || '';
      this.attendees = this.eventData.attendees ? [...this.eventData.attendees] : [];
    }
  }

  ngOnDestroy() {
    console.log('EditEvent Modal Closed');
    document.body.style.overflow = 'auto';
  }

  closeModal() {
    console.log('Emitting close event');
    this.close.emit();
  }

  handleUpdateEvent(event: Event) {
    event.preventDefault();

    const title = this.title.trim();
    const date = this.date;
    const time = this.time;
    const location = this.location.trim();
    const description = this.description.trim();

    // Clear previous errors
    this.showError = false;
    this.dateError = '';

    if (!title || !date || !time || !location || !description) {
      this.showError = true;
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.dateError = 'Please select a future date';
      return;
    }

    const eventData = {
      title,
      date,
      time,
      location,
      description,
      attendees: this.attendees,
    };

    console.log('Updated Event Data:', eventData);

    this.isLoading = true;
    this.showSuccess = true;

    // Parent will handle API call via EventService
    setTimeout(() => {
      this.save.emit(eventData);
      this.isLoading = false;
      setTimeout(() => {
        this.closeModal();
      }, 500);
    }, 1500);
  }
}
