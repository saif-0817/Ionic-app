import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PlacesService } from '../../places.service';
import { LoadingController, NavController } from '@ionic/angular';
import { switchMap } from 'rxjs/operators';

function base64toBlob(base64Data: string, contentType: string = 'image/jpeg'): Blob {
  const byteCharacters = atob(base64Data);
  const byteArrays: Uint8Array[] = [];
  const sliceSize = 512;

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  try {
    return new Blob(byteArrays, { type: contentType });
  } catch (error) {
    console.error('Error creating Blob:', error);
    throw new Error('Failed to create Blob');
  }
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;
  minDate: string;
  maxDate: string;

  constructor(
    private placesService: PlacesService,
    private navCtrl: NavController,
    private loaderCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.minDate = this.isoDateOnly(new Date());
    this.maxDate = this.isoDateOnly(new Date('2024-12-31'));

    this.form = new FormGroup({
      title: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      description: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)],
      }),
      price: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)],
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      image: new FormControl(null, {
        validators: [Validators.required]
      })
    });
  }

  onCreateOffer() {
    if (this.form.invalid || !this.form.get('image').value) {
      console.log(this.form);
      return;
    }
    console.log(this.form.value);
    this.loaderCtrl
      .create({
        message: 'Creating place',
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.placesService.uploadImage(this.form.get('image').value).pipe(
          switchMap(uploadRes => {
            return this.placesService.addPlace(
              this.form.value.title,
              this.form.value.description,
              +this.form.value.price,
              new Date(this.form.value.dateFrom),
              new Date(this.form.value.dateTo),
              uploadRes.imageUrl
            );
          })
        )
        .subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.navCtrl.navigateBack('/places/tabs/offers');
        });
      });
  }

  isoDateOnly(date: Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();

    return [year, month, day].join('-');
  }

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(imageData.replace(/^data:image\/(png|jpeg);base64,/, ''));
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }

    this.form.patchValue({ image: imageFile });
  }
}
