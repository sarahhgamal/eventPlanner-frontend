// Event Models and Interfaces

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

export interface Attendee {
  user: User;
  status: 'Going' | 'Maybe' | 'Not Going' | 'Pending';
  role: 'organizer' | 'attendee';
  _id?: string;
}

export interface EventDTO {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  organizer: User;
  attendees: Attendee[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
}

export interface InviteUsersDto {
  emails: string[];
}

export interface UpdateStatusDto {
  status: 'Going' | 'Maybe' | 'Not Going';
}

export interface EventSearchParams {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  role?: 'organizer' | 'attendee';
}

export interface ApiResponse<T> {
  message?: string;
  count?: number;
  events?: T[];
  event?: T;
  attendees?: Attendee[];
  invitedEmails?: string[];
}

// Helper type for component usage
export interface EventViewModel {
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
