import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public em!: string;
  public psw!: string;

  constructor(private alertController: AlertController) {}

  public async login(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Ciao!',
      message: `Stiamo lavorando per creare un'esperienza unica che renderà l'utilizzo semplice e immediato per tutti, ci serve solo un altro pò di tempo!`,
      buttons: ['Va bene'],
      mode: 'ios'
    });

    await alert.present();
  }
}
