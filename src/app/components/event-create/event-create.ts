import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-create.html',
  styleUrls: ['./event-create.css'],
})
export class EventCreate implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  showSuccess = false;
  showError = false;
  errorMessage = '';
  dateError = '';

  title = '';
  date = '';
  time = '';
  location = '';
  description = '';

  ngOnInit() {
    console.log('EventCreate Modal Opened');
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    console.log('EventCreate Modal Closed');
    document.body.style.overflow = 'auto';
  }

  closeModal() {
    console.log('Emitting close event');
    this.close.emit();
  }

  handleCreateEvent(event: Event) {
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
      description
    };

    console.log('Event Data:', eventData);

    this.showSuccess = true;

    setTimeout(() => {
      this.resetForm();
      this.closeModal();
    }, 1500);
  }

  resetForm() {
    this.title = '';
    this.date = '';
    this.time = '';
    this.location = '';
    this.description = '';
    this.showSuccess = false;
    this.showError = false;
    this.dateError = '';
    this.errorMessage = '';
  }
}