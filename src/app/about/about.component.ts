import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FlowerType {
  id: number;
  name: string;
  color: string;
  petalCount: number;
  petalShape: 'round' | 'pointed' | 'oval';
  size: number;
  centerSize: number;
  centerColor: string;
}

interface FlowerInstance {
  type: FlowerType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  stemLength?: number;
  stemThickness?: number;
  stemColor?: string;
  isDragging?: boolean;
}

interface VaseType {
  id: number;
  name: string;
  color: string;
  shape: 'classic' | 'modern' | 'bowl';
  selected: boolean;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit, AfterViewInit {
  @ViewChild('flowerCanvas') flowerCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bouquetCanvas') bouquetCanvas!: ElementRef<HTMLCanvasElement>;
  
  private flowerCtx!: CanvasRenderingContext2D;
  private bouquetCtx!: CanvasRenderingContext2D;
  
  // Track drag operations
  private isDragging: boolean = false;
  private draggedFlowerIndex: number = -1;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  
  flowerTypes: FlowerType[] = [
    { id: 1, name: 'Rose', color: '#ff5555', petalCount: 20, petalShape: 'oval', size: 30, centerSize: 10, centerColor: '#ffcc00' },
    { id: 2, name: 'Tulip', color: '#9933ff', petalCount: 6, petalShape: 'pointed', size: 25, centerSize: 8, centerColor: '#663300' },
    { id: 3, name: 'Sunflower', color: '#ffcc00', petalCount: 24, petalShape: 'pointed', size: 35, centerSize: 15, centerColor: '#663300' },
    { id: 4, name: 'Daisy', color: '#ffffff', petalCount: 12, petalShape: 'oval', size: 20, centerSize: 10, centerColor: '#ffcc00' },
    { id: 5, name: 'Lily', color: '#ff9933', petalCount: 6, petalShape: 'pointed', size: 30, centerSize: 8, centerColor: '#663300' },
    { id: 6, name: 'Orchid', color: '#ff66cc', petalCount: 5, petalShape: 'round', size: 25, centerSize: 5, centerColor: '#ffffff' },
    { id: 7, name: 'Cherry Blossom', color: '#ffcccc', petalCount: 5, petalShape: 'round', size: 15, centerSize: 5, centerColor: '#ffcc00' },
    { id: 8, name: 'Hibiscus', color: '#ff3333', petalCount: 5, petalShape: 'oval', size: 30, centerSize: 10, centerColor: '#ffcc00' }
  ];

  vases: VaseType[] = [
    { id: 1, name: 'Classic Vase', color: '#6699cc', shape: 'classic', selected: false },
    { id: 2, name: 'Modern Vase', color: '#333333', shape: 'modern', selected: false },
    { id: 3, name: 'Glass Bowl', color: '#99ccff', shape: 'bowl', selected: false }
  ];

  bouquetFlowers: FlowerInstance[] = [];
  selectedVase: VaseType | null = null;
  maxBouquetSize: number = 15;
  score: number = 0;
  gameComplete: boolean = false;
  bouquetName: string = '';
  savedBouquets: { name: string, flowers: FlowerInstance[], vase: VaseType }[] = [];
  
  ngOnInit(): void {
    // Initialize any data that doesn't require DOM elements
  }
  
  ngAfterViewInit(): void {
    // Initialize the canvases
    this.flowerCtx = this.flowerCanvas.nativeElement.getContext('2d')!;
    this.bouquetCtx = this.bouquetCanvas.nativeElement.getContext('2d')!;
    
    // Draw the flower selection canvas
    this.drawFlowerSelectionCanvas();
    
    // Add mouse event listeners for dragging
    this.bouquetCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.bouquetCanvas.nativeElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.bouquetCanvas.nativeElement.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.bouquetCanvas.nativeElement.addEventListener('mouseleave', this.handleMouseUp.bind(this));
  }
  
  drawFlowerSelectionCanvas(): void {
    // Clear the canvas
    this.flowerCtx.clearRect(0, 0, this.flowerCanvas.nativeElement.width, this.flowerCanvas.nativeElement.height);
    
    // Calculate how many flowers per row
    const flowerSize = 80; // Size of each flower cell
    const padding = 10;
    const flowersPerRow = Math.floor(this.flowerCanvas.nativeElement.width / flowerSize);
    
    // Draw each flower type
    this.flowerTypes.forEach((flower, index) => {
      const row = Math.floor(index / flowersPerRow);
      const col = index % flowersPerRow;
      const x = col * flowerSize + flowerSize / 2;
      const y = row * flowerSize + flowerSize / 2;
      
      // Draw the flower
      this.drawFlower(this.flowerCtx, x, y, flower, 0.7);
      
      // Draw the name below the flower
      this.flowerCtx.fillStyle = 'black';
      this.flowerCtx.font = '12px Arial';
      this.flowerCtx.textAlign = 'center';
      this.flowerCtx.fillText(flower.name, x, y + flower.size * 0.7 + 15);
    });
  }
  
  drawBouquetCanvas(): void {
    // Clear the canvas
    this.bouquetCtx.clearRect(0, 0, this.bouquetCanvas.nativeElement.width, this.bouquetCanvas.nativeElement.height);
    
    // Create a layered approach for proper rendering order
    
    // LAYER 1: Draw stems first (so they appear behind everything)
    if (this.selectedVase && this.bouquetFlowers.length > 0) {
      const vasePosition = {
        x: this.bouquetCanvas.nativeElement.width / 2,
        y: this.bouquetCanvas.nativeElement.height - 60
      };
      
      this.bouquetFlowers.forEach(flower => {
        this.drawStem(this.bouquetCtx, flower, vasePosition);
      });
    }
    
    // LAYER 2: Draw the vase over the stems
    let vasePosition;
    if (this.selectedVase) {
      vasePosition = this.drawVase(this.bouquetCtx, this.selectedVase);
    }
    
    // LAYER 3: Draw flowers last (they appear on top of everything)
    this.bouquetFlowers.forEach(flower => {
      this.drawFlower(this.bouquetCtx, flower.x, flower.y, flower.type, flower.scale, flower.rotation);
    });
  }
  
  drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, flowerType: FlowerType, scale: number = 1, rotation: number = 0): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    
    // Remove the glow effect
    // ctx.shadowBlur = 15;
    // ctx.shadowColor = flowerType.color;
    // ctx.shadowOffsetX = 0;
    // ctx.shadowOffsetY = 0;
    
    // Draw flower based on its type name
    switch (flowerType.name) {
      case 'Rose':
        this.drawRose(ctx, flowerType);
        break;
      case 'Tulip':
        this.drawTulip(ctx, flowerType);
        break;
      case 'Sunflower':
        this.drawSunflower(ctx, flowerType);
        break;
      case 'Daisy':
        this.drawDaisy(ctx, flowerType);
        break;
      case 'Lily':
        this.drawLily(ctx, flowerType);
        break;
      case 'Orchid':
        this.drawOrchid(ctx, flowerType);
        break;
      case 'Cherry Blossom':
        this.drawCherryBlossom(ctx, flowerType);
        break;
      case 'Hibiscus':
        this.drawHibiscus(ctx, flowerType);
        break;
      default:
        this.drawGenericFlower(ctx, flowerType);
        break;
    }
    
    ctx.restore();
  }
  
  // Draw a realistic rose with layered, spiral petals
  drawRose(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = flowerType.color;
    
    // Draw multiple overlapping layers of petals in a spiral pattern
    const layers = 5;
    const petalsPerLayer = 7;
    
    for (let layer = 0; layer < layers; layer++) {
      const layerSize = size * (0.5 + layer * 0.1);
      const angleOffset = layer * (Math.PI / 12);
      
      for (let i = 0; i < petalsPerLayer; i++) {
        const angle = (i / petalsPerLayer) * Math.PI * 2 + angleOffset;
        const petalSize = layerSize * 0.7;
        
        ctx.save();
        ctx.rotate(angle);
        
        // Create petal color gradient - darker at base, lighter at tips
        const gradient = ctx.createRadialGradient(
          0, 0, 0,
          0, 0, petalSize
        );
        gradient.addColorStop(0, this.darkenColor(color, 10));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, this.lightenColor(color, 10));
        
        // Draw a rounded petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          petalSize * 0.3, -petalSize * 0.5,
          petalSize * 0.7, -petalSize * 0.9,
          petalSize, -petalSize * 0.3
        );
        ctx.bezierCurveTo(
          petalSize * 1.1, 0,
          petalSize * 0.8, petalSize * 0.5,
          0, 0
        );
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add subtle details with thin lines
        ctx.strokeStyle = this.darkenColor(color, 20);
        ctx.lineWidth = 0.2;
        ctx.stroke();
        
        ctx.restore();
      }
    }
    
    // Draw flower center
    ctx.beginPath();
    ctx.fillStyle = this.darkenColor(color, 30);
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw a realistic tulip with curved petals
  drawTulip(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = flowerType.color;
    
    // Draw the tulip's cup-like shape with 6 petals
    const petalCount = 6;
    const petalWidth = size * 0.4;
    const petalHeight = size * 0.8;
    
    // Draw inner petals first (slightly darker)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      
      ctx.save();
      ctx.rotate(angle);
      
      const innerGradient = ctx.createLinearGradient(0, 0, 0, -petalHeight);
      innerGradient.addColorStop(0, this.darkenColor(color, 20));
      innerGradient.addColorStop(0.7, this.darkenColor(color, 10));
      innerGradient.addColorStop(1, color);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        petalWidth * 0.3, -petalHeight * 0.3,
        petalWidth * 0.6, -petalHeight * 0.6,
        petalWidth * 0.5, -petalHeight
      );
      ctx.bezierCurveTo(
        petalWidth * 0.3, -petalHeight * 1.1,
        -petalWidth * 0.3, -petalHeight * 1.1,
        -petalWidth * 0.5, -petalHeight
      );
      ctx.bezierCurveTo(
        -petalWidth * 0.6, -petalHeight * 0.6,
        -petalWidth * 0.3, -petalHeight * 0.3,
        0, 0
      );
      
      ctx.fillStyle = innerGradient;
      ctx.fill();
      
      ctx.restore();
    }
    
    // Draw outer petals (slightly larger)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + (Math.PI / 3);
      
      ctx.save();
      ctx.rotate(angle);
      
      const outerGradient = ctx.createLinearGradient(0, 0, 0, -petalHeight);
      outerGradient.addColorStop(0, this.darkenColor(color, 15));
      outerGradient.addColorStop(0.6, color);
      outerGradient.addColorStop(1, this.lightenColor(color, 10));
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        petalWidth * 0.4, -petalHeight * 0.3,
        petalWidth * 0.7, -petalHeight * 0.6,
        petalWidth * 0.6, -petalHeight * 1.05
      );
      ctx.bezierCurveTo(
        petalWidth * 0.4, -petalHeight * 1.15,
        -petalWidth * 0.4, -petalHeight * 1.15,
        -petalWidth * 0.6, -petalHeight * 1.05
      );
      ctx.bezierCurveTo(
        -petalWidth * 0.7, -petalHeight * 0.6,
        -petalWidth * 0.4, -petalHeight * 0.3,
        0, 0
      );
      
      ctx.fillStyle = outerGradient;
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  // Draw a realistic sunflower with detailed center and rays
  drawSunflower(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = flowerType.color; // Bright yellow
    const centerColor = flowerType.centerColor; // Dark brown
    
    // Draw the ray petals
    const petals = 24;
    const innerRadius = size * 0.3;
    const outerRadius = size;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const angleWidth = (Math.PI * 2) / petals;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Create petal gradient
      const gradient = ctx.createLinearGradient(innerRadius, 0, outerRadius, 0);
      gradient.addColorStop(0, this.darkenColor(color, 10));
      gradient.addColorStop(0.3, color);
      gradient.addColorStop(0.9, this.lightenColor(color, 15));
      
      // Draw a pointed petal
      ctx.beginPath();
      ctx.moveTo(innerRadius, 0);
      ctx.lineTo(innerRadius + (outerRadius - innerRadius) * 0.3, -angleWidth * innerRadius * 1.2);
      ctx.lineTo(outerRadius, 0);
      ctx.lineTo(innerRadius + (outerRadius - innerRadius) * 0.3, angleWidth * innerRadius * 1.2);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add petal detail
      ctx.beginPath();
      ctx.moveTo(innerRadius, 0);
      ctx.lineTo(outerRadius, 0);
      ctx.strokeStyle = this.darkenColor(color, 20);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      ctx.restore();
    }
    
    // Draw the intricate center disk (seed pattern)
    const centerRadius = size * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerColor;
    ctx.fill();
    
    // Add spiral seed pattern to center
    const seeds = 100;
    const phyllotaxis = 0.5 + Math.sqrt(5) / 2; // Golden ratio for natural pattern
    
    for (let i = 0; i < seeds; i++) {
      const ratio = i / seeds;
      const angle = 2 * Math.PI * phyllotaxis * i;
      const distance = centerRadius * Math.sqrt(ratio);
      
      const seedX = Math.cos(angle) * distance;
      const seedY = Math.sin(angle) * distance;
      const seedSize = centerRadius * 0.08 * (1 - ratio * 0.5);
      
      ctx.beginPath();
      ctx.arc(seedX, seedY, seedSize, 0, Math.PI * 2);
      ctx.fillStyle = this.darkenColor(centerColor, 20 * ratio);
      ctx.fill();
    }
  }
  
  // Draw a realistic daisy with white petals and yellow center
  drawDaisy(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = '#ffffff'; // White petals
    const centerColor = '#ffcc00'; // Yellow center
    
    // Draw the petals - simple, elongated ovals
    const petals = 20;
    const innerRadius = size * 0.2;
    const outerRadius = size;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Create petal with subtle gradient
      const gradient = ctx.createLinearGradient(innerRadius, 0, outerRadius, 0);
      gradient.addColorStop(0, '#f0f0f0');
      gradient.addColorStop(0.7, '#ffffff');
      gradient.addColorStop(1, '#f8f8f8');
      
      // Draw oval petal
      ctx.beginPath();
      ctx.ellipse(
        innerRadius + (outerRadius - innerRadius) / 2, 0,
        (outerRadius - innerRadius) / 2, size * 0.12,
        0, 0, Math.PI * 2
      );
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add subtle pink tip to some petals
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.ellipse(
          outerRadius - size * 0.1, 0,
          size * 0.1, size * 0.08,
          0, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 200, 200, 0.3)';
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    // Draw center with detailed texture
    const centerRadius = size * 0.2;
    
    // Yellow dome center
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    
    const centerGradient = ctx.createRadialGradient(
      -centerRadius * 0.3, -centerRadius * 0.3, 0,
      0, 0, centerRadius
    );
    centerGradient.addColorStop(0, this.lightenColor(centerColor, 20));
    centerGradient.addColorStop(0.7, centerColor);
    centerGradient.addColorStop(1, this.darkenColor(centerColor, 10));
    
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    // Add texture dots to center
    const dots = 40;
    for (let i = 0; i < dots; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * centerRadius * 0.9;
      
      const dotX = Math.cos(angle) * distance;
      const dotY = Math.sin(angle) * distance;
      const dotSize = 0.5 + Math.random() * 0.5;
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = this.darkenColor(centerColor, 30);
      ctx.fill();
    }
  }
  
  // Draw a realistic lily with elegant curved petals
  drawLily(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = flowerType.color;
    
    // Draw 6 elegant, curved petals
    const petals = 6;
    const petalLength = size * 1.2;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Create petal with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, -petalLength);
      gradient.addColorStop(0, this.darkenColor(color, 10));
      gradient.addColorStop(0.6, color);
      gradient.addColorStop(0.8, this.lightenColor(color, 10));
      gradient.addColorStop(1, this.lightenColor(color, 20));
      
      // Draw curved lily petal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      // Curve the petal outward and then back inward at tip
      ctx.bezierCurveTo(
        size * 0.2, -petalLength * 0.3,
        size * 0.4, -petalLength * 0.6,
        size * 0.3, -petalLength
      );
      
      ctx.bezierCurveTo(
        size * 0.1, -petalLength * 1.05,
        -size * 0.1, -petalLength * 1.05,
        -size * 0.3, -petalLength
      );
      
      ctx.bezierCurveTo(
        -size * 0.4, -petalLength * 0.6,
        -size * 0.2, -petalLength * 0.3,
        0, 0
      );
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add stripe details to lily petals
      if (i % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.1);
        ctx.bezierCurveTo(
          size * 0.05, -petalLength * 0.4,
          size * 0.1, -petalLength * 0.7,
          0, -petalLength * 0.8
        );
        
        ctx.strokeStyle = this.darkenColor(color, 20);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add small dots along the stripe
        for (let j = 0; j < 5; j++) {
          const dotPosition = j / 4;
          const dotX = size * 0.05 * Math.sin(dotPosition * Math.PI);
          const dotY = -size * 0.1 - dotPosition * petalLength * 0.7;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
          ctx.fillStyle = this.darkenColor(color, 30);
          ctx.fill();
        }
      }
      
      ctx.restore();
    }
    
    // Draw stamen (the long filaments with anthers)
    const stamenCount = 6;
    for (let i = 0; i < stamenCount; i++) {
      const angle = (i / stamenCount) * Math.PI * 2;
      const stamenLength = size * 0.7;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Draw filament (stalk)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -stamenLength);
      ctx.strokeStyle = '#fff9e0';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw anther (pollen-bearing part at tip)
      ctx.beginPath();
      ctx.ellipse(0, -stamenLength - 3, 2, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700'; // Gold color for pollen
      ctx.fill();
      
      ctx.restore();
    }
    
    // Draw pistil in center
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = '#fcf0d0';
    ctx.fill();
  }
  
  // Draw a realistic orchid with exotic shape
  drawOrchid(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = flowerType.color;
    const secondaryColor = this.lightenColor(color, 30);
    
    // Draw background petals (3)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Background petal
      const gradient = ctx.createLinearGradient(0, 0, 0, -size);
      gradient.addColorStop(0, this.darkenColor(color, 10));
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, this.lightenColor(color, 10));
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        size * 0.2, -size * 0.3,
        size * 0.3, -size * 0.6,
        size * 0.2, -size
      );
      ctx.bezierCurveTo(
        0, -size * 1.1,
        -size * 0.2, -size * 1.1,
        -size * 0.2, -size
      );
      ctx.bezierCurveTo(
        -size * 0.3, -size * 0.6,
        -size * 0.2, -size * 0.3,
        0, 0
      );
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.restore();
    }
    
    // Draw the distinctive orchid labellum (lower lip)
    ctx.save();
    ctx.rotate(Math.PI); // Position at bottom
    
    // Draw the pouch-like labellum
    const labellumGradient = ctx.createLinearGradient(0, 0, 0, -size * 1.2);
    labellumGradient.addColorStop(0, this.darkenColor(color, 5));
    labellumGradient.addColorStop(0.5, color);
    labellumGradient.addColorStop(0.9, secondaryColor);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Create ruffled edge shape
    ctx.bezierCurveTo(
      size * 0.3, -size * 0.1,
      size * 0.5, -size * 0.3,
      size * 0.3, -size * 0.6
    );
    ctx.bezierCurveTo(
      size * 0.2, -size * 0.9,
      -size * 0.2, -size * 0.9,
      -size * 0.3, -size * 0.6
    );
    ctx.bezierCurveTo(
      -size * 0.5, -size * 0.3,
      -size * 0.3, -size * 0.1,
      0, 0
    );
    
    ctx.fillStyle = labellumGradient;
    ctx.fill();
    
    // Add decorative spots to the labellum
    const spots = 8;
    for (let i = 0; i < spots; i++) {
      const spotX = (Math.random() - 0.5) * size * 0.4;
      const spotY = -size * (0.3 + Math.random() * 0.3);
      const spotSize = 2 + Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
      ctx.fillStyle = this.darkenColor(color, 40);
      ctx.fill();
    }
    
    ctx.restore();
    
    // Draw the column (central reproductive structure)
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#f8f8f0';
    ctx.fill();
    
    // Add anther cap
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8d0';
    ctx.fill();
  }
  
  // Draw a delicate cherry blossom with 5 rounded petals
  drawCherryBlossom(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = flowerType.color; // Light pink
    
    // Draw 5 rounded, slightly overlapping petals
    const petals = 5;
    const petalSize = size * 0.7;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Create petal gradient from center to edge
      const gradient = ctx.createRadialGradient(
        size * 0.2, 0, 0,
        size * 0.2, 0, petalSize
      );
      gradient.addColorStop(0, this.darkenColor(color, 5));
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, this.lightenColor(color, 10));
      
      // Draw heart-shaped petal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      // Create the rounded petal shape
      ctx.bezierCurveTo(
        petalSize * 0.1, -petalSize * 0.2,
        petalSize * 0.3, -petalSize * 0.5,
        petalSize * 0.5, -petalSize * 0.2
      );
      ctx.bezierCurveTo(
        petalSize * 0.6, 0,
        petalSize * 0.5, petalSize * 0.3,
        0, 0
      );
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add subtle vein in center of petal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        petalSize * 0.2, -petalSize * 0.1,
        petalSize * 0.3, -petalSize * 0.2,
        petalSize * 0.4, -petalSize * 0.1
      );
      
      ctx.strokeStyle = this.darkenColor(color, 15);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      ctx.restore();
    }
    
    // Draw small yellow center with gradient
    const centerRadius = size * 0.15;
    
    const centerGradient = ctx.createRadialGradient(
      0, 0, 0,
      0, 0, centerRadius
    );
    centerGradient.addColorStop(0, '#ffffc0');
    centerGradient.addColorStop(0.7, '#ffcc00');
    centerGradient.addColorStop(1, '#eeb000');
    
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    // Add small stamens
    const stamenCount = 5;
    for (let i = 0; i < stamenCount; i++) {
      const angle = (i / stamenCount) * Math.PI * 2;
      const stamenLength = centerRadius * 0.8;
      
      const stamenX = Math.cos(angle) * centerRadius * 0.5;
      const stamenY = Math.sin(angle) * centerRadius * 0.5;
      
      ctx.beginPath();
      ctx.moveTo(stamenX, stamenY);
      ctx.lineTo(
        stamenX + Math.cos(angle) * stamenLength,
        stamenY + Math.sin(angle) * stamenLength
      );
      
      ctx.strokeStyle = '#d04000';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      // Add small anther at tip
      ctx.beginPath();
      ctx.arc(
        stamenX + Math.cos(angle) * stamenLength,
        stamenY + Math.sin(angle) * stamenLength,
        1, 0, Math.PI * 2
      );
      ctx.fillStyle = '#d04000';
      ctx.fill();
    }
  }
  
  // Draw a realistic hibiscus with distinctive shape
  drawHibiscus(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = flowerType.color; // Vibrant red
    
    // Draw 5 large, slightly overlapping petals
    const petals = 5;
    const petalSize = size * 1.2;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Create petal gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, -petalSize);
      gradient.addColorStop(0, this.darkenColor(color, 20));
      gradient.addColorStop(0.4, color);
      gradient.addColorStop(0.8, this.lightenColor(color, 15));
      
      // Draw hibiscus petal with wavy edges
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      // Create the main petal shape
      ctx.bezierCurveTo(
        size * 0.1, -size * 0.3,
        size * 0.3, -size * 0.6,
        size * 0.4, -petalSize * 0.8
      );
      
      // Create wavy edge at tip
      ctx.bezierCurveTo(
        size * 0.42, -petalSize * 0.85,
        size * 0.38, -petalSize * 0.9,
        size * 0.4, -petalSize * 0.95
      );
      ctx.bezierCurveTo(
        size * 0.42, -petalSize,
        size * 0.35, -petalSize,
        size * 0.3, -petalSize * 0.95
      );
      
      // Continue the petal edge
      ctx.bezierCurveTo(
        size * 0.2, -petalSize * 0.9,
        size * 0.1, -petalSize * 0.8,
        0, -petalSize * 0.7
      );
      ctx.bezierCurveTo(
        -size * 0.1, -petalSize * 0.8,
        -size * 0.2, -petalSize * 0.9,
        -size * 0.3, -petalSize * 0.95
      );
      
      // Mirror the wavy tip on other side
      ctx.bezierCurveTo(
        -size * 0.35, -petalSize,
        -size * 0.42, -petalSize,
        -size * 0.4, -petalSize * 0.95
      );
      ctx.bezierCurveTo(
        -size * 0.38, -petalSize * 0.9,
        -size * 0.42, -petalSize * 0.85,
        -size * 0.4, -petalSize * 0.8
      );
      
      // Complete the petal shape
      ctx.bezierCurveTo(
        -size * 0.3, -size * 0.6,
        -size * 0.1, -size * 0.3,
        0, 0
      );
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add veins to petals
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        0, -size * 0.3,
        0, -size * 0.6,
        0, -petalSize * 0.8
      );
      
      ctx.strokeStyle = this.darkenColor(color, 30);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      // Add side veins
      for (let j = 1; j <= 3; j++) {
        const veinY = -size * (0.2 * j);
        
        ctx.beginPath();
        ctx.moveTo(0, veinY);
        ctx.bezierCurveTo(
          size * 0.1, veinY - size * 0.05,
          size * 0.2, veinY - size * 0.03,
          size * 0.3, veinY
        );
        
        ctx.strokeStyle = this.darkenColor(color, 25);
        ctx.lineWidth = 0.3;
        ctx.stroke();
        
        // Mirror on other side
        ctx.beginPath();
        ctx.moveTo(0, veinY);
        ctx.bezierCurveTo(
          -size * 0.1, veinY - size * 0.05,
          -size * 0.2, veinY - size * 0.03,
          -size * 0.3, veinY
        );
        
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Draw the distinctive long stamen column
    const columnLength = size * 1.3;
    const columnWidth = size * 0.05;
    
    // Draw the long, thin column
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -columnLength);
    ctx.strokeStyle = this.darkenColor(color, 10);
    ctx.lineWidth = columnWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw anthers (pollen sacs at tip)
    const antherCount = 5;
    const antherSize = size * 0.08;
    
    for (let i = 0; i < antherCount; i++) {
      const angle = (i / antherCount) * Math.PI * 2;
      
      const antherX = Math.cos(angle) * columnWidth;
      const antherY = -columnLength + Math.sin(angle) * columnWidth;
      
      ctx.beginPath();
      ctx.arc(antherX, antherY, antherSize, 0, Math.PI * 2);
      ctx.fillStyle = '#b00000';
      ctx.fill();
      
      // Add pollen texture
      for (let j = 0; j < 5; j++) {
        const dotAngle = Math.random() * Math.PI * 2;
        const dotDist = Math.random() * antherSize * 0.7;
        
        ctx.beginPath();
        ctx.arc(
          antherX + Math.cos(dotAngle) * dotDist,
          antherY + Math.sin(dotAngle) * dotDist,
          0.7, 0, Math.PI * 2
        );
        ctx.fillStyle = '#ffcc00';
        ctx.fill();
      }
    }
    
    // Draw the stigma at the very tip
    ctx.beginPath();
    ctx.arc(0, -columnLength - antherSize, antherSize * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#d00000';
    ctx.fill();
  }
  
  // Generic flower drawing as fallback
  drawGenericFlower(ctx: CanvasRenderingContext2D, flowerType: FlowerType): void {
    const size = flowerType.size;
    const color = flowerType.color;
    const angleStep = (Math.PI * 2) / flowerType.petalCount;
    
    // Draw petals
    for (let i = 0; i < flowerType.petalCount; i++) {
      ctx.save();
      ctx.rotate(i * angleStep);
      
      // Draw petal based on shape
      ctx.beginPath();
      switch (flowerType.petalShape) {
        case 'round':
          ctx.ellipse(flowerType.size / 2, 0, flowerType.size / 3, flowerType.size / 2, 0, 0, Math.PI * 2);
          break;
        case 'pointed':
          ctx.moveTo(0, 0);
          ctx.lineTo(flowerType.size / 3, -flowerType.size / 4);
          ctx.lineTo(flowerType.size, 0);
          ctx.lineTo(flowerType.size / 3, flowerType.size / 4);
          break;
        case 'oval':
          ctx.ellipse(flowerType.size / 2, 0, flowerType.size / 2, flowerType.size / 4, 0, 0, Math.PI * 2);
          break;
      }
      ctx.closePath();
      
      // Create gradient fills for more realistic petals
      const gradient = ctx.createRadialGradient(
        flowerType.size / 2, 0, 0,
        flowerType.size / 2, 0, flowerType.size / 2
      );
      gradient.addColorStop(0, this.lightenColor(color, 30));
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, this.darkenColor(color, 20));
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add subtle petal details with thin lines
      ctx.strokeStyle = this.darkenColor(color, 10);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      ctx.restore();
    }
    
    // Draw flower center with gradient for depth
    ctx.shadowBlur = 5; // Reduce shadow for center
    ctx.beginPath();
    const centerGradient = ctx.createRadialGradient(
      0, 0, 0,
      0, 0, flowerType.centerSize
    );
    centerGradient.addColorStop(0, this.lightenColor(flowerType.centerColor, 20));
    centerGradient.addColorStop(0.5, flowerType.centerColor);
    centerGradient.addColorStop(1, this.darkenColor(flowerType.centerColor, 30));
    ctx.fillStyle = centerGradient;
    ctx.arc(0, 0, flowerType.centerSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Add texture to center with small dots
    ctx.fillStyle = this.darkenColor(flowerType.centerColor, 40);
    const dotCount = Math.floor(flowerType.centerSize * 2);
    for (let i = 0; i < dotCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (flowerType.centerSize * 0.8);
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        0.5,
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }
  
  // Helper functions for color manipulation
  private lightenColor(color: string, percent: number): string {
    return this.adjustColor(color, percent);
  }
  
  private darkenColor(color: string, percent: number): string {
    return this.adjustColor(color, -percent);
  }
  
  private adjustColor(color: string, percent: number): string {
    // Convert hex to rgb
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    
    // Adjust rgb values
    r = Math.min(255, Math.max(0, r + Math.floor(percent * 2.55)));
    g = Math.min(255, Math.max(0, g + Math.floor(percent * 2.55)));
    b = Math.min(255, Math.max(0, b + Math.floor(percent * 2.55)));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  drawVase(ctx: CanvasRenderingContext2D, vase: VaseType): {x: number, y: number} {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const vaseWidth = 80;
    const vaseHeight = 120;
    const x = canvasWidth / 2;
    const y = canvasHeight - vaseHeight / 2;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Draw vase based on shape
    ctx.fillStyle = vase.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    switch (vase.shape) {
      case 'classic':
        // Classic vase shape
        ctx.beginPath();
        ctx.moveTo(-vaseWidth / 3, -vaseHeight / 2);
        ctx.bezierCurveTo(
          -vaseWidth / 2, -vaseHeight / 3,
          -vaseWidth / 2, vaseHeight / 3,
          -vaseWidth / 4, vaseHeight / 2
        );
        ctx.lineTo(vaseWidth / 4, vaseHeight / 2);
        ctx.bezierCurveTo(
          vaseWidth / 2, vaseHeight / 3,
          vaseWidth / 2, -vaseHeight / 3,
          vaseWidth / 3, -vaseHeight / 2
        );
        ctx.closePath();
        break;
      case 'modern':
        // Modern vase shape
        ctx.beginPath();
        ctx.moveTo(-vaseWidth / 4, -vaseHeight / 2);
        ctx.lineTo(-vaseWidth / 3, vaseHeight / 2);
        ctx.lineTo(vaseWidth / 3, vaseHeight / 2);
        ctx.lineTo(vaseWidth / 4, -vaseHeight / 2);
        ctx.closePath();
        break;
      case 'bowl':
        // Bowl shape
        ctx.beginPath();
        ctx.ellipse(0, 0, vaseWidth / 2, vaseHeight / 3, 0, 0, Math.PI * 2);
        ctx.closePath();
        break;
    }
    
    ctx.fill();
    ctx.stroke();
    
    // Add some highlight/reflection
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (vase.shape === 'bowl') {
      ctx.ellipse(-vaseWidth / 6, -vaseHeight / 10, vaseWidth / 6, vaseHeight / 8, Math.PI / 4, 0, Math.PI * 2);
    } else {
      ctx.ellipse(-vaseWidth / 6, -vaseHeight / 4, vaseWidth / 10, vaseHeight / 6, Math.PI / 4, 0, Math.PI * 2);
    }
    ctx.fill();
    
    ctx.restore();
    
    return {x, y};
  }
  
  drawStem(ctx: CanvasRenderingContext2D, flower: FlowerInstance, vasePosition: {x: number, y: number}): void {
    // Enhanced stem coloring with gradient for more realism
    const stemBaseColor = '#2e8b57'; // Sea green base color
    if (!flower.stemColor) {
      // Slightly randomize stem color for variety
      const hueShift = Math.random() * 20 - 10; // -10 to +10 hue variation
      flower.stemColor = this.adjustHue(stemBaseColor, hueShift);
    }
    if (!flower.stemThickness) {
      flower.stemThickness = 2.5 + Math.random() * 3; // Random thickness between 2.5-5.5px
    }
    
    const startX = flower.x;
    const startY = flower.y;
    const endX = vasePosition.x + (Math.random() * 40 - 20); // Random point near vase center
    const endY = vasePosition.y - 40; // Slightly above the vase center
    
    // Create a curved path for the stem
    const path = this.createNaturalStemPath(startX, startY, endX, endY);
    
    // Apply a slight shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Draw the main stem with gradient for more depth
    const stemGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    stemGradient.addColorStop(0, this.lightenColor(flower.stemColor, 10));
    stemGradient.addColorStop(0.5, flower.stemColor);
    stemGradient.addColorStop(1, this.darkenColor(flower.stemColor, 15));
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    
    ctx.strokeStyle = stemGradient;
    ctx.lineWidth = flower.stemThickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Reset shadow for leaves
    ctx.shadowColor = 'transparent';
    
    // Add leaves (1-3 leaves per stem)
    const leafCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < leafCount; i++) {
      // Position leaves at different points along the stem
      const leafPosition = 0.3 + (i * 0.25); // Distribute leaves along stem
      const pathIndex = Math.floor(path.length * leafPosition);
      if (pathIndex < path.length) {
        const leafPointX = path[pathIndex].x;
        const leafPointY = path[pathIndex].y;
        
        // Draw more detailed, realistic leaf
        this.drawDetailedLeaf(ctx, leafPointX, leafPointY, flower.stemColor);
      }
    }
  }
  
  // Create a natural-looking path for the stem with slight variations
  createNaturalStemPath(startX: number, startY: number, endX: number, endY: number): {x: number, y: number}[] {
    const path: {x: number, y: number}[] = [];
    const segments = 12; // More segments for smoother curve
    
    // Create control points with slight random variations
    const controlPoint1X = startX + (endX - startX) * (0.2 + Math.random() * 0.2);
    const controlPoint1Y = startY + (endY - startY) * (0.3 + Math.random() * 0.2);
    const controlPoint2X = startX + (endX - startX) * (0.6 + Math.random() * 0.2);
    const controlPoint2Y = startY + (endY - startY) * (0.7 + Math.random() * 0.2);
    
    // Create points along the Bezier curve
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // Cubic Bezier formula
      const x = Math.pow(1-t, 3) * startX + 
                3 * Math.pow(1-t, 2) * t * controlPoint1X + 
                3 * (1-t) * Math.pow(t, 2) * controlPoint2X + 
                Math.pow(t, 3) * endX;
      
      const y = Math.pow(1-t, 3) * startY + 
                3 * Math.pow(1-t, 2) * t * controlPoint1Y + 
                3 * (1-t) * Math.pow(t, 2) * controlPoint2Y + 
                Math.pow(t, 3) * endY;
      
      // Add a slight natural waviness to the stem
      const waviness = Math.sin(t * Math.PI * 2) * (2 + Math.random() * 2);
      
      path.push({
        x: x + waviness,
        y: y
      });
    }
    
    return path;
  }
  
  // Draw a more detailed, realistic leaf
  drawDetailedLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, stemColor: string): void {
    const leafSize = 8 + Math.random() * 10; // Random size between 8-18px
    const angle = Math.random() * Math.PI * 2; // Random angle
    
    // Calculate leaf direction - tend to grow outward from stem
    const stemDirection = Math.atan2(y - this.bouquetCanvas.nativeElement.height, x - this.bouquetCanvas.nativeElement.width/2);
    const leafAngle = stemDirection + (Math.random() * Math.PI/2 - Math.PI/4);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(leafAngle);
    
    // Create leaf gradient for more realistic coloring
    const leafGradient = ctx.createLinearGradient(-leafSize, 0, leafSize, 0);
    const leafColor = this.adjustHue(stemColor, 10); // Slightly different hue from stem
    leafGradient.addColorStop(0, this.lightenColor(leafColor, 20));
    leafGradient.addColorStop(0.5, this.darkenColor(leafColor, 10));
    leafGradient.addColorStop(1, this.darkenColor(leafColor, 25));
    
    // Draw leaf shape
    ctx.beginPath();
    
    // Start at the stem connection point
    ctx.moveTo(0, 0);
    
    // Draw the top edge of the leaf with a curve
    ctx.bezierCurveTo(
      leafSize * 0.3, -leafSize * 0.1,
      leafSize * 0.7, -leafSize * 0.2,
      leafSize, 0
    );
    
    // Draw the bottom edge with a different curve for asymmetry
    ctx.bezierCurveTo(
      leafSize * 0.7, leafSize * 0.3,
      leafSize * 0.3, leafSize * 0.2,
      0, 0
    );
    
    // Fill with gradient
    ctx.fillStyle = leafGradient;
    ctx.fill();
    
    // Draw leaf veins
    ctx.strokeStyle = this.darkenColor(leafColor, 30);
    ctx.lineWidth = 0.5;
    
    // Main vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(leafSize * 0.9, 0);
    ctx.stroke();
    
    // Secondary veins
    const veins = 3 + Math.floor(Math.random() * 3); // 3-5 veins
    for (let i = 1; i <= veins; i++) {
      const veinPosition = leafSize * (i / (veins + 1));
      const veinHeight = leafSize * 0.15 * (1 - i/(veins+1)); // Veins get smaller toward the tip
      
      ctx.beginPath();
      ctx.moveTo(veinPosition, 0);
      ctx.lineTo(veinPosition - leafSize * 0.05, -veinHeight);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(veinPosition, 0);
      ctx.lineTo(veinPosition - leafSize * 0.05, veinHeight);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Adjust hue of a color
  adjustHue(hexColor: string, degrees: number): string {
    // Convert hex to HSL
    let r = parseInt(hexColor.substring(1, 3), 16) / 255;
    let g = parseInt(hexColor.substring(3, 5), 16) / 255;
    let b = parseInt(hexColor.substring(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    // Adjust hue
    h = (h * 360 + degrees) % 360;
    if (h < 0) h += 360;
    h /= 360;
    
    // Convert back to RGB
    let r1, g1, b1;
    
    if (s === 0) {
      r1 = g1 = b1 = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r1 = this.hueToRgb(p, q, h + 1/3);
      g1 = this.hueToRgb(p, q, h);
      b1 = this.hueToRgb(p, q, h - 1/3);
    }
    
    // Convert to hex
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
  }
  
  hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  
  onFlowerCanvasClick(event: MouseEvent): void {
    if (this.bouquetFlowers.length >= this.maxBouquetSize || this.gameComplete) {
      return;
    }
    
    const canvas = this.flowerCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate the clicked flower
    const flowerSize = 80;
    const flowersPerRow = Math.floor(canvas.width / flowerSize);
    
    const col = Math.floor(x / flowerSize);
    const row = Math.floor(y / flowerSize);
    
    const index = row * flowersPerRow + col;
    
    if (index >= 0 && index < this.flowerTypes.length) {
      this.addFlowerToBouquet(this.flowerTypes[index]);
    }
  }
  
  onBouquetCanvasClick(event: MouseEvent): void {
    if (this.gameComplete) return;
    
    const canvas = this.bouquetCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if a flower was clicked
    for (let i = this.bouquetFlowers.length - 1; i >= 0; i--) {
      const flower = this.bouquetFlowers[i];
      const dx = flower.x - x;
      const dy = flower.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < flower.type.size * flower.scale / 2) {
        // Remove the flower
        this.bouquetFlowers.splice(i, 1);
        this.drawBouquetCanvas();
        this.updateScore();
        return;
      }
    }
  }
  
  addFlowerToBouquet(flowerType: FlowerType): void {
    if (this.bouquetFlowers.length >= this.maxBouquetSize) return;
    
    const canvas = this.bouquetCanvas.nativeElement;
    
    // Calculate a position for the flower in the bouquet
    // We'll position flowers in an arc pattern above the vase
    const baseX = canvas.width / 2;
    const baseY = canvas.height - 150;
    
    // Add some randomization to flower placement
    const angle = Math.random() * Math.PI;
    const distance = Math.random() * 100 + 20;
    
    const x = baseX + Math.cos(angle) * distance;
    const y = baseY - Math.sin(angle) * distance - (this.bouquetFlowers.length * 5);
    
    // Randomize rotation and scale
    const rotation = Math.random() * Math.PI / 4 - Math.PI / 8;
    const scale = Math.random() * 0.3 + 0.8;
    
    // Add the flower to the bouquet
    this.bouquetFlowers.push({
      type: flowerType,
      x,
      y,
      rotation,
      scale
    });
    
    // Redraw the bouquet
    this.drawBouquetCanvas();
    this.updateScore();
  }
  
  selectVase(vase: VaseType): void {
    if (this.gameComplete) return;
    
    this.vases.forEach(v => v.selected = false);
    vase.selected = true;
    this.selectedVase = vase;
    
    // Redraw the bouquet
    this.drawBouquetCanvas();
    this.updateScore();
  }
  
  updateScore(): void {
    this.score = 0;
    
    // Base points for each flower
    this.score += this.bouquetFlowers.length * 10;
    
    // Bonus for having a vase
    if (this.selectedVase) {
      this.score += 20;
    }
    
    // Color variety bonus
    const uniqueColors = new Set(this.bouquetFlowers.map(f => f.type.color));
    if (uniqueColors.size >= 3) {
      this.score += 15;
    }
    
    // Full bouquet bonus
    if (this.bouquetFlowers.length === this.maxBouquetSize) {
      this.score += 25;
    }
  }
  
  saveBouquet(): void {
    if (this.bouquetFlowers.length > 0 && this.selectedVase && this.bouquetName.trim()) {
      // Deep copy the bouquet to save it
      this.savedBouquets.push({
        name: this.bouquetName,
        flowers: JSON.parse(JSON.stringify(this.bouquetFlowers)),
        vase: { ...this.selectedVase }
      });
      
      // Reset the game
      this.resetGame();
    }
  }
  
  resetGame(): void {
    this.bouquetFlowers = [];
    this.vases.forEach(v => v.selected = false);
    this.selectedVase = null;
    this.score = 0;
    this.gameComplete = false;
    this.bouquetName = '';
    
    // Redraw the bouquet canvas
    this.drawBouquetCanvas();
  }
  
  handleMouseDown(event: MouseEvent): void {
    if (this.gameComplete) return;
    
    const canvas = this.bouquetCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if a flower was clicked
    for (let i = this.bouquetFlowers.length - 1; i >= 0; i--) {
      const flower = this.bouquetFlowers[i];
      const dx = flower.x - x;
      const dy = flower.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < flower.type.size * flower.scale / 2) {
        // Start dragging this flower
        this.isDragging = true;
        this.draggedFlowerIndex = i;
        this.dragStartX = x;
        this.dragStartY = y;
        return;
      }
    }
  }
  
  handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.draggedFlowerIndex === -1) return;
    
    const canvas = this.bouquetCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const dx = x - this.dragStartX;
    const dy = y - this.dragStartY;
    
    // Update the flower position
    const flower = this.bouquetFlowers[this.draggedFlowerIndex];
    flower.x += dx;
    flower.y += dy;
    
    // Limit the dragging area to keep flowers within canvas
    flower.x = Math.max(flower.type.size * flower.scale / 2, Math.min(flower.x, canvas.width - flower.type.size * flower.scale / 2));
    flower.y = Math.max(flower.type.size * flower.scale / 2, Math.min(flower.y, canvas.height - 150)); // Keep above vase
    
    // Update drag start position
    this.dragStartX = x;
    this.dragStartY = y;
    
    // Redraw the bouquet
    this.drawBouquetCanvas();
  }
  
  handleMouseUp(): void {
    this.isDragging = false;
    this.draggedFlowerIndex = -1;
  }
}
