import {Component} from '@angular/core';
import {delay, Observable} from "rxjs";
import {LoadingService} from "./core/services/loading.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'sancaklar-angular';
    isLoading$: Observable<boolean>;

    constructor(private loadingService: LoadingService) {
        // ExpressionChangedAfterItHasBeenCheckedError hatasını önlemek için ufak bir delay
        this.isLoading$ = this.loadingService.isLoading$.pipe(delay(0));
    }
}
