import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { MapModalComponent } from '../map-modal/map-modal.component';
import { Geolocation } from '@capacitor/geolocation';
@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  constructor(private modalCtrl: ModalController, private actionSheetCtrl: ActionSheetController, private alertCtrl: AlertController) { }

  ngOnInit() { }

  onPickLocation() {

    this.actionSheetCtrl.create({
      header: 'Please choose',
      buttons: [
        {
          text: 'Auto-Locate',
          handler: () => {
            this.locateUser();
          }
        },
        {
          text: 'Pick on Map',
          handler: () => {
            this.openMap();
          }

        },
        {
          text: 'Cancel',
          role: 'cancel'

        }
      ]
    }).then((actionSheetCtrlEl) => {
      actionSheetCtrlEl.present()
    })

  }




  private openMap() {
    this.modalCtrl.create({
      component: MapModalComponent
    }).then(modelCtrl => {
      modelCtrl.present()
    })
  }


  private locateUser() {
    Geolocation.getCurrentPosition().then((coordinate) => {


      if (!Geolocation.getCurrentPosition()) {
        this.alertCtrl.create({
          header: 'Could not fetch the location',
          message: 'Please use the map to pick a location!'
        })
        return;
      }

      console.log(coordinate);
    })
  }

}
