import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { StageModel, StageLayerModel } from '../StageModel';

@Component({
  selector: 'app-map-preview',
  templateUrl: './map-preview.component.html',
  styleUrls: ['./map-preview.component.css']
})
export class MapPreviewComponent implements OnInit {

  selectedStage: StageModel;
  drawBoundHeight: number;
  // used for dynamic css styling
  mapWidthPct: string;
  mapHeightPct: string;

  @Input() 
  set clickedStage (clickedStage: StageModel) {
    this.selectedStage = clickedStage;
    this.draw(this.selectedStage);
  }

  @ViewChild('mapCanvas') canvas: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  draw(stage: StageModel) {
    // 1. extract the collisionlayer
    // 2. set appropriate height/width for aspect ratio
    // 3. calculate pixel height
    // 4. draw boxes dude
    let collisionLayer: StageLayerModel;
    for(var layer of stage.layers) {
      if(layer.name == 'Collision') {
        collisionLayer = layer;
        break;
      }
    };

    if(!collisionLayer) {
      // no collisionlayer, nothing to draw
      return;
    }

    let heightCount: number;
    let widthCount: number;

    let pixelHeight: number;
    let pixelWidth: number;

    let boxHeight: number = 200;
    let boxWidth: number = 200;
    
    let context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext("2d");
    context.fillStyle = 'black';
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // To set dimensions, find the longest axis and set that to 100%
    // then set the shorter axis to
    // don't care if they're both the same
    this.mapWidthPct = ''+boxWidth+'px';
    this.mapHeightPct = ''+boxHeight+'px';
    context.canvas.height = boxHeight;
    context.canvas.width = boxWidth;

    if(collisionLayer.height > collisionLayer.width) {
      // canvas is square of longest edge, scaled to fit in box
      // boxheight = 
      pixelHeight = (this.canvas.nativeElement.offsetWidth / collisionLayer.width);
      pixelWidth = pixelHeight;  
    } else {
      pixelHeight = (this.canvas.nativeElement.offsetHeight / collisionLayer.height);

      pixelWidth = pixelHeight;
    }
    context.fillRect(0, 0, pixelWidth, pixelHeight);

    for (var i = 0; i < collisionLayer.width * collisionLayer.height; i++)
    {
        let currentTile: number = layer.data[i] - 1;
        if (currentTile == -1)
        {
            continue;
        }
        let currentColumn: number = i % collisionLayer.width;
        let currentRow: number = Math.floor(i / collisionLayer.width);

        context.fillRect(currentColumn * pixelWidth, currentRow * pixelHeight, pixelWidth, pixelHeight);
    }
  } 
}
