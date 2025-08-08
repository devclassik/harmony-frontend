import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';


export interface Slide {
  title: string;
  description: string;
  tag: string;
  bgImage?: string;
  overlayImage?: string;
}

@Component({
  selector: 'app-login-caption',
  imports: [CommonModule],
  templateUrl: './login-caption.component.html',
  styleUrl: './login-caption.component.css'
})
export class LoginCaptionComponent implements OnInit, OnDestroy {

  @Input() backgroundImage = '/assets/svg/logincaption.svg';
  @Input() overlayImage = '/assets/images/ydd-logo.png';
  @Input() slides: Slide[] = [];
  @Input() autoSlideInterval = 3000;

  currentIndex = 0;
  intervalId: any;


  get currentSlide() {
    return this.slides[this.currentIndex];
  }

  ngOnInit() {
    if (this.slides.length > 1) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }


  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideInterval);
  }


  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  get overlayImageUrl(): string {
    return `${this.currentSlide?.overlayImage || this.overlayImage}`;
  }

  get backgroundUrl(): string {
    return `url(${this.currentSlide?.bgImage || this.backgroundImage})`;
  }

}
