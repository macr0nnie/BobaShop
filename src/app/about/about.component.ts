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
  maxBouquetSize: number = 10;
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
    
    // Draw the vase if selected
    if (this.selectedVase) {
      const vasePosition = this.drawVase(this.bouquetCtx, this.selectedVase);
      
      // Draw stems first (so they appear behind the flowers)
      if (this.bouquetFlowers.length > 0) {
        this.bouquetFlowers.forEach(flower => {
          this.drawStem(this.bouquetCtx, flower, vasePosition);
        });
      }
    }
    
    // Draw each flower in the bouquet
    this.bouquetFlowers.forEach(flower => {
      this.drawFlower(this.bouquetCtx, flower.x, flower.y, flower.type, flower.scale, flower.rotation);
    });
  }
  
  drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, flowerType: FlowerType, scale: number = 1, rotation: number = 0): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    
    // Draw petals
    ctx.fillStyle = flowerType.color;
    const angleStep = (Math.PI * 2) / flowerType.petalCount;
    
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
      ctx.fill();
      ctx.restore();
    }
    
    // Draw flower center
    ctx.beginPath();
    ctx.fillStyle = flowerType.centerColor;
    ctx.arc(0, 0, flowerType.centerSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
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
    // Set default stem properties if not already set
    if (!flower.stemColor) flower.stemColor = '#2e8b57'; // Sea green color
    if (!flower.stemThickness) flower.stemThickness = 2 + Math.random() * 2; // Random thickness between 2-4px
    
    const startX = flower.x;
    const startY = flower.y;
    const endX = vasePosition.x + (Math.random() * 40 - 20); // Random point near vase center
    const endY = vasePosition.y - 40; // Slightly above the vase center
    
    // Draw curved stem
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Control points for the curve
    const controlPoint1X = startX + (endX - startX) * 0.3;
    const controlPoint1Y = startY + (endY - startY) * 0.3;
    const controlPoint2X = startX + (endX - startX) * 0.7;
    const controlPoint2Y = startY + (endY - startY) * 0.7;
    
    ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
    
    ctx.strokeStyle = flower.stemColor;
    ctx.lineWidth = flower.stemThickness;
    ctx.stroke();
    
    // Add a small leaf to some stems (randomly)
    if (Math.random() > 0.5) {
      const leafX = controlPoint1X;
      const leafY = controlPoint1Y;
      const leafSize = 5 + Math.random() * 5;
      
      ctx.beginPath();
      ctx.fillStyle = '#3cb371'; // Medium sea green
      ctx.ellipse(
        leafX + (Math.random() * 10 - 5),
        leafY + (Math.random() * 10 - 5),
        leafSize,
        leafSize / 2,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
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
