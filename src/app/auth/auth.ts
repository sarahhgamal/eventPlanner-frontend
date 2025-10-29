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

  // Sign Up
  signUpName = '';
  signUpEmail = '';
  signUpPassword = '';

  // Sign In
  signInEmail = '';
  signInPassword = '';

  // Messages
  errorMessage = '';
  signInErrorMessage = '';
  successMessage = '';

  toggleForms(isSignUp: boolean) {
    this.isRightPanelActive = isSignUp;
    this.errorMessage = '';
    this.successMessage = '';
    this.signInErrorMessage = '';
  }

  register() {
    // check for empty fields
    if (!this.signUpName || !this.signUpEmail || !this.signUpPassword) {
      this.errorMessage = 'Please fill in all fields.';
      this.successMessage = '';
      return;
    }

    const newUser: User = {
      name: this.signUpName.trim(),
      email: this.signUpEmail.trim().toLowerCase(),
      password: this.signUpPassword
    };

    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (!Array.isArray(users)) users = [];

    const exists = users.some((u: User) => u.email === newUser.email);
    if (exists) {
      this.errorMessage = 'User already registered with this email!';
      this.successMessage = '';
      return;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // clear inputs
    this.signUpName = '';
    this.signUpEmail = '';
    this.signUpPassword = '';

    this.errorMessage = '';
    this.successMessage = 'Registration successful! You can now sign in.';
  }

  login() {
    // check for empty fields
    if (!this.signInEmail || !this.signInPassword) {
      this.signInErrorMessage = 'Please enter your email and password.';
      this.successMessage = '';
      return;
    }

    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (!Array.isArray(users)) users = [];

    const foundUser = users.find(
      user =>
        user.email === this.signInEmail.trim().toLowerCase() &&
        user.password === this.signInPassword
    );

    if (foundUser) {
      this.signInErrorMessage = '';
      this.successMessage = `Welcome back, ${foundUser.name}!`;

      // clear inputs
      this.signInEmail = '';
      this.signInPassword = '';
    } else {
      this.signInErrorMessage = 'Invalid email or password.';
      this.successMessage = '';
    }
  }
}
