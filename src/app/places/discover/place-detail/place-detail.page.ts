import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from 'src/app/booking/create-booking/create-booking.component';
import { Subscription, switchMap, take } from 'rxjs';
import { BookingService } from 'src/app/booking/booking.service';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading: boolean = false;
  private placeSub: Subscription;

  constructor(
    private navctrl: NavController,
    private activatedRoute: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('placeId')) {
        this.navctrl.navigateBack('places/tabs/discover');
        return;
      }

      this.isLoading = true;
      let fetchedUserId: string;

      this.authService.userId.pipe(
        take(1),
        switchMap(userId => {
          if (!userId) {
            throw new Error('Found no user!');
          }
          fetchedUserId = userId;
          return this.placesService.getPlace(paramMap.get('placeId')!);
        })
      ).subscribe((place) => {
          this.place = place;
          this.isBookable = place.userId !== fetchedUserId;
          this.isLoading = false;
        }, (error) => {
          this.alertCtrl.create({
            header: 'An error occured!',
            message: 'Could not load place.',
            buttons: [{
              text: 'Okay', handler: () => {
                this.navctrl.navigateBack('/places/tabs/discover');
              }
            }]
          }).then(alertCtrlEl => {
            alertCtrlEl.present();
          });
        });
    });
  }

  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navctrl.navigateBack('/places/tabs/discover');
    // this.navctrl.pop();

    this.actionSheetCtrl
      .create({
        header: 'Choose an Action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingModal('select');
            },
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookingModal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionsheetEl) => {
        actionsheetEl.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resultData) => {
        console.log(resultData.data, resultData.role);

        if (resultData.role === 'confirm') { // Fix the assignment issue here
          this.loadingCtrl
            .create({
              message: 'Booking place....',
            })
            .then((loadingEl) => {
              loadingEl.present();
              const data = resultData.data;
              console.log(data)
              this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.bookingData.firstName,
                  data.bookingData.lastName,
                  data.bookingData.guestNumber,
                  data.bookingData.startDate,
                  data.bookingData.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss(); // Fix here: call dismiss correctly
                });
            });
        }
      });
  }

  ngOnDestroy(): void {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
