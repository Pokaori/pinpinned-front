import {HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {BehaviorSubject, catchError, map, of} from 'rxjs';
import {LoginModel} from 'src/app/login/login-model';
import {TokenModel} from './token-model';
import {UserProfile} from './user-profile';
import {MeUser} from "./me-user";
import {RegistrModel} from "../../registration/registr-model";
import {environment} from "src/environment/environment";
const baseUrl = environment.backURL;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {
  }

  userProfile = new BehaviorSubject<UserProfile | null>(null);
  jwtService: JwtHelperService = new JwtHelperService();
  private user = new BehaviorSubject<MeUser | undefined>(undefined);
  user$ = this.user.asObservable();

  getProfile() {
    const localStorageToken = localStorage.getItem('tokens');
    let access_token = ""
    if (localStorageToken) {
      const token = JSON.parse(localStorageToken) as TokenModel;
      access_token = token.access_token
    }
    this.httpClient.get<MeUser>(
      `${baseUrl}user/portfolio`, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${access_token}`
        })
      }).subscribe((res) => {
      this.user.next(res);
    });
  }
    userLogin(payload: LoginModel) {
    let formData: any = new FormData();
    formData.append('username', payload.email);
    formData.append('password', payload.password);
    return this.httpClient
      .post(`${baseUrl}auth/login`, formData)
      .pipe(
        map((data) => {
          let token = data as TokenModel;

          localStorage.setItem('tokens', JSON.stringify(token));

          let userInfo = this.jwtService.decodeToken(
            token.access_token
          ) as UserProfile;

          this.userProfile.next(userInfo);
          this.getProfile()
          return true;
        }),
        catchError((error) => {
          return of(error);
        })
      );
  }
  userRegister(payload: RegistrModel) {
    return this.httpClient
      .post<MeUser>(  `${baseUrl}auth/signup`, payload)
  }

  getAccessToken(): string {
    const localStorageToken = localStorage.getItem('tokens');
    if (localStorageToken) {
      const token = JSON.parse(localStorageToken) as TokenModel;
      const isTokenExpired = this.jwtService.isTokenExpired(token.access_token);
      if (isTokenExpired) {
        this.userProfile.next(null);
        return "";
      }
      let userInfo = this.jwtService.decodeToken(
        token.access_token
      ) as UserProfile;
      this.userProfile.next(userInfo);
      return token.access_token;
    }
    return "";
  }

  refreshToken(payload: TokenModel) {
    const localStorageToken = localStorage.getItem('tokens');
    if (localStorageToken) {
      const token = JSON.parse(localStorageToken) as TokenModel;
      return this.httpClient.get<TokenModel>(
        `${baseUrl}auth/refresh`, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${token.refresh_token}`
          })});
    }
    return this.httpClient.get<TokenModel>(
      `${baseUrl}auth/refresh`)
  }


  isAuthenticated(): boolean {
    const localStorageToken = localStorage.getItem('tokens');
    if (localStorageToken) {
      const token = JSON.parse(localStorageToken) as TokenModel;
      const isTokenExpired = this.jwtService.isTokenExpired(token.refresh_token);
      if (isTokenExpired) {
        this.userProfile.next(null);
      }
      return !isTokenExpired
    }
    return false
  }
  logout(){
    const localStorageToken = localStorage.getItem('tokens');
    if (localStorageToken) {
        localStorage.removeItem('tokens')
    }
    this.user.next(undefined);
  }


  }


