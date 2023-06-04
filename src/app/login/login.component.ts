import {Component, OnInit} from '@angular/core';
import {AuthService} from "../shared/auth/auth.service";
import {Router} from "@angular/router";
import {LoginModel} from "./login-model";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  backErr: string | undefined;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {

  }

  userLogin() {
    if (this.loginForm.invalid) {
      return;
    }
    this.authService.userLogin({
      email: this.loginForm.controls['username'].value,
      password: this.loginForm.controls['password'].value
    }).subscribe((data) => {
      if (data && data.status != 200) {
        if (data.error["detail"]) {
          this.backErr = data.error["detail"];
        }
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
