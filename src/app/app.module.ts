import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {LoadingInterceptor} from "./core/interceptors/loading.interceptor";
import {SharedModule} from "./shared/shared.module";

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        SharedModule
    ],
    providers: [
        // BURASI ÇOK ÖNEMLİ: Interceptor'ı sisteme ekliyoruz
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true // Birden fazla interceptor olabilir demek
        }
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
