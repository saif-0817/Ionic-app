import { Component, OnDestroy, OnInit } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers!: Place[];
  isLoading:boolean = false;
  private placeSub:Subscription;
  constructor(private placesService:PlacesService, private router:Router) { }

  ngOnInit() {
   this.placeSub =  this.placesService.places.subscribe((places)=>{
      this.offers = places
     });
  }

ionViewWillEnter(){
  this.isLoading = true;
  this.placesService.fetchPlaces().subscribe(()=>{
    this.isLoading = false;
  })
}
  onEdit(offerId: string, slidingItem:IonItemSliding) {
    slidingItem.close();
    console.log('Edit offer with id:', offerId);
    this.router.navigateByUrl('places/tabs/offers/edit/'+offerId)
  }

  ngOnDestroy(): void {
    if(this.placeSub){
      this.placeSub.unsubscribe();
    }

  }
}
