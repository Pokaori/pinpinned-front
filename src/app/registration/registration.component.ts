import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import {Gender} from "./registr-model";
import {AuthService} from "../shared/auth/auth.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  choicesGend: Record<string, Gender> = {
    "Man": Gender.Man,
    "Woman": Gender.Woman,
    "Prefer not to say": Gender.Undefined
  }
  registerForm: FormGroup;
  maxDate: Date = new Date();
  backErr: string | undefined;
  isRegistered: boolean = false;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', Validators.required),
      phoneNumber: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      dateBirth: ['', [Validators.required]],
      gender: ['Prefer not to say']
    }, {validators: this.checkPasswords});
  }

  ngOnInit(): void {
  }

  checkPasswords = (group: AbstractControl) => {
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value
    pass === confirmPass ? group.get('confirmPassword')?.setErrors(null) : group.get('confirmPassword')?.setErrors({notSame: true})
  }

  userRegister() {
    if (this.registerForm.invalid) {
      return;
    }
    this.authService.userRegister({
      first_name: this.registerForm.controls['firstName'].value,
      last_name: this.registerForm.controls['lastName'].value,
      email: this.registerForm.controls['email'].value,
      password: this.registerForm.controls['password'].value,
      phone_number: "+38" + this.registerForm.controls['phoneNumber'].value,
      date_of_birth: this.registerForm.controls['dateBirth'].value.toLocaleDateString('sv'),
      gender: this.choicesGend[String(this.registerForm.controls['gender'].value)]
    }).subscribe({
      next: (result) => {
        // if (result) {
        //   this.authService.userLogin({
        //     email: this.registerForm.controls['email'].value,
        //     password: this.registerForm.controls['password'].value
        //   }).subscribe((data) => {
        //   });
        // }
        this.isRegistered = true;
      },
      error: (err) => {
        this.backErr = err.error['detail'];
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  unsorted() {
    return 0;
  }
}
