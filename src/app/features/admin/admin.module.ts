import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminWorldsComponent } from './admin-worlds.component';

@NgModule({
    declarations: [
        AdminWorldsComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AdminRoutingModule
    ]
})
export class AdminModule { }
