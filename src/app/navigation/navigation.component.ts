import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from "../shared/auth/auth.service";
import {MeUser} from "../shared/auth/me-user";
import {PageState} from "../page-state";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  user?: MeUser;
  @Output() logoutEvent = new EventEmitter<boolean>();
  @Output() changeStateEvent = new EventEmitter<PageState>();
  constructor(public authService: AuthService) {
    this.authService.user$.subscribe((user) => (this.user = user));
  }
  ngOnInit(): void {}
  logout(){
    this.authService.logout()
    this.logoutEvent.emit(true)
  }

  changeState(state: PageState) {
    this.changeStateEvent.emit(state)
  }

  protected readonly PageState = PageState;
}
