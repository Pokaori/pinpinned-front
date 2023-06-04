import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {Schedule} from "../shared/interfaces/schedule";
import H from "@here/maps-api-for-javascript";
import {PageState} from "../page-state";
import {SubscriptionModel} from "../shared/interfaces/subscription-model";
import {AuthService} from "../shared/auth/auth.service";
import {ApiService} from "../api.service";
import {MeUser} from "../shared/auth/me-user";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SureDialogComponent} from "../shared/components/sure-dialog/sure-dialog.component";
import {environment} from "../../environment/environment";
import {RxIf} from "@rx-angular/template/if";

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
})
export class EventDetailComponent implements OnInit {

  @Input() schedule?: Schedule | undefined;
  @Output() scheduleChange = new EventEmitter<Schedule | undefined>;
  geocoder?: H.service.SearchService;
  scheduleAddress?: string;
  subscription?: SubscriptionModel;
  user?: MeUser;
  private addSubscriptionForm?: FormGroup;

  constructor(private authService: AuthService, private api: ApiService, public dialog: MatDialog, private fb: FormBuilder) {
    this.authService.user$.subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.getSubscription()

  }

  ngAfterViewInit(): void {
    const platform = new H.service.Platform({
      apikey: environment.mapApiKey
    });
    this.geocoder = platform.getSearchService()
    this.getScheduleAddress();

  }

  ngOnChanges(changes: SimpleChanges) {
    const schedule = changes['schedule'];
    if (schedule && schedule.currentValue) {
      this.getScheduleAddress()
      this.getSubscription()
    }
  }

  getSubscription() {
    if (this.schedule) {
      this.api.getSubscription(this.schedule.id).subscribe({
        next: (res) => {
          this.subscription = undefined;
          if (res) {
            this.subscription = res;
          }
        },
        error: () => {
          this.subscription = undefined;
        }
      })
    }
  }

  getScheduleAddress() {
    // @ts-ignore
    this.geocoder.reverseGeocode(
      {
        at: `${this.schedule?.event.place.latitude},${this.schedule?.event.place.longitude}`,
        limit: '1'
      },
      this.OnSuccess.bind(this),
      this.OnError
    );
  }

  openDialog(): void {
    // @ts-ignore
    const max = Math.min(10, this.schedule.event.place_number - this.schedule.places_sub)
    this.addSubscriptionForm = this.fb.group({
      people_number: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(max)]),
    },);
    const dialogRef = this.dialog.open(DialogAnimationsExampleDialog, {
      data: {people_number: this.f['people_number']},
    });
    dialogRef.afterClosed().subscribe(result => {
      // @ts-ignore
      this.api.subscribeEvent({people_number: result, schedule_id: this.schedule.id}).subscribe((res) => {
        if (res) {
          this.subscription = res;
          this.schedule = res.schedule;
        }
      })
    });
  }

  openSureDialog(title: string): void {
    const dialogRef = this.dialog.open(SureDialogComponent, {
      data: {title: title},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (title === 'Unsubscribe') {
          // @ts-ignore
          this.api.unsubscribeEvent(this.subscription.id).subscribe((res) => {
            // @ts-ignore
            this.api.getSchedule(this.schedule.id).subscribe((res) => {
              this.subscription = undefined;
              this.schedule = res;
            })
          })
        } else if (title === 'Cancel') {
          // @ts-ignore
          this.api.cancelSchedule(this.schedule.id).subscribe((res) => {
            this.schedule = res;
          })
        } else if (title === 'Schedule') {
          // @ts-ignore
          this.api.uncancelSchedule(this.schedule.id).subscribe((res) => {
            this.schedule = res;
          })
        }
      }
    })
  }

  isFinished() {
    // @ts-ignore
    return new Date(this.schedule?.scheduled_at) < new Date()
  }

  get f() {
    // @ts-ignore
    return this.addSubscriptionForm.controls;
  }

  OnSuccess(result: Object) {
    // @ts-ignore
    this.scheduleAddress = result.items[0].title

  }

  OnError(error: Error) {
    alert(error);
  }

  protected readonly PageState = PageState;
}

@Component({
  selector: 'subscription-dialog',
  templateUrl: 'subscription-dialog.html',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, RxIf],
})
export class DialogAnimationsExampleDialog {
  constructor(public dialogRef: MatDialogRef<DialogAnimationsExampleDialog>, @Inject(MAT_DIALOG_DATA) public data: {
    people_number: FormControl
  },) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

