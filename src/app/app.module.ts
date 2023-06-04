import {LOCALE_ID, NgModule, isDevMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MapComponent} from "./map/map.component";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NavigationComponent} from './navigation/navigation.component';
import {LoginComponent} from './login/login.component';
import {RegistrationComponent} from './registration/registration.component';
import {MatCommonModule, MatNativeDateModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MaterialModule} from './material.module';
import {CommonModule, registerLocaleData} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthService} from "./shared/auth/auth.service";
import {JwtModule, JWT_OPTIONS} from "@auth0/angular-jwt";
import {AuthTokenInterceptor} from "./shared/auth/auth-token-interceptor";
import { SearchEventComponent } from './search-event/search-event.component';
import { AddEventComponent } from './add-event/add-event.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import localeUA from '@angular/common/locales/uk';
import { CommentsComponent } from './comments/comments.component';
import { SureDialogComponent } from './shared/components/sure-dialog/sure-dialog.component';
import {environment} from "../environment/environment";
import {NgxBackForwardCacheModule} from "ngx-back-forward-cache";
import { ServiceWorkerModule } from '@angular/service-worker';
import {RxFor} from "@rx-angular/template/for";
import {RxIf} from "@rx-angular/template/if";
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { MapAppComponent } from './map-app/map-app.component';
registerLocaleData(localeUA);

export function jwtOptionFactor(authService: AuthService) {
  return {
    tokenGetter: () => {
      return authService.getAccessToken();
    },
    allowedDomains: [environment.backDomain],
    disallowedRoutes: [
      `${environment.backURL}auth/login`
    ]
  }
}


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    NavigationComponent,
    LoginComponent,
    RegistrationComponent,
    SearchEventComponent,
    AddEventComponent,
    EventDetailComponent,
    CommentsComponent,
    SureDialogComponent,
    VerifyEmailComponent,
    MapAppComponent
  ],
  imports: [
    NgbModule,
    RxIf,
    RxFor,
    BrowserModule,
    HttpClientModule,
    CommonModule,
    MatCommonModule,
    MaterialModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatNativeDateModule,
    AppRoutingModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionFactor,
        deps: [AuthService]
      }
    }),
    ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthTokenInterceptor,
    multi: true,
  },
    { provide: LOCALE_ID, useValue: 'uk'},],
  bootstrap: [AppComponent]
})
export class AppModule {
}
