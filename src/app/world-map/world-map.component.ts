import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { fromEvent } from "rxjs";
import { Observable } from "rxjs";
import { Subscription } from "rxjs";

// https://stackoverflow.com/questions/47371623/html-infinite-pan-able-canvas
@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.css']
})
export class WorldMapComponent implements OnInit {

  resizeObservable: Observable<Event>
  resizeSubscription: Subscription

  @Input()
  divHeight: number;
  @Input()
  divWidth: number;

  mouseHeld: boolean;
  selectedBox: Stage;
  panX: number = 0;
  panY: number = 0;

  mouseX: number;
  mouseY: number;
  oldMouseX: number;
  oldMouseY: number;

  ctx: CanvasRenderingContext2D;
  boxArray: Stage[] = [];
  @ViewChild("map") canvas: ElementRef;
  bounds: ClientRect;

  draw = () => {
    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(0,0, this.canvas.nativeElement.offsetWidth, this.canvas.nativeElement.offsetHeight);
    
    var box = null;
    var xMin = 0;
    var xMax = 0;
    var yMin = 0;
    var yMax = 0;
    
    
    for (var i = 0; i < this.boxArray.length; ++i) {
      box = this.boxArray[i];
      
      xMin = box.x - this.panX;
      xMax = box.x + box.width - this.panX;
      yMin = box.y - this.panY;
      yMax = box.y + box.height - this.panY;
      
      if (xMax > 0 && xMin < this.canvas.nativeElement.offsetWidth && yMax > 0 && yMin < this.canvas.nativeElement.offsetHeight) {
        this.ctx.fillStyle = "black";
        box.draw(this.ctx, this.panX, this.panY);
      }
    }
  }

  onMouseDown(e: MouseEvent) {
    this.mouseHeld = true;
    
    if (!this.selectedBox) {
      for (var i = this.boxArray.length - 1; i > -1; --i) {
        if (this.boxArray[i].isCollidingWithPoint(this.mouseX + this.panX,this.mouseY + this.panY)) {
          console.log("selecteed box");
          this.selectedBox = this.boxArray[i];
          this.selectedBox.isSelected = true;
          requestAnimationFrame(this.draw.bind(this));
          return;
        }
      }
    }
  }

  onMouseMove(e: MouseEvent) {
    console.log("mousemove");
    this.mouseX = e.clientX - this.bounds.left;
    this.mouseY = e.clientY - this.bounds.top;


    if (this.mouseHeld) {
      if (!this.selectedBox) {
        this.panX += this.oldMouseX - this.mouseX;
        this.panY += this.oldMouseY - this.mouseY;
      } else {
        console.log("dragging box")
        this.selectedBox.x = this.mouseX - this.selectedBox.width * 0.5 + this.panX;
        this.selectedBox.y = this.mouseY - this.selectedBox.height * 0.5 + this.panY;
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

  ngOnInit() {
    this.resizeObservable = fromEvent(window, 'resize')
    this.resizeSubscription = this.resizeObservable.subscribe(e => {
      this.panX = 0;
      this.panY = 0;
      this.bounds = this.canvas.nativeElement.getBoundingClientRect();
      this.ctx = this.canvas.nativeElement.getContext("2d");
  
      this.canvas.nativeElement.setAttribute('width', this.divWidth)
      this.canvas.nativeElement.setAttribute('height', this.divHeight)
    })
  
    this.bounds = this.canvas.nativeElement.getBoundingClientRect();
    this.ctx = this.canvas.nativeElement.getContext("2d");
    this.canvas.nativeElement.setAttribute('width', this.divWidth)
    this.canvas.nativeElement.setAttribute('height', this.divHeight)

    this.boxArray.push(new Stage(0, 0, 200, 200))
    requestAnimationFrame(this.draw.bind(this));
  }
  
  

}

class Stage {
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
 
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  isCollidingWithPoint(x: number, y: number) {
    return (x > this.x && x < this.x + this.width) && (y > this.y && y < this.y + this.height);
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
    
    ctx.fillStyle = "black";
  }
}