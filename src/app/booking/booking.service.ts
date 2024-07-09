import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { switchMap, take, tap, map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

export interface BookingData {
  bookedFrom: string; // ISO string for the date
  bookedTo: string; // ISO string for the date
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImg: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: any,
    dateTo: any
  ) {
    let generatedId: string;
    let newBooking: Booking;

    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found'); // Throw error if userId is not available
        }

        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          userId,
          placeTitle,
          placeImg,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );
        return this.http.post<{ name: string }>(
          'https://ionic-angular-course-e29fa-default-rtdb.firebaseio.com/bookings.json',
          { ...newBooking, id: null }
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = generatedId;
        this._bookings.next([...bookings, newBooking]);
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.http
      .delete(`https://ionic-angular-course-e29fa-default-rtdb.firebaseio.com/bookings/${bookingId}.json`)
      .pipe(
        switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          this._bookings.next(
            bookings.filter(booking => booking.id !== bookingId)
          );
        })
      );
  }

  fetchBookings() {
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found');
        }
        return this.http.get<{ [key: string]: BookingData }>(
          `https://ionic-angular-course-e29fa-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${userId}"`
        );
      }),
      map(bookingData => {
        const bookings: Booking[] = [];
        for (const key in bookingData) {
          if (bookingData.hasOwnProperty(key)) {
            bookings.push(
              new Booking(
                key,
                bookingData[key].placeId,
                bookingData[key].userId,
                bookingData[key].placeTitle,
                bookingData[key].placeImage,
                bookingData[key].firstName,
                bookingData[key].lastName,
                bookingData[key].guestNumber,
                new Date(bookingData[key].bookedFrom),
                new Date(bookingData[key].bookedTo)
              )
            );
          }
        }
        return bookings;
      }),
      tap(bookings => {
        this._bookings.next(bookings);
      })
    );
  }
}
