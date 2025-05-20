import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DecimalPipe, NgIf, NgForOf} from "@angular/common";
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    DecimalPipe
  ],
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss',
  animations: [
    trigger('flip', [
      transition(':increment', [
        style({ transform: 'rotateX(90deg)', opacity: 0 }),
        animate('0.3s cubic-bezier(0.4,0,0.2,1)', style({ transform: 'rotateX(0)', opacity: 1 }))
      ]),
      transition(':decrement', [
        style({ transform: 'rotateX(-90deg)', opacity: 0 }),
        animate('0.3s cubic-bezier(0.4,0,0.2,1)', style({ transform: 'rotateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() endTime!: string | Date;
  @Input() offPercent: number = 37;
  @Input() promoTitle: string = 'BLACK FRIDAY';
  @Input() promoDesc: string = 'Mùa Black Friday đã trở lại với ưu đãi lớn nhất trong năm: <b>Giảm giá 37%</b> cho toàn bộ sản phẩm!\n' +
    'Đừng bỏ lỡ cơ hội mua sắm siêu hấp dẫn này. <a href="#">Nhấn vào đây</a> để nhận mã giảm giá ngay!';
  @Input() showIcon: boolean = true;
  days = 0; hours = 0; minutes = 0; seconds = 0;
  daysArray: number[] = [];
  hoursArray: number[] = [];
  minutesArray: number[] = [];
  secondsArray: number[] = [];
  promoTitleArray: string[] = [];
  private intervalId: any;

  ngOnInit() {
    this.daysArray = Array.from({ length: 32 }, (_, i) => i); // 0-31
    this.hoursArray = Array.from({ length: 24 }, (_, i) => i); // 0-23
    this.minutesArray = Array.from({ length: 60 }, (_, i) => i); // 0-59
    this.secondsArray = Array.from({ length: 60 }, (_, i) => i); // 0-59
    this.promoTitleArray = this.promoTitle.split('');
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
  }
  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
  updateTime() {
    const now = new Date().getTime();
    const end = new Date(this.endTime).getTime();
    const diff = Math.max(0, end - now);
    this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    this.minutes = Math.floor((diff / (1000 * 60)) % 60);
    this.seconds = Math.floor((diff / 1000) % 60);
  }
}
