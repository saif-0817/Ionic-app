import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy{
  private authSub:Subscription;
  private previousAuthState = false;
  constructor(private authService: AuthService, private router: Router, private platform: Platform) { }

ngOnInit(){
  this.intializaApp();

 this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth=>{
  if(!isAuth && this.previousAuthState !==isAuth){
    this.router.navigate(['/auth'])
  }

  this.previousAuthState = isAuth;

  })
}


  intializaApp() {
    this.platform.ready().then(async () => {
      await SplashScreen.show({
        showDuration: 2000,
        autoHide: true,
      });
    })
  }


  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  ngOnDestroy(): void {
      this.authSub.unsubscribe();
  }
}
