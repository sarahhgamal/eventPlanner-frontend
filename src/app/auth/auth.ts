import { Component } from '@angular/core';

interface User {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
  standalone: false
})
export class Auth {
  isRightPanelActive = false;

  name = '';
  email = '';
  password = '';
  errorMessage = '';
  signInErrorMessage = '';
  successMessage = '';


  toggleForms(isSignUp: boolean) {
    this.isRightPanelActive = isSignUp;
    this.errorMessage = '';
    this.successMessage='';
    this.signInErrorMessage='';
  }

  register() {
    const newUser: User = {
      name: this.name,
      email: this.email,
      password: this.password,

    };

    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (!Array.isArray(users)) {
      users = [];
    }

    const exists = users.some((u: User) => u.email === newUser.email);
    if (exists) {
      this.errorMessage = 'User already registered with this email!';
      this.successMessage = '';
      return;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
   this.successMessage = 'Registration successful! You can now sign in.';
  }

  login() {
    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (!Array.isArray(users)) {
      users = [];
    }

    const foundUser = users.find((u: User) => u.email === this.email && u.password === this.password);
    if (foundUser) {
      this.signInErrorMessage = '';
      this.successMessage = `Welcome back, ${foundUser.name}!`;

    } else {
      this.signInErrorMessage = 'Invalid email or password';
    }
  }
}
