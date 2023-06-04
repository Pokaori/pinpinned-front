import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from "../api.service";

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  isConfirm = false;
  id?: string;
  backErr?: string;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {
  }

  confirmRegistration(): void {

    if (this.id) {
      this.apiService.verifyEmail(this.id)
        .subscribe({
          next: (result) => {
            this.isConfirm = true;
          },
          error: (err) => {
            this.backErr = "Something went wrong, please try again";
          }
        });
    }
  }

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe((params: any) => {
      this.id = params.get('id');
      this.confirmRegistration()
    })

  }

  ngOnInit(): void {
  }
}
