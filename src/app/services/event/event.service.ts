import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EventDTO,
  CreateEventDto,
  UpdateEventDto,
  InviteUsersDto,
  UpdateStatusDto,
  EventSearchParams,
  ApiResponse,
  Attendee,
} from '../../models/event.models';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private baseUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  // Helper method to get headers with auth token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Create a new event
  createEvent(eventData: CreateEventDto): Observable<ApiResponse<EventDTO>> {
    return this.http.post<ApiResponse<EventDTO>>(this.baseUrl, eventData, {
      headers: this.getHeaders(),
    });
  }

  // Get all events organized by the current user
  getMyOrganizedEvents(): Observable<ApiResponse<EventDTO>> {
    return this.http.get<ApiResponse<EventDTO>>(`${this.baseUrl}/organized`, {
      headers: this.getHeaders(),
    });
  }

  // Get all events where user is invited (not organized)
  getMyInvitedEvents(): Observable<ApiResponse<EventDTO>> {
    return this.http.get<ApiResponse<EventDTO>>(`${this.baseUrl}/invited`, {
      headers: this.getHeaders(),
    });
  }

  // Get all events (organized + invited)
  getAllMyEvents(): Observable<ApiResponse<EventDTO>> {
    return this.http.get<ApiResponse<EventDTO>>(`${this.baseUrl}/all`, {
      headers: this.getHeaders(),
    });
  }

  // Get single event by ID
  getEventById(eventId: string): Observable<ApiResponse<EventDTO>> {
    return this.http.get<ApiResponse<EventDTO>>(`${this.baseUrl}/${eventId}`, {
      headers: this.getHeaders(),
    });
  }

  // Update event details (organizer only)
  updateEvent(eventId: string, eventData: UpdateEventDto): Observable<ApiResponse<EventDTO>> {
    return this.http.put<ApiResponse<EventDTO>>(`${this.baseUrl}/${eventId}`, eventData, {
      headers: this.getHeaders(),
    });
  }

  // Invite users to event (organizer only)
  inviteUsers(eventId: string, inviteData: InviteUsersDto): Observable<ApiResponse<EventDTO>> {
    return this.http.post<ApiResponse<EventDTO>>(`${this.baseUrl}/${eventId}/invite`, inviteData, {
      headers: this.getHeaders(),
    });
  }

  // Update attendance status (attendee only)
  updateAttendanceStatus(
    eventId: string,
    statusData: UpdateStatusDto
  ): Observable<ApiResponse<EventDTO>> {
    return this.http.patch<ApiResponse<EventDTO>>(`${this.baseUrl}/${eventId}/status`, statusData, {
      headers: this.getHeaders(),
    });
  }

  // Get attendees list (organizer only)
  getEventAttendees(eventId: string): Observable<ApiResponse<Attendee>> {
    return this.http.get<ApiResponse<Attendee>>(`${this.baseUrl}/${eventId}/attendees`, {
      headers: this.getHeaders(),
    });
  }

  // Delete event (organizer only)
  deleteEvent(eventId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${eventId}`, {
      headers: this.getHeaders(),
    });
  }

  // Search and filter events
  searchEvents(params: EventSearchParams): Observable<ApiResponse<EventDTO>> {
    let httpParams = new HttpParams();

    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }

    return this.http.get<ApiResponse<EventDTO>>(`${this.baseUrl}/search`, {
      headers: this.getHeaders(),
      params: httpParams,
    });
  }
}
