import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {CommentCreate, CommentModel} from "../shared/interfaces/comment-model";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {NgbRating} from "@ng-bootstrap/ng-bootstrap";
import {AuthService} from "../shared/auth/auth.service";
import {ApiService} from "../api.service";
import {MatIconModule} from "@angular/material/icon";
import {MeUser} from "../shared/auth/me-user";
import {Schedule} from "../shared/interfaces/schedule";
import {SureDialogComponent} from "../shared/components/sure-dialog/sure-dialog.component";
import {SubscriptionModel} from "../shared/interfaces/subscription-model";


@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsComponent implements OnInit {
  @Input() schedule: Schedule | undefined;
  @Output() scheduleChange = EventEmitter<Schedule | undefined>;
  @Input() subscription: SubscriptionModel | undefined;
  private addCommentForm?: FormGroup;
  user: MeUser | undefined;

  constructor(private authService: AuthService, private api: ApiService, public dialog: MatDialog, private fb: FormBuilder) {
    this.authService.user$.subscribe((user) => (this.user = user));
  }


  openDialog(title: string): void {
    let default_rate = undefined;
    let default_text = undefined;
    // @ts-ignore
    const comment = this.getMyComment()
    if (title === "Update") {
      default_rate = comment?.rating;
      default_text = comment?.text;
    }
    this.addCommentForm = this.fb.group({
      rating: new FormControl(default_rate, [Validators.required, Validators.max(5)]),
      text: new FormControl(default_text, [Validators.required]),
    },);
    const dialogRef = this.dialog.open(CreateCommentDialog, {
      data: {
        title: title,
        text: this.addCommentForm.controls['text'],
        rating: this.subscription ? this.addCommentForm.controls['rating'] : undefined
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // @ts-ignore
        let data: CommentCreate = {text: result.text.value, schedule_id: this.schedule.id}
        if (result.rating) {
          data.rating = result.rating.value;
        }
        if (title === "Create") {
          this.api.createComment(data).subscribe(res => {
            // @ts-ignore
            this.schedule.comments=[...this.schedule.comments, res];
          })
        } else if (title === "Update") {
          // @ts-ignore
          this.api.updateComment(data, comment.id).subscribe(res => {
            // @ts-ignore
            this.schedule.comments[this.schedule.comments.findIndex(c => c.user.id === this.user.id)] = Object.assign({},res);
            // @ts-ignore
            this.schedule.comments=[...this.schedule.comments];
          })
        }
        // @ts-ignore

      }
    });
  }

  isCommented(): boolean {
    if (this.schedule?.comments) {
      // @ts-ignore
      return !!(this.schedule.comments.find(c => c.user.id === this.user.id));
    }
    return false;
  }

  counter(rating: number | undefined) {
    if (rating) {
      return Array(rating).fill(rating).map((x, i) => i);
    }
    return undefined
  }

  ngOnInit(): void {
  }

  trackByFn(index:number, comment: CommentModel): string {
    return comment.id;
  }

  getMyComment(){
    // @ts-ignore
    return this.schedule.comments.find(c => c.user.id === this.user.id)
  }
  openSureDialog(title: string): void {
    const dialogRef = this.dialog.open(SureDialogComponent, {
      data: {title: title},
    });
    // @ts-ignore
    const comment :CommentModel = this.getMyComment()
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.api.deleteComment(comment.id).subscribe(res => {
          // @ts-ignore
          this.schedule.comments = this.schedule.comments.filter(function (c) {return c.id !== comment.id;});
          // @ts-ignore
          this.schedule.comments=[...this.schedule.comments];
        })
      }
    });
  }

}

@Component({
  selector: 'create-comment-dialog',
  templateUrl: 'create-comment-dialog.html',
  standalone: true,
  styles: [
    `
      i {
        font-size: 1.5rem;
        padding-right: 0.1rem;
        color: #b0c4de;
      }
    `,
  ],
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule,  NgbRating, MatIconModule],
})
export class CreateCommentDialog {
  @ViewChild('autosize') autosize?: CdkTextareaAutosize;

  constructor(public dialogRef: MatDialogRef<CreateCommentDialog>, @Inject(MAT_DIALOG_DATA) public data: {
    title: string, rating: FormControl, text: FormControl
  },) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
