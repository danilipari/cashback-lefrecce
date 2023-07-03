import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewsRoutingModule } from './views-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

const components: any[] = [
  LoginComponent
];

@NgModule({
  declarations: [components],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    ViewsRoutingModule,
  ],
  exports: [components],
})
export class ViewsModule { }
