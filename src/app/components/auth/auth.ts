import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
  standalone: false,
})
export class Auth {
  constructor(private authService: AuthService) {}

  isRightPanelActive = false;

  signUpName = '';
  signUpEmail = '';
  signUpPassword = '';
  signUpRole = '';

  signInEmail = '';
  signInPassword = '';

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
    if (!this.signUpName || !this.signUpEmail || !this.signUpPassword || !this.signUpRole) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const payload = {
      name: this.signUpName,
      email: this.signUpEmail,
      password: this.signUpPassword,
      role: this.signUpRole,
    };

    console.log('Register payload:', payload);

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log('Register response:', res);
        this.successMessage = res.message || 'Registration successful!';
        this.errorMessage = '';
        this.signUpName = this.signUpEmail = this.signUpPassword = this.signUpRole = '';
      },
      error: (err) => {
        console.error('Register error:', err);
        this.errorMessage = err.error?.message || 'Registration failed.';
      },
    });
  }

  login() {
    if (!this.signInEmail || !this.signInPassword) {
      this.signInErrorMessage = 'Please enter your email and password.';
      return;
    }

    const payload = {
      email: this.signInEmail,
      password: this.signInPassword,
    };

    console.log('Login payload:', payload);

    this.authService.login(payload).subscribe({
      next: (res) => {
        console.log('Login response:', res);
        this.authService.saveToken(res.token);
        this.successMessage = res.message || `Welcome back, ${res.user?.name || 'User'}!`;
        this.signInErrorMessage = '';
        this.signInEmail = this.signInPassword = '';
      },
      error: (err) => {
        console.error('Login error:', err);
        this.signInErrorMessage = err.error?.message || 'Invalid email or password.';
      },
    });
  }
}
