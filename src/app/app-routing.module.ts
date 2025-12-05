import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
    },

    {
        path: 'register',
        loadChildren: () => import('./features/register/register.module').then(m => m.RegisterModule)
    },
    {
        path: 'login',
        loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule)
    },
    {
        path: 'worlds',
        loadChildren: () => import('./features/worlds/worlds.module').then(m => m.WorldsModule)
    },
    {
        path: 'game',
        loadChildren: () => import('./features/game/game.module').then(m => m.GameModule)
    },
    {
        path: 'admin-gizli',
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
