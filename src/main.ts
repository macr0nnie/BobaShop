import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Assuming this is where your routes are defined

// Use only one bootstrapApplication call
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // Make HttpClient available
    provideRouter(routes) // Set up routing
  ]
}).catch((err) => console.error(err));
