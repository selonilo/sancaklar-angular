// core/core.module.ts
import { HttpClientModule } from '@angular/common/http';
import {CommonModule} from "@angular/common";
import { NgModule } from '@angular/core';

@NgModule({
  // ...
  imports: [
    CommonModule,
    HttpClientModule // <--- Bunu mutlaka ekle
  ],
  // ...
})
export class CoreModule { }
