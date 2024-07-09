import { Component, Input, OnInit, ViewChild, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random';
  @ViewChild('f', { static: true }) form: NgForm;
  startDate: any;
  endDate: any;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.selectedPlace) {
      this.selectedPlace.availableFrom = this.isoDateOnly(
        this.selectedPlace.availableFrom
      );
      this.selectedPlace.availableTo = this.isoDateOnly(
        this.selectedPlace.availableTo
      );
    }

    const randomDateFrom = new Date(this.selectedPlace.availableFrom);
    const randomDateTo = new Date(this.selectedPlace.availableTo);

    if (this.selectedMode === 'random') {
      this.startDate = new Date(
        randomDateFrom.getTime() +
          Math.random() * (randomDateFrom.getTime() - randomDateTo.getTime())
      );

      // Ensure end date is after start date and within available period
      this.endDate = new Date(
        this.startDate.getTime() + 6 * 24 * 60 * 60 * 1000
      );

      // Format startDate and endDate using isoDateOnly()
      this.startDate = this.isoDateOnly(this.startDate);
      this.endDate = this.isoDateOnly(this.endDate);

      console.log(this.startDate);
      console.log(this.endDate);
    }
  }

  isoDateOnly(date: Date): string {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onBookPlace() {
    if (this.form.invalid || !this.datesValid) {
      return;
    }
    this.modalCtrl.dismiss(
      {
        bookingData: {
          firstName: this.form.value['first-name'],
          lastName: this.form.value['last-name'],
          guestNumber: Number(this.form.value['guest-number']),
          startDate: new Date(this.form.value['date-from']),
          endDate: new Date(this.form.value['date-to']),
        },
      },
      'confirm'
    );
  }

  datesValid() {
    const startDate = this.form.value['date-from'];
    const endDate = this.form.value['date-to'];

    return endDate > startDate;
  }
}
