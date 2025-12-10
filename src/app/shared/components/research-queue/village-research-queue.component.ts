import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import {ResearchQueueModel} from "../../../core/models/api.models";

@Component({
    selector: 'app-village-research-queue',
    templateUrl: './village-research-queue.component.html',
})
export class VillageResearchQueueComponent implements OnInit, OnDestroy, OnChanges {
    @Input() queue: ResearchQueueModel[] = [];

    // Görüntüleme için işlenmiş liste
    displayQueue: any[] = [];
    private timerSub: Subscription | null = null;

    // İkon Eşleştirmesi (Tekrar etmemek için service'e alınabilir ama burada pratik olsun)
    private iconMap: { [key: string]: string } = {
        'SPEARMAN': 'sword', 'SWORDSMAN': 'shield', 'AXEMAN': 'axe',
        'ARCHER': 'crosshair', 'SCOUT': 'eye', 'LIGHT_CAVALRY': 'zap',
        'HEAVY_CAVALRY': 'shield-check', 'RAM': 'hammer', 'CATAPULT': 'skull',
        'CONQUEROR': 'crown'
    };

    ngOnInit(): void {
        this.startTimer();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['queue']) {
            this.updateDisplayQueue();
        }
    }

    ngOnDestroy(): void {
        if (this.timerSub) this.timerSub.unsubscribe();
    }

    // Her saniye tetiklenir
    private startTimer() {
        this.timerSub = interval(1000).subscribe(() => {
            if (this.displayQueue.length > 0) {
                const now = new Date().getTime();

                this.displayQueue.forEach(item => {
                    const end = new Date(item.completionTime).getTime();
                    const start = new Date(item.startTime).getTime();

                    // Kalan saniye hesapla
                    const diff = Math.max(0, Math.floor((end - now) / 1000));
                    item.liveRemaining = diff;

                    // Progress Bar yüzdesi hesapla
                    const totalDuration = end - start;
                    const elapsed = now - start;
                    // Yüzdeyi 0 ile 100 arasında tut
                    item.progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                });
            }
        });
    }

    private updateDisplayQueue() {
        // Gelen veriyi UI için zenginleştiriyoruz
        this.displayQueue = this.queue.map(item => ({
            ...item,
            icon: this.iconMap[item.unitType] || 'flask-conical', // Varsayılan ikon
            liveRemaining: item.remainingSeconds, // İlk başta backend verisi
            progress: 0 // İlk hesaplamayı bekler
        }));
    }

    // Saniyeyi "02:15:30" formatına çevirir
    formatTime(seconds: number): string {
        if (seconds <= 0) return 'Tamamlanıyor...';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        // Saat varsa göster, yoksa dk:sn
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}
