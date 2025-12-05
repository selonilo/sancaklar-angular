import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminWorldsComponent } from './admin-worlds.component';

const routes: Routes = [
    {
        path: '',
        component: AdminWorldsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
