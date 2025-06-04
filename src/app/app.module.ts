import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormComponent } from './form/form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from './loading/loading.component';
import { LucideAngularModule, Loader } from 'lucide-angular';
import { ConversionService } from './service/conversion.service';
import { PrettyJsonPipePipe } from './pretty-json-pipe.pipe';

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    LoadingComponent,
    PrettyJsonPipePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ Loader }),
  ],
  providers: [ConversionService],
  bootstrap: [AppComponent],
})
export class AppModule {}
