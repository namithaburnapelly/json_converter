import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormComponent } from './form/form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from './loading/loading.component';
import { LucideAngularModule, Loader } from 'lucide-angular';

@NgModule({
  declarations: [AppComponent, FormComponent, LoadingComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ Loader }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
