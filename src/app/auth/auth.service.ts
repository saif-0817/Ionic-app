import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User | null>(null);
  private activeLogoutTimer: any;

  constructor(private http: HttpClient) { }

  autoLogin(): Observable<boolean> {
    const storedData = localStorage.getItem('authData');

    if (!storedData) {
      return of(false); // No data found, return false wrapped in an observable
    }

    const parsedData = JSON.parse(storedData) as { token: string; tokenExpirationDate: string; userId: string; email: string };

    // Check if all required fields are present
    if (!parsedData.token || !parsedData.tokenExpirationDate || !parsedData.userId || !parsedData.email) {
      return of(false); // Missing required fields, return false wrapped in an observable
    }

    // Check if the token is still valid
    const expirationDate = new Date(parsedData.tokenExpirationDate);
    if (expirationDate <= new Date()) {
      return of(false); // Token expired, return false wrapped in an observable
    }

    const user = new User(parsedData.userId, parsedData.email, parsedData.token, expirationDate);
    this._user.next(user);
    this.autoLogout(user.tokenDuration); // Set up auto logout timer

    // All conditions passed, return true wrapped in an observable
    return of(true);
  }

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user && user.token) {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
      map(user => (user ? user.id : null))
    );
  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
      { email: email, password: password, returnSecureToken: true }
    ).pipe(
      tap(this.setUserData.bind(this))
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
      { email: email, password: password, returnSecureToken: true }
    ).pipe(
      tap(this.setUserData.bind(this))
    );
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    localStorage.removeItem('authData');
    this._user.next(null);
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
    const user = new User(userData.localId, userData.email, userData.idToken, expirationTime);
    this._user.next(user);
    this.autoLogout(user.tokenDuration); // Set up auto logout timer
    this.storeAuthData(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email);
  }

  private storeAuthData(userId: string, token: string, tokenExpirationDate: string, email: string) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email
    });
    localStorage.setItem('authData', data);
  }

  ngOnDestroy(): void {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }
}
