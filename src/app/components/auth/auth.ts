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
    if (!this.signUpName || !this.signUpEmail || !this.signUpPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const payload = {
      name: this.signUpName,
      email: this.signUpEmail,
      password: this.signUpPassword,
    };
    console.log('Register payload:', payload);

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log('Register response:', res);
        this.successMessage = 'Registration successful! You can now sign in.';
        this.errorMessage = '';
        this.signUpName = this.signUpEmail = this.signUpPassword = '';
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

    this.authService
      .login({
        email: this.signInEmail,
        password: this.signInPassword,
      })
      .subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.successMessage = `Welcome back, ${res.user.name}!`;
          this.signInErrorMessage = '';
          this.signInEmail = this.signInPassword = '';
        },
        error: (err) => {
          this.signInErrorMessage = err.error.message || 'Invalid email or password.';
        },
      });
  }
}
