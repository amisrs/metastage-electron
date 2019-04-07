import { Component, OnInit, ElementRef, ViewChild, Input, HostListener } from '@angular/core';
import { fromEvent } from "rxjs";
import { Observable } from "rxjs";
import { Subscription } from "rxjs";
import { StageModel } from '../StageModel';

// https://stackoverflow.com/questions/47371623/html-infinite-pan-able-canvas
@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.css']
})
export class WorldMapComponent implements OnInit {

  // resizeObservable: Observable<Event>
  // resizeSubscription: Subscription

  @Input() divElement: ElementRef;

  @Input() divHeight: number;
  @Input() divWidth: number;
  

  @Input() topPosition: number;
  @Input() leftPosition: number;

  mouseHeld: boolean;
  selectedBox: Stage;

  // where did you click the box in relation to its center
  selectOffsetX: number;
  selectOffsetY: number;

  panX: number = 0;
  panY: number = 0;

  mouseX: number;
  mouseY: number;
  oldMouseX: number;
  oldMouseY: number;
  
  gridSize: number = 10;

  ctx: CanvasRenderingContext2D;
  boxArray: Stage[] = [];
  @ViewChild("map") canvas: ElementRef;
  bounds: ClientRect;

  @ViewChild("grid") gridCanvas: ElementRef;
  gridCtx: CanvasRenderingContext2D;

  @Input() 
  set addStage (addStage: StageModel) {
    alert(`Adding ${addStage.filename}`);
    this.boxArray.push(new Stage(0, 0, 200, 200, addStage));

  }

  draw = () => {
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.0)";
    this.gridCtx.fillStyle = "gray";
    this.ctx.fillRect(0,0, this.canvas.nativeElement.offsetWidth, this.canvas.nativeElement.offsetHeight);
    this.gridCtx.fillRect(0,0, this.gridCanvas.nativeElement.offsetWidth, this.gridCanvas.nativeElement.offsetHeight);
    this.canvas.nativeElement.setAttribute('width', this.divWidth);
    this.canvas.nativeElement.setAttribute('height', this.divHeight);
    this.gridCanvas.nativeElement.setAttribute('width', this.divWidth);
    this.gridCanvas.nativeElement.setAttribute('height', this.divHeight);


    let mapStyle: string = `top: ${this.topPosition}px; left: ${this.leftPosition}px; z-index: 1;`;
    let gridStyle: string = `top: ${this.topPosition}px; left: ${this.leftPosition}px; z-index: 0;`;
    this.gridCanvas.nativeElement.setAttribute('style', gridStyle);
    this.canvas.nativeElement.setAttribute('style', mapStyle);


    var box = null;
    var xMin = 0;
    var xMax = 0;
    var yMin = 0;
    var yMax = 0;

    for(var w = 0; w < this.gridCanvas.nativeElement.offsetWidth; w += this.gridSize) {
      this.gridCtx.beginPath();
      this.gridCtx.lineWidth = 0.5;
      this.gridCtx.moveTo(w - this.panX, 0 - this.panY);
      this.gridCtx.lineTo(w - this.panX, this.gridCanvas.nativeElement.offsetHeight - this.panY);
      this.gridCtx.stroke();
    }

    for(var h = 0; h < this.gridCanvas.nativeElement.offsetHeight; h += this.gridSize) {
      this.gridCtx.beginPath();
      this.gridCtx.lineWidth = 0.5;
      this.gridCtx.moveTo(0 - this.panX, h - this.panY);
      this.gridCtx.lineTo(this.gridCanvas.nativeElement.offsetWidth - this.panX, h - this.panY);
      this.gridCtx.stroke();
    }

    for (var i = 0; i < this.boxArray.length; ++i) {
      box = this.boxArray[i];
      
      
      xMin = box.x - this.panX;
      xMax = box.x + box.width - this.panX;
      yMin = box.y - this.panY;
      yMax = box.y + box.height - this.panY;
      // if box is within vision, draw it
      if (xMax > 0 && xMin < this.canvas.nativeElement.offsetWidth && yMax > 0 && yMin < this.canvas.nativeElement.offsetHeight) {
        this.ctx.fillStyle = "black";
        box.draw(this.ctx, this.panX, this.panY);
      }
    }
  }

  onMouseDown(e: MouseEvent) {
    this.mouseHeld = true;
    console.log(`Click point: (${this.mouseX + this.panX}, ${this.mouseY + this.panY})`);
    if (!this.selectedBox) {
      for (var i = this.boxArray.length - 1; i > -1; --i) {
        if (this.boxArray[i].isCollidingWithPoint(this.mouseX + this.panX,this.mouseY + this.panY)) {
          this.selectedBox = this.boxArray[i];
          this.selectedBox.isSelected = true;
          this.selectOffsetX = this.mouseX - this.selectedBox.x + this.panX;
          this.selectOffsetY = this.mouseY - this.selectedBox.y + this.panY; 
          requestAnimationFrame(this.draw.bind(this));
          return;
        }
      }
    }
  }

  onMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX - this.bounds.left;
    this.mouseY = e.clientY - this.bounds.top;


    if (this.mouseHeld) {
      if (!this.selectedBox) {
        this.panX += this.oldMouseX - this.mouseX;
        this.panY += this.oldMouseY - this.mouseY;
      } else {
        this.selectedBox.x = this.roundToNearest(this.mouseX - this.selectOffsetX + this.panX, this.gridSize);
        this.selectedBox.y = this.roundToNearest(this.mouseY - this.selectOffsetY + this.panY, this.gridSize);
      }
    }
    
    this.oldMouseX = this.mouseX;
    this.oldMouseY = this.mouseY;

    requestAnimationFrame(this.draw.bind(this));
  }

  onMouseUp(e :MouseEvent) {
    this.mouseHeld = false;
    if (this.selectedBox) {
      this.selectedBox.isSelected = false;
      this.selectedBox = null;
      requestAnimationFrame(this.draw.bind(this));
    }
  }

  constructor() { }

  prepareCanvas() {
    this.canvas.nativeElement.setAttribute('width', this.divWidth)
    this.canvas.nativeElement.setAttribute('height', this.divHeight)
    this.gridCanvas.nativeElement.setAttribute('width', this.divWidth)
    this.gridCanvas.nativeElement.setAttribute('height', this.divHeight)

    let mapStyle: string = `top: ${this.topPosition}px; left: ${this.leftPosition}px; z-index: 1;`;
    let gridStyle: string = `top: ${this.topPosition}px; left: ${this.leftPosition}px; z-index: 0;`;

    this.gridCanvas.nativeElement.setAttribute('style', gridStyle);
    this.canvas.nativeElement.setAttribute('style', mapStyle);

    this.bounds = this.canvas.nativeElement.getBoundingClientRect();
    this.ctx = this.canvas.nativeElement.getContext("2d");
    this.gridCtx = this.gridCanvas.nativeElement.getContext("2d");

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.0)";
    this.gridCtx.fillStyle = "gray";
    this.ctx.fillRect(0,0, this.canvas.nativeElement.offsetWidth, this.canvas.nativeElement.offsetHeight);
    this.gridCtx.fillRect(0,0, this.gridCanvas.nativeElement.offsetWidth, this.gridCanvas.nativeElement.offsetHeight);

    this.draw();
  }

  ngOnInit() {
    this.prepareCanvas();

    requestAnimationFrame(this.draw.bind(this));
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.panX = 0;
    this.panY = 0;
    this.prepareCanvas();

  }

  roundToNearest(value: number, nearest: number) {
    // case 1: (value % nearest = 0)
    //    value is already at a multiple
    // case 2: (value % nearest < nearest / 2)
    //    value should be rounded down to (value - (value % nearest))
    //    e.g. roundToNearest(12, 5) = (12 - (12 % 5)) = 10
    // case 3: (value % nearest > nearest / 2)
    //    value should be rounded up to (value + (nearest - (value % nearest))
    
    if(value % nearest == 0) {
      return value;
    } else if(value % nearest < nearest / 2) {
      return value - (value % nearest);
    } else {
      return value + (nearest - (value % nearest));
    }
  }

}

class Stage {
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;

  name: string;
 
  constructor(x: number, y: number, width: number, height: number, data?: StageModel) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    if(name != undefined){
      this.name = data.filename;
    }
  }

  isCollidingWithPoint(x: number, y: number) {
    return (x > this.x && x < this.x + this.width) 
        && (y > this.y && y < this.y + this.height);
  }

  drag(newX: number, newY: number) {
    this.x = newX - this.width * 0.5;
    this.y = newY - this.height * 0.5;
  }

  draw(ctx: CanvasRenderingContext2D, panX: number, panY: number) {
    if (this.isSelected) {
      ctx.fillStyle = "darkcyan";
      ctx.fillRect(
        this.x - panX,
        this.y - panY,
        this.width,
        this.height
      );
      ctx.fillStyle = "black";
    } else {			
      ctx.fillRect(
        this.x - panX,
        this.y - panY,
        this.width,
        this.height
      );
    }

    ctx.fillStyle = "white";
    ctx.fillText(
      `${this.name} (${this.x}, ${this.y})`,
      this.x + this.width * 0.5 - panX,
      this.y + this.height * 0.5 - panY,
      this.width
    );
    
    ctx.fillStyle = "black";
  }
}