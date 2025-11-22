import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class Auth {
  constructor(private authService: AuthService, private router: Router) {}

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

  getErrorMessage(backendError: any): string {
    if (backendError?.errors && Array.isArray(backendError.errors)) {
      return backendError.errors.map((err: any) => err.msg).filter(Boolean).join(', ');
    }
    return backendError?.message;
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
        
        // Reset fields
        this.signUpName = '';
        this.signUpEmail = '';
        this.signUpPassword = '';
        this.signUpRole = '';
      },
      error: (err) => {
        console.error('Register error:', err);
        this.errorMessage = this.getErrorMessage(err.error) || 'Registeration Failed.';
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

        this.signInEmail = '';
        this.signInPassword = '';

        this.router.navigate(['event-list']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.signInErrorMessage = this.getErrorMessage(err.error) || 'Invalid email or password.';
      },
    });
  }
}
