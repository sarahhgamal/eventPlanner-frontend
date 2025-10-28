import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { App } from './app';
import { Auth } from './auth/auth';

@NgModule({
  declarations: [App, Auth],
  imports: [BrowserModule, FormsModule],
  bootstrap: [App]
})
export class AppModule {}
