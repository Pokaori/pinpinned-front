import {Component, OnInit} from '@angular/core';
import {PageState} from "../page-state";
import {UserProfile} from "../shared/auth/user-profile";
import {Schedule} from "../shared/interfaces/schedule";
import {MeUser} from "../shared/auth/me-user";
import {AuthService} from "../shared/auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-map-app',
  templateUrl: './map-app.component.html',
  styleUrls: ['./map-app.component.scss']
})
export class MapAppComponent implements OnInit{
  tapedSchedule?: string;
  userProfile?: UserProfile | null;
  startExplore: boolean = false;
  pageState: PageState = PageState.Search;
  schedules: Schedule[] = [];
  address: { title: string, position: { lat: number, lng: number } } = {title: '', position: {lat: 0, lng: 0}};
  private user?: MeUser;

  constructor(public authService: AuthService, public router: Router ) {
  }

  ngOnInit(): void {
    this.authService.userProfile.subscribe((data) => {
      this.userProfile = data;
    });
    this.authService.user$.subscribe((user) => {
      if (!user) {
        this.authService.getProfile();
      }
      this.user = user;
    });
  }

  changeAddress(event: { title: string, position: { lat: number, lng: number } }) {
    this.address = event;
  }

  resetData() {
    this.startExplore = false;
    this.pageState = PageState.Search
    this.schedules = [];
    this.tapedSchedule = undefined;
  }

  changeStatus(status: PageState) {
    // this.resetData()
    if (status !== PageState.Search) {
      this.schedules = [];
    }
    this.tapedSchedule = undefined;
    this.startExplore = true;
    this.pageState = status;
  }

  protected readonly PageState = PageState;

  searchEvents(event: Schedule[]) {
    this.schedules = event;

  }
}
