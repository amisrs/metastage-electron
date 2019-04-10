import { Component, OnInit, ElementRef, ViewChild, Input, HostListener } from '@angular/core';
import { fromEvent } from "rxjs";
import { Observable } from "rxjs";
import { Subscription } from "rxjs";
import { StageModel, StageLayerModel } from '../StageModel';

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
  bounds: ClientRect;


  // where did you click the box in relation to its center
  selectOffsetX: number;
  selectOffsetY: number;
  mouseHeld: boolean;
  selectedBox: Stage;
  boxArray: Stage[] = [];

  panX: number = 0;
  panY: number = 0;

  mouseX: number;
  mouseY: number;
  oldMouseX: number;
  oldMouseY: number;
  
  gridSize: number = 10;
  scrollAmount: number = 0.5;

  ctx: CanvasRenderingContext2D;
  gridCtx: CanvasRenderingContext2D;

  @ViewChild("map") canvas: ElementRef;
  @ViewChild("grid") gridCanvas: ElementRef;
  @ViewChild("back") background: ElementRef;


  gridColor: string = "rgba(111, 115, 118, 1)";
  mapColor: string = "rgba(32, 34, 37, 1)";
  pixelColor: string = "rgba(166, 166, 166, 1)";

  @Input() 
  set addStage (addStage: StageModel) {
    alert(`Adding ${addStage.filename}`);
    this.boxArray.push(new Stage(0, 0, addStage.width, addStage.height, this.gridSize, addStage));
    this.draw();
  }

  draw = () => {
    // this.gridCtx.fillRect(0,0, this.gridCanvas.nativeElement.offsetWidth, this.gridCanvas.nativeElement.offsetHeight);
    // this.gridCtx.clearRect(0,0, this.gridCanvas.nativeElement.offsetWidth, this.gridCanvas.nativeElement.offsetHeight);
    // this.gridCtx.fillStyle = this.gridColor;

    this.background.nativeElement.setAttribute('width', this.divWidth);
    this.background.nativeElement.setAttribute('height', this.divHeight);
    // this.gridCanvas.nativeElement.setAttribute('width', this.divWidth);
    // this.gridCanvas.nativeElement.setAttribute('height', this.divHeight);
    this.canvas.nativeElement.setAttribute('width', this.divWidth);
    this.canvas.nativeElement.setAttribute('height', this.divHeight);

    let mapStyle: string = `top: ${this.topPosition}px; left: ${this.leftPosition}px; z-index: 1;`;
    let gridStyle: string = `top: ${this.topPosition}px; left: ${this.leftPosition}px; z-index: 0;`;
    this.background.nativeElement.setAttribute('style', gridStyle);
    // this.gridCanvas.nativeElement.setAttribute('style', gridStyle);
    this.canvas.nativeElement.setAttribute('style', mapStyle);

    this.ctx.fillStyle = this.mapColor;
    this.ctx.fillRect(0,0, this.canvas.nativeElement.offsetWidth, this.canvas.nativeElement.offsetHeight);

    var box = null;
    var xMin = 0;
    var xMax = 0;
    var yMin = 0;
    var yMax = 0;

    this.ctx.strokeStyle = this.gridColor;
    for(var column:number = -this.gridSize; column < parseFloat(this.canvas.nativeElement.getAttribute('width')); column += this.gridSize) {
      let x:number;
      x = (this.gridSize - (this.panX % this.gridSize)) + (column);

      this.ctx.beginPath();
      
      this.ctx.lineWidth = 0.5;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.nativeElement.getAttribute('height'));
      this.ctx.stroke();
    } 

    for(var row = -this.gridSize; row < parseFloat(this.canvas.nativeElement.getAttribute('height')); row += this.gridSize) {
      let y:number;

      y = (this.gridSize - (this.panY % this.gridSize)) + (row);

      this.ctx.beginPath();
      this.ctx.lineWidth = 0.5;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.nativeElement.getAttribute('width'), y);
      this.ctx.stroke();
    }

    for (var i = 0; i < this.boxArray.length; ++i) {
      box = this.boxArray[i];
      
      
      xMin = box.x - this.panX;
      xMax = box.x + box.width - this.panX;
      yMin = box.y - this.panY;
      yMax = box.y + box.height - this.panY;
      // if box is within vision, draw it
      if (xMax > 0 && xMin < this.canvas.nativeElement.offsetWidth && yMax > 0 && yMin < this.canvas.nativeElement.offsetHeight) {
        this.ctx.fillStyle = this.pixelColor;
        box.draw(this.ctx, this.panX, this.panY, this.gridSize);
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
          this.selectOffsetX = this.mouseX - this.selectedBox.x * this.gridSize + this.panX;
          this.selectOffsetY = this.mouseY - this.selectedBox.y * this.gridSize+ this.panY; 
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
        this.selectedBox.x = this.roundToNearest(this.mouseX - this.selectOffsetX + this.panX, this.gridSize) / this.gridSize;
        this.selectedBox.y = this.roundToNearest(this.mouseY - this.selectOffsetY + this.panY, this.gridSize) / this.gridSize;
      }
      requestAnimationFrame(this.draw.bind(this));
    } 

    this.oldMouseX = this.mouseX;
    this.oldMouseY = this.mouseY;  

  }

  onMouseUp(e: MouseEvent) {
    this.mouseHeld = false;
    if (this.selectedBox) {
      this.selectedBox.isSelected = false;
      this.selectedBox = null;
      requestAnimationFrame(this.draw.bind(this));
    }
  }

  // @HostListener('window:scroll', ['$event'])
  onScroll(e: WheelEvent) {
    console.log(e);

    if(e.deltaY >= 0) {
      // zoom out'
      if(this.gridSize - this.scrollAmount <= this.scrollAmount) {
        this.gridSize = this.scrollAmount;
      } else {
        this.gridSize -= this.scrollAmount;
      }
    } else {
      if(this.gridSize + this.scrollAmount >= 20) {
        this.gridSize = 20;
      } else {
        this.gridSize += this.scrollAmount;
      }
    }

    
    this.draw();
  }

  constructor() { }

  prepareCanvas() {
    this.background.nativeElement.setAttribute('width', this.divWidth)
    this.background.nativeElement.setAttribute('height', this.divHeight)
    // this.gridCanvas.nativeElement.setAttribute('width', this.divWidth)
    // this.gridCanvas.nativeElement.setAttribute('height', this.divHeight)
    this.canvas.nativeElement.setAttribute('width', this.divWidth)
    this.canvas.nativeElement.setAttribute('height', this.divHeight)

    let mapStyle: string = `top: ${this.topPosition}px; left: ${this.leftPosition}px; z-index: 1;`;
    // let gridStyle: string = `top: ${this.topPosition}px; left: ${this.leftPosition}px; z-index: 0;`;

    // this.background.nativeElement.setAttribute('style', gridStyle);
    // this.gridCanvas.nativeElement.setAttribute('style', gridStyle);
    this.canvas.nativeElement.setAttribute('style', mapStyle);

    this.bounds = this.canvas.nativeElement.getBoundingClientRect();
    this.ctx = this.canvas.nativeElement.getContext("2d");
    // this.gridCtx = this.gridCanvas.nativeElement.getContext("2d");

    this.ctx.fillStyle = this.mapColor;
    // this.gridCtx.fillStyle = "gray";
    this.ctx.fillRect(0,0, this.canvas.nativeElement.offsetWidth, this.canvas.nativeElement.offsetHeight);
    // this.gridCtx.fillRect(0,0, this.gridCanvas.nativeElement.offsetWidth, this.gridCanvas.nativeElement.offsetHeight);

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

  pixelSize: number;

  name: string;
  collisionLayer: StageLayerModel;
  openBorderTiles: number[] = [];
  
  // open borders that are adjacent to another stage's open borders
  openBorderCrossings: number[] = [];
 
  constructor(x: number, y: number, width: number, height: number, pixelSize: number, data: StageModel) {
    this.x = x / pixelSize;
    this.y = y / pixelSize;
    this.width = width;
    this.height = height;

    this.pixelSize = pixelSize;

    if(data != undefined){
      this.name = data.filename;
      for(var layer of data.layers) {
        if(layer.name == 'Collision') {
          this.collisionLayer = layer;
          break;
        }
      };
  
      if(!this.collisionLayer) {
        // no collisionlayer, nothing to draw
      }  

      this.getOpenBorders();
    }
  }

  getOpenBorders() {
    // get the tiles that are:
    //    0 in collisionLayer.data AND
    //    (on the top/bottom edge) OR (on the left/right edge)
    
    // top edge is      0 <= i < width
    // left edge is     i % width == 0
    // bottom edge is   width * (height - 1) < i < width * height
    // right edge is    i % width = width - 1

    // top
    for (var i = 0; i < this.collisionLayer.width; i++)
    {
      if(this.collisionLayer.data[i] == 0) {
        this.openBorderTiles.push(i);
      }
    }

    // left
    for (var i = 0; i < this.collisionLayer.width * this.collisionLayer.height 
      && this.collisionLayer.data[i] == 0; i += this.collisionLayer.width)
    {
      this.openBorderTiles.push(i);
    }

    // bottom
    for (var i = this.collisionLayer.width * this.collisionLayer.height - this.collisionLayer.width;
        i < this.collisionLayer.width * this.collisionLayer.height && this.collisionLayer.data[i] == 0; i++)
    {
      this.openBorderTiles.push(i);
    }

    // right
    for (var i = this.collisionLayer.width - 1; i < this.collisionLayer.width * this.collisionLayer.height 
      && this.collisionLayer.data[i] == 0; i += this.collisionLayer.width)
    {
      this.openBorderTiles.push(i);
    }
  }

  compareOpenBorders(otherOpenBorders: number[]) {

  }

  isCollidingWithPoint(x: number, y: number) {
    return (x > this.x * this.pixelSize && x < this.x * this.pixelSize + this.width * this.pixelSize) 
        && (y > this.y * this.pixelSize && y < this.y * this.pixelSize + this.height * this.pixelSize);
  }

  // drag(newX: number, newY: number) {
  //   this.x = (newX - this.width * this.pixelSize * 0.5) / this.pixelSize;
  //   this.y = (newY - this.height * this.pixelSize * 0.5) / this.pixelSize;
  // }

  draw(ctx: CanvasRenderingContext2D, panX: number, panY: number, pixelSize: number) {
    this.pixelSize = pixelSize;
    for (var i = 0; i < this.collisionLayer.width * this.collisionLayer.height; i++)
    {
        let currentColumn: number = i % this.collisionLayer.width;
        let currentRow: number = Math.floor(i / this.collisionLayer.width);

        if(this.openBorderTiles.includes(i)){
          ctx.fillStyle = "green";
        } else if (this.collisionLayer.data[i] - 1 != -1) {
          ctx.fillStyle = "grey";
        } else {
          continue;
        }

        ctx.fillRect(this.x * pixelSize + currentColumn * pixelSize - panX, this.y * pixelSize + currentRow * pixelSize - panY, pixelSize, pixelSize);
    }


    ctx.fillText(
      `${this.name} (${this.x}, ${this.y})`,
      this.x + this.width * this.pixelSize * 0.5 - panX,
      this.y + this.height * this.pixelSize * 0.5 - panY,
      this.width
    );
    
  }
}