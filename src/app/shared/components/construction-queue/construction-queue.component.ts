import {Component, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {ConstructionModel} from "../../../core/models/api.models";
import {BUILDINGS_CONFIG} from "../../../features/game/game.constants";
import {ApiService} from "../../../core/services/api.service";

@Component({
    selector: 'app-construction-queue',
    templateUrl: './construction-queue.component.html',
})
export class ConstructionQueueComponent {
    @Input() constructions: ConstructionModel[] = [];

    // Parent componenti uyarmak için event tanımlıyoruz (Kaynak güncellemesi için)
    @Output() onQueueUpdated = new EventEmitter<void>();

    isModalOpen = false;
    pendingDeleteId: number | null = null;
    buildingsConfig = BUILDINGS_CONFIG;

    constructor(private apiService: ApiService) {
    }


    formatTime(seconds: number): string {
        if (seconds <= 0) {
            return 'Tamamlandı';
        }
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const hDisplay = h > 0 ? `${h}sa ` : '';
        const mDisplay = m > 0 ? `${m}dk ` : '';
        const sDisplay = `${s}sn`;
        return `${hDisplay}${mDisplay}${sDisplay}`;
    }

    // 1. İLK TIKLAMADA ÇALIŞACAK METOD (Sadece Modal Açar)
    openCancelModal(id: number) {
        this.pendingDeleteId = id;
        this.isModalOpen = true;
    }

    // 2. MODAL KAPATMA
    closeModal() {
        this.isModalOpen = false;
        this.pendingDeleteId = null;
    }

    getProgress(c: any): number {
        const start = new Date(c.startTime).getTime();
        const end = new Date(c.completionTime).getTime();
        const totalDuration = end - start;
        const elapsed = totalDuration - (c.remainingSeconds * 1000);
        const percentage = (elapsed / totalDuration) * 100;
        return Math.min(100, Math.max(0, percentage));
    }

    confirmCancel() {
        if (this.pendingDeleteId === null) return;

        const id = this.pendingDeleteId;

        // Yükleniyor durumu eklemek istersen burada loading = true yapabilirsin

        this.apiService.cancelConstruction(id).subscribe({
            next: () => {
                this.constructions = this.constructions.filter(c => c.id !== id);
                this.onQueueUpdated.emit();
                this.closeModal(); // İşlem bitince modalı kapat
            },
            error: (err) => {
                console.error("İptal hatası:", err);
                this.closeModal();
            }
        });
    }
}
