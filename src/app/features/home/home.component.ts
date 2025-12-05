import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ApiService} from '../../core/services/api.service'; // Servisi import et

interface Particle {
    left: string;
    top: string;
    delay: string;
    duration: string;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    particles: Particle[] = [];

    features = [
        {
            iconName: 'castle',
            title: 'Köyünü Kur',
            desc: 'Binalar inşa et, kaynaklarını yönet ve köyünü geliştir.',
        },
        {
            iconName: 'swords',
            title: 'Savaş',
            desc: 'Güçlü ordular oluştur ve düşmanlarını yenilgiye uğrat.',
        },
        {
            iconName: 'crown',
            title: 'Hükmet',
            desc: 'Topraklarını genişlet ve imparatorluğunu büyüt.',
        },
        {
            iconName: 'users',
            title: 'İttifaklar',
            desc: 'Klanlar kur, dostlarınla birlikte zafer kazan.',
        },
    ];

    // Başlangıçta boş veya placeholder değerler
    stats = [
        {value: '-', label: 'Aktif Oyuncu'},
        {value: '-', label: 'Köy Kuruldu'},
        {value: '-', label: 'Aktif Dünya'}, // 'Savaş Yapıldı' yerine API'den gelen 'world' verisini koyduk
    ];

    constructor(
        private router: Router,
        private apiService: ApiService // Servisi inject et
    ) {
    }

    ngOnInit() {
        this.generateParticles();
        this.loadStats(); // İstatistikleri çek
    }

    private loadStats() {
        this.apiService.getActiveCount().subscribe({
            next: (data) => {
                this.stats = [
                    {value: this.formatNumber(data.activeUser), label: 'Aktif Oyuncu'},
                    {value: this.formatNumber(data.village), label: 'Köy Kuruldu'},
                    {value: data.world.toString(), label: 'Aktif Dünya'}
                ];
            },
            error: (err) => {
                console.error('İstatistikler yüklenemedi', err);
                // Hata durumunda varsayılan değerler kalabilir veya manuel set edebilirsin
            }
        });
    }

    // Sayıları havalı göstermek için yardımcı fonksiyon (1500 -> 1.5k+)
    private formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M+';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k+';
        }
        return num.toString();
    }

    private generateParticles() {
        this.particles = Array(30).fill(0).map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${10 + Math.random() * 10}s`,
        }));
    }
}
