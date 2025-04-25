import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { 
  provideRouter, 
  withComponentInputBinding, 
  withDebugTracing, 
  withInMemoryScrolling,
  withRouterConfig 
} from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ 
      eventCoalescing: true,
      runCoalescing: true // Critical for routerLink changes
    }),
    provideHttpClient(),
    provideRouter(
      routes,
      withComponentInputBinding(), // Enables @Input() from route params
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // Smooth scroll behavior
        anchorScrolling: 'enabled'
      }),
      withRouterConfig({
        onSameUrlNavigation: 'reload', // Handle same URL navigation
        paramsInheritanceStrategy: 'always' // Inherit route params
      })
      // withDebugTracing() // Uncomment for route debugging
    )
  ]
};