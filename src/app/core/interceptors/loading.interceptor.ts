import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

    constructor(private loadingService: LoadingService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // 1. İstek başladığında loading'i aç
        // Bazı özel isteklerde (örneğin arka plan chat güncellemesi) loading göstermek istemezsen
        // request.url kontrolü yapabilirsin. Şimdilik hepsinde gösterelim.
        this.loadingService.show();

        return next.handle(request).pipe(
            // 2. İstek bittiğinde (Başarılı veya Hatalı fark etmez) loading'i kapat
            finalize(() => {
                this.loadingService.hide();
            })
        );
    }
}
