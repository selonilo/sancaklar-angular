import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { LucideAngularModule, Castle, Mail, User, Lock, Loader2, ArrowLeft,Sword } from 'lucide-angular';
import {CoreModule} from "../../core/core.module";

@NgModule({
  declarations: [
    RegisterComponent
  ],
  exports: [
    RegisterComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    RegisterRoutingModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({Castle, Mail, User, Lock, Loader2, ArrowLeft, Sword})
  ]
})
export class RegisterModule { }
