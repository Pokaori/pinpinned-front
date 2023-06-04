import {Component, OnInit, SimpleChanges} from '@angular/core';
import {AuthService} from "./shared/auth/auth.service";
import {UserProfile} from "./shared/auth/user-profile";
import {PageState} from "./page-state";
import {MeUser} from "./shared/auth/me-user";
import {Schedule} from "./shared/interfaces/schedule";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent  {
  title="pinpinned";
}
