import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import * as Models from '../../../core/models/api.models';
import {ApiService} from "../../../core/services/api.service";

interface TechDefinition {
    key: string;
    name: string;
    description: string;
    icon: string;
}

const TECH_CONFIG: TechDefinition[] = [
    {
        key: 'SPEARMAN',
        name: 'Mızrakçı',
        description: 'Atlılara karşı son derece etkili temel savunma birimi.',
        icon: 'swords' // Alternatif: 'divide' (mızrak gibi durabilir)
    },
    {
        key: 'SWORDSMAN',
        name: 'Kılıç Ustası',
        description: 'Piyadelere karşı güçlü zırha sahip savunma birimi.',
        icon: 'shield'
    },
    {
        key: 'AXEMAN',
        name: 'Baltacı',
        description: 'Yüksek saldırı gücüne sahip, ancak savunması zayıf piyade.',
        icon: 'axe'
    },
    {
        key: 'ARCHER',
        name: 'Okçu',
        description: 'Hem piyadelere hem atlılara karşı dengeli savunma sağlar.',
        icon: 'target' // Veya 'crosshair'
    },
    {
        key: 'SCOUT',
        name: 'Casus',
        description: 'Düşman köylerindeki birimleri, binaları ve kaynakları gözetler.',
        icon: 'eye'
    },
    {
        key: 'LIGHT_CAVALRY',
        name: 'Hafif Atlı',
        description: 'Çok hızlı hareket eder. Kaynak yağmalamak için idealdir.',
        icon: 'zap' // Hızı temsilen
    },
    {
        key: 'HEAVY_CAVALRY',
        name: 'Ağır Atlı',
        description: 'Hem saldırıda hem savunmada güçlü, ağır zırhlı atlı birim.',
        icon: 'shield-check'
    },
    {
        key: 'RAM',
        name: 'Şahmerdan',
        description: 'Saldırı sırasında düşman surlarına hasar vererek savunmayı kırar.',
        icon: 'hammer'
    },
    {
        key: 'CATAPULT',
        name: 'Mancınık',
        description: 'Düşman binalarını yıkarak köyün gelişimini engeller.',
        icon: 'skull' // Yıkımı temsilen
    },
    {
        key: 'CONQUEROR',
        name: 'Misyoner',
        description: 'Düşman köyünün sadakatini düşürerek köyü ele geçirmenizi sağlar.',
        icon: 'crown'
    }
    // Not: WALL genelde "Building" (Bina) olarak geçer ama
    // eğer teknoloji ağacında sur geliştirmesi varsa buraya ekleyebiliriz:
    // { key: 'WALL', name: 'Sur Teknolojisi', description: '...', icon: 'brick-wall' }
];

@Component({
    selector: 'app-village-research',
    templateUrl: './village-research.component.html',
})
export class VillageResearchComponent implements OnInit, OnDestroy {
    @Input() villageId!: number;
    @Input() resources: any; // { wood: 100, clay: 100, iron: 100 } gibi

    queue: Models.ResearchQueueModel[] = [];
    techLevels: any = {}; // { spear: 1, sword: 0 ... }
    loading = false;

    techList = TECH_CONFIG;
    private timerSub: Subscription | null = null;

    constructor(private gameService: ApiService) {}

    ngOnInit(): void {
        this.loadData();

        // Kuyruk varsa zamanı güncellemek için basit bir interval
        this.timerSub = interval(1000).subscribe(() => {
            // Geri sayım mantığı buraya eklenebilir (UI'da pipe ile de çözülebilir)
        });
    }

    ngOnDestroy(): void {
        if (this.timerSub) this.timerSub.unsubscribe();
    }

    loadData(): void {
        this.loading = true;

        // Mevcut Seviyeleri Çek
        this.gameService.getTechnologyLevels(this.villageId).subscribe(levels => {
            this.techLevels = levels;
            this.loading = false;
        });

        // Araştırma Kuyruğunu Çek
        this.gameService.getResearchQueue(this.villageId).subscribe(queue => {
            this.queue = queue;
        });
    }

    startResearch(techKey: any): void {
        const request: Models.ResearchRequest = {
            villageId: this.villageId,
            unitType: techKey
        };

        this.gameService.startResearch(request).subscribe({
            next: (newItem) => {
                // Başarılı olduğunda kuyruğa ekle ve kaynakları güncelle (Parent'a emit edilebilir)
                this.queue.push(newItem);
                // Toast notification eklenebilir: "Araştırma başladı!"
            },
            error: (err) => {
                console.error("Araştırma başlatılamadı", err);
            }
        });
    }

    // Bir teknoloji şu an kuyrukta mı?
    isInQueue(techKey: string): boolean {
        return this.queue.some(q => q.unitType === techKey);
    }

    // Şu anki seviyeyi getir
    getLevel(techKey: string): number {
        return this.techLevels[techKey] || 0;
    }

    // Örnek maliyet hesaplama (Normalde sunucudan gelmeli veya sabit bir tabloda olmalı)
    getCost(techKey: string, currentLevel: number) {
        // Basit bir çarpan mantığı (Örnek)
        const base = 500;
        const factor = currentLevel + 1;
        return {
            wood: base * factor,
            clay: base * factor,
            iron: base * factor,
            time: 30 * factor // dakika
        };
    }
}
