import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    // BehaviorSubject, ona abone olanlara son değeri anında verir.
    private isLoading$$ = new BehaviorSubject<boolean>(false);
    isLoading$ = this.isLoading$$.asObservable();

    // Birden fazla istek aynı anda atılırsa, loading hemen kapanmasın diye sayaç tutuyoruz.
    // Örn: Harita ve Köy bilgisi aynı anda çekiliyor. Biri bitince loading kapanmamalı, ikisi de bitince kapanmalı.
    private requestCount = 0;

    show() {
        this.requestCount++;
        if (this.requestCount === 1) {
            this.isLoading$$.next(true);
        }
    }

    hide() {
        if (this.requestCount > 0) {
            this.requestCount--;
            if (this.requestCount === 0) {
                this.isLoading$$.next(false);
            }
        }
    }
}
