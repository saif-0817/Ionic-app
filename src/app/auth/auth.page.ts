import { Component, OnInit } from '@angular/core';
import { AuthResponseData, AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false; // Loading state indicator
  isLogin: boolean = true; // Boolean to toggle between login and signup mode

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  // Method to handle authentication
  authenticate(email: string, password: string) {
    // Display loading indicator
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then((loadingEl) => {
        loadingEl.present(); // Present the loading indicator
        let authObs: Observable<AuthResponseData>;

        // Choose the appropriate authentication method based on isLogin
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }

        // Subscribe to the authentication observable
        authObs.subscribe(
          (resData) => {
            console.log(resData); // Log the response data
            loadingEl.dismiss(); // Dismiss the loading indicator
            this.router.navigateByUrl('/places/tabs/discover'); // Navigate to the discover page
          },
          (error) => {
            loadingEl.dismiss(); // Dismiss the loading indicator on error
            const errorRes = error.error.error.message; // Extract the error message
            let message = 'Could not sign you up, please try again.'; // Default error message

            // Customize error message based on the error type
            if (errorRes === 'EMAIL_EXISTS') {
              message = 'This email address exists already!';
            } else if (errorRes === 'EMAIL_NOT_FOUND') {
              message = 'E-Mail address could not be found';
            } else if (errorRes === 'INVALID_PASSWORD') {
              message = 'This password is not correct';
            }

            // Show the alert with the error message
            this.showAlert(message);
            console.log(error); // Log the error for debugging
          }
        );
      });
  }

  // Method to switch between login and signup mode
  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  // Method to handle form submission
  onSubmit(form: NgForm) {
    if (!form.valid) {
      return; // If the form is invalid, do nothing
    }
    const email = form.value.email; // Extract email from form
    const password = form.value.password; // Extract password from form

    // Call the authenticate method with email and password
    this.authenticate(email, password);

    form.reset()
  }

  // Method to display an alert with a given message
  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay'],
      })
      .then((alertElement) => {
        alertElement.present(); // Present the alert
      });
  }

}
