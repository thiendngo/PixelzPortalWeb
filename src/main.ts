import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from '../src/app/interceptors/auth-interceptor';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    ), //
    provideAnimations()
  ]
}).catch((err) => console.error(err));
