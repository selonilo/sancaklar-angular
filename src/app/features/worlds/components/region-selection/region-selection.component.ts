import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegionDirection } from '../../../../core/models/api.models';

interface RegionOption {
    value: RegionDirection;
    title: string;
    description: string;
    imageUrl: string;
}

@Component({
    selector: 'app-region-selection',
    templateUrl: './region-selection.component.html',
    styleUrls: ['./region-selection.component.scss']
})
export class RegionSelectionComponent {
    @Input() selectedRegion: RegionDirection | null = null;
    @Output() onSelectRegion = new EventEmitter<RegionDirection>();

    regions: RegionOption[] = [
        {
            value: 'NORTH',
            title: 'KUZEYİN BUZULLARI',
            description: 'Çelik gibi sert, soğuk rüzgarların dövdüğü topraklar.',
            imageUrl: 'assets/images/regions/kuzey.png'
        },
        {
            value: 'EAST',
            title: 'ŞAFAK BOZKIRLARI',
            description: 'Güneşin doğduğu, sonsuz düzlüklerin diyarı.',
            imageUrl: 'assets/images/regions/safak.png'
        },
        {
            value: 'SOUTH',
            title: 'KIZIL VADİ',
            description: 'Bereketli topraklar, sıcak denizler ve zengin ticaret.',
            imageUrl: 'assets/images/regions/kizil.png'
        },
        {
            value: 'WEST',
            title: 'GÖLGE ORMANLARI',
            description: 'Gizemli ağaçların arasında saklanan kadim sırlar.',
            imageUrl: 'assets/images/regions/golge.png'
        },
        {
            value: 'RANDOM',
            title: 'KADERİN SEÇİMİ',
            description: 'Bilinmeze doğru cesur bir adım at.',
            imageUrl: 'assets/images/regions/random.png'
        }
    ];

    select(value: RegionDirection) {
        if (this.selectedRegion === value) {
            // Eğer tıklanan zaten seçiliyse -> SEÇİMİ KALDIR (null gönder)
            this.onSelectRegion.emit();
        } else {
            // Değilse -> YENİ SEÇİM YAP
            this.onSelectRegion.emit(value);
        }
    }
}
