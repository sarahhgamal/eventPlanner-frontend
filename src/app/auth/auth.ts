import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
   standalone: false
})
export class Auth {
  isRightPanelActive = false;

  toggleForms(isSignUp: boolean) {
    this.isRightPanelActive = isSignUp;
  }

  name = '';
  email = '';
  password = '';

  register() {
    console.log('Register', this.name, this.email, this.password);
  }

  login() {
    console.log('Login', this.email, this.password);
  }
}
