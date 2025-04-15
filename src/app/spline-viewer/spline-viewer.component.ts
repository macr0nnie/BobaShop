// spline-viewer.component.ts
import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { Application } from '@splinetool/runtime';
import { RouterOutlet } from '@angular/router';
import { NgStyle } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spline-viewer',
  templateUrl: './spline-viewer.component.html',
  imports: [RouterOutlet],
  standalone: true,
  styleUrls: ['./spline-viewer.component.css']
})
export class SplineViewerComponent implements AfterViewInit {
  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    const canvas = this.elementRef.nativeElement.querySelector('canvas');
    const app = new Application(canvas);
    app.load('https://prod.spline.design/M-2ESSn60ZHgdK0p/scene.splinecode'); 
  }
}