import { Component, NgZone, OnInit, ElementRef, ViewChild, Input, HostListener } from '@angular/core';
import { fromEvent } from "rxjs";
import { Observable } from "rxjs";
import { Subscription } from "rxjs";
import { StageModel, StageLayerModel } from '../StageModel';
import { WorldGraph } from '../WorldGraph';
import { Stage, ButtonResponse, MainButton } from '../Stage';
import { ElectronService } from 'ngx-electron';

// https://stackoverflow.com/questions/47371623/html-infinite-pan-able-canvas
@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.css']
})
export class WorldMapComponent implements OnInit {

  // resizeObservable: Observable<Event>
  // resizeSubscription: Subscription
  fs;


  @Input() divElement: ElementRef;

  @Input() divHeight: number;
  @Input() divWidth: number;
  

  @Input() topPosition: number;
  @Input() leftPosition: number;

  // @Input() stages: StageModel[];

  bounds: ClientRect;


  // where did you click the box in relation to its center
  selectOffsetX: number;
  selectOffsetY: number;

  mouseHeld: boolean;
  selectedBox: Stage;
  // boxArray: Stage[] = [];
  stagesInMemoryMap: Map<string, StageModel> = new Map<string, StageModel>();
  stagesInWorldMap: Map<string, Stage> = new Map<string, Stage>();

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
  
  worldGraph: WorldGraph = new WorldGraph();

  @Input() 
  set addStage (addStage: StageModel) {
    alert(`Adding ${addStage.filename}`);
    let stage: Stage = new Stage(0, 0, addStage.width, addStage.height, this.gridSize, addStage);
    this.worldGraph.addVertex(stage);
    // this.boxArray.push(new Stage(0, 0, addStage.width, addStage.height, this.gridSize, addStage));
    this.stagesInWorldMap.set(addStage.filename, stage);
    this.draw();
    // this.worldGraph.serialise();
  }

  loadStagesInMemory(stages: StageModel[]) {
    this.stagesInMemoryMap.clear();
    for(let stage of stages) {
      this.stagesInMemoryMap.set(stage.filename, stage);
    }
  }

  load(json: string) {
    // y is inverse, html canvas vs unity
    // save it in unity correct format, so we need to negate it when loading/saving
    this.worldGraph.adjacencyMap = Object.assign(new Object(), JSON.parse(json));
    for(let stageName of Object.keys(this.worldGraph.adjacencyMap)) {
      let x: number = this.worldGraph.adjacencyMap[stageName].x;
      let y: number = -this.worldGraph.adjacencyMap[stageName].y;
      let width: number = this.stagesInMemoryMap.get(stageName).width;
      let height: number = this.stagesInMemoryMap.get(stageName).height;
      let stage: Stage = new Stage(x * this.gridSize, y * this.gridSize, width, height, this.gridSize, this.stagesInMemoryMap.get(stageName));
      this.stagesInWorldMap.set(stage.name, stage);
    }
    this.draw();
    // alert(this.worldGraph.serialise());
  }

  constructor(private _electronService: ElectronService, private _ngZone: NgZone) {
    this.fs = _electronService.remote.require('fs');
  }

  save(path: string) {
    this.fs.writeFile(path + '/meta_graph.txt', this.worldGraph.serialise(), 'utf8', function(err) {
      if(err) {
        alert("Failed to write to file: " + err);
      } else {
        alert("Saved!");
      }
    })

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

    for(let [name, stage] of this.stagesInWorldMap) {
      xMin = stage.x * this.gridSize - this.panX;
      xMax = stage.x * this.gridSize + stage.width * this.gridSize - this.panX;
      yMin = stage.y * this.gridSize - this.panY;
      yMax = stage.y * this.gridSize + stage.height * this.gridSize - this.panY;
      // if box is within vision, draw it
      if (xMax > 0 && xMin < this.canvas.nativeElement.offsetWidth && yMax > 0 && yMin < this.canvas.nativeElement.offsetHeight) {
        this.ctx.fillStyle = this.pixelColor;
        stage.draw(this.ctx, this.panX, this.panY, this.gridSize);
      }
    }
  }

  onMouseDown(e: MouseEvent) {
    this.mouseHeld = true;
    console.log(`Click point: (${this.mouseX + this.panX}, ${this.mouseY + this.panY})`);
    if (!this.selectedBox) {
      for(let [name, stage] of this.stagesInWorldMap) {
        if (stage.isCollidingWithPoint(this.mouseX + this.panX,this.mouseY + this.panY)) {
          this.selectedBox = stage;
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
        let oldAdjacents: Stage[] = this.selectedBox.postMove();

        // check adjacency
        for(let [name, stage] of this.stagesInWorldMap) {

        // }
        // for (var i = 0; i < this.boxArray.length; ++i) {
          if(stage === this.selectedBox) {
            continue;
          }

          let isAdjacent: boolean = false;

          let isInsideY: boolean = !((this.selectedBox.y <= stage.y && 
            this.selectedBox.y + this.selectedBox.height <= stage.y) ||
          (this.selectedBox.y >= stage.y + stage.height && 
            this.selectedBox.y + this.selectedBox.height >= stage.y + stage.height))
          let isInsideX: boolean = !((this.selectedBox.x <= stage.x &&
            this.selectedBox.x + this.selectedBox.width <= stage.x) ||
            (this.selectedBox.x >= stage.x + stage.width &&
              this.selectedBox.x + this.selectedBox.width >= stage.x + stage.width))

          if(isInsideY) {
            if(this.selectedBox.x + this.selectedBox.width == stage.x) {
              // this.selectedBox.adjacentStagesRight.push(stage);
              isAdjacent = true;
            } else if(this.selectedBox.x == stage.x + stage.width) {
              // this.selectedBox.adjacentStagesLeft.push(stage);
              isAdjacent = true;
            }
          } else if(isInsideX){
            if(this.selectedBox.y + this.selectedBox.height == stage.y) {
              // this.selectedBox.adjacentStagesBottom.push(stage);
              isAdjacent = true;
            } else if(this.selectedBox.y == stage.y + stage.height) {
              // this.selectedBox.adjacentStagesTop.push(stage);
              isAdjacent = true;
            }
          }

          if(isAdjacent) {
            this.selectedBox.adjacentStages.push(stage);
            stage.adjacentStages.push(this.selectedBox);
          } else {
          }          
        }
        this.worldGraph.deleteAllEdgesByVertex(this.selectedBox);
        this.worldGraph.updateStageInfo(this.selectedBox);

        let newEdges = this.selectedBox.calculateOpenBorderCrossings();
        for(let edge of newEdges) {
          this.worldGraph.addEdge(edge[0], edge[1], edge[2]);
        }
        // compare this.selectedBox.adjacentstages with oldAdjacents, ones in old
        let onlyInOld: Stage[] = oldAdjacents.filter(this.comparer(this.selectedBox.adjacentStages));
        for(let notAdjacentAnymore of onlyInOld) {
          notAdjacentAnymore.adjacentStages.splice(notAdjacentAnymore.adjacentStages.indexOf(this.selectedBox, 1));
        }
        
        for(let stage of oldAdjacents) {
          stage.calculateOpenBorderCrossings(); 
        }

      }
      requestAnimationFrame(this.draw.bind(this));
    } else {
      for(let [name, stage] of this.stagesInWorldMap) {
        if (stage.isCollidingWithPoint(this.mouseX + this.panX,this.mouseY + this.panY)) {
          stage.isHovered = true;
          stage.hover();

        } else {
          stage.isHovered = false;
          stage.unhover();
        }
      }
      requestAnimationFrame(this.draw.bind(this));
    }

    this.oldMouseX = this.mouseX;
    this.oldMouseY = this.mouseY;  

  }

  comparer(otherArray){
    return function(current){
      return otherArray.filter(function(other){
        return other.value == current.value && other.display == current.display
      }).length == 0;
    }
  }

  onMouseUp(e: MouseEvent) {
    this.mouseHeld = false;
    if (this.selectedBox) {
      this.selectedBox.isSelected = false;
      this.selectedBox = null;
      requestAnimationFrame(this.draw.bind(this));
    }
  }

  onMouseClick(e: MouseEvent) {
    for(let [name, stage] of this.stagesInWorldMap) {
      if (stage.isCollidingWithPoint(this.mouseX + this.panX,this.mouseY + this.panY)) {
        let response: ButtonResponse = stage.click((this.mouseX + this.panX) - stage.x * this.gridSize, 
        (this.mouseY + this.panY) - stage.y * this.gridSize, this.panX, this.panY);


      }
    }
  }

  handleButtonResponse(buttonResponse: ButtonResponse) {
    if(buttonResponse.button.type == 'main') {
      // handle setting main stage
      this.worldGraph.updateStageInfo(buttonResponse.button.parent);
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
