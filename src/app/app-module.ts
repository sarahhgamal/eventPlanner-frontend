import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { App } from './app';
import { Auth } from './components/auth/auth';

@NgModule({
  declarations: [App, Auth],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  bootstrap: [App],
})
export class AppModule {}
