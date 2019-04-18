import { StageModel, StageLayerModel } from '../app/StageModel';

export class Stage {
    x: number;
    y: number;
    width: number;
    height: number;
    isHovered: boolean;
    isSelected: boolean;
    isMainStage: boolean;
  
    pixelSize: number;
  
    name: string;
    stageModel: StageModel;
    collisionLayer: StageLayerModel;
    
    dataMap: number[][] = [];
    openBorderTiles: [number, number][] = [];
    translatedOpenBorderTiles: [number, number][] = [];
  
    adjacentStages: Stage[] = [];
    adjacentStagesRight: Stage[];
    adjacentStagesLeft: Stage[];
    adjacentStagesBottom: Stage[];
    adjacentStagesTop: Stage[];
  
    // open borders that are adjacent to another stage's open borders
    openBorderCrossings: [number, number][] = [];
  
    // colors
    outlineColor: string = 'rgba(63, 191, 191, 0.25)';
    defaultOutlineColor: string = 'rgba(63, 191, 191, 0.25)'
    highlightOutlineColor: string = 'rgba(63, 191, 191, 0.7)'
  
    openBorderColor: string = 'rgba(191, 191, 63, 0.25)'
    defaultOpenBorderColor: string = 'rgba(191, 191, 63, 0.25)'
    highlightOpenBorderColor: string = 'rgba(191, 191, 63, 0.6)'
  
    borderCrossingColor: string = 'rgba(127, 191, 63, 1)'
    defaultBorderCrossingColor: string = 'rgba(127, 191, 63, 1)'
    highlightBorderCrossingColor: string = 'rgba(127, 191, 63, 1)'
   
    constructor(x: number, y: number, width: number, height: number, pixelSize: number, data: StageModel) {
      this.x = x / pixelSize;
      this.y = y / pixelSize;
      this.width = width;
      this.height = height;
      this.stageModel = data;
      this.pixelSize = pixelSize;
  
      if(data != undefined){
        this.name = data.filename;
        for(let layer of data.layers) {
          if(layer.name == 'Collision') {
            this.collisionLayer = layer;
            break;
          }
        };
    
        if(!this.collisionLayer) {
          // no collisionlayer, nothing to draw
        } else {
          for(let w = 0; w < this.collisionLayer.width; w++) {
            this.dataMap[w] = [];
            for(let h = 0; h < this.collisionLayer.height; h++) {
              this.dataMap[w][h] = this.collisionLayer.data[h * this.collisionLayer.width + w];
              
              // check for open borders
              if(this.dataMap[w][h] == 0 && (h == 0 || w == 0 ||
                 h == this.collisionLayer.height - 1 || w == this.collisionLayer.width - 1)) {
                // it's gonna push the corners twice but shouldn't matter
                this.openBorderTiles.push([w, h])
              }
            }
          }
        }  
      }
      this.postMove();
    }
  
    hover() {
      this.outlineColor = this.highlightOutlineColor;
      this.openBorderColor = this.highlightOpenBorderColor;
    }
  
    unhover() {
      this.outlineColor = this.defaultOutlineColor;
      this.openBorderColor = this.defaultOpenBorderColor;
    }
  
    postMove(): Stage[] {
      let old: Stage[] = this.adjacentStages;
      
      this.adjacentStages = [];
  
      this.translatedOpenBorderTiles = [];
      for(let tile of this.openBorderTiles) {
        let translatedTile: [number, number] = [tile[0] + this.x, tile[1] + this.y]
        this.translatedOpenBorderTiles.push(translatedTile);
      }
      return old;
    }
  
    untranslateTile(tile: [number, number]): [number, number] {
      return [tile[0] - this.x, tile[1] - this.y];
    }
  
    calculateOpenBorderCrossings(): [Stage, Stage, [number, number][]][] {
      // return a bunch of edges    
      // right adj tiles are adjacent if other.x = this.x + 1
      // left adj : other.x = this.x - 1
      // bottom adj: other.y = this.y + 1
      // top adj: other.y = this.y - 1
      let edges: [Stage, Stage, [number, number][]][] = [];
      let oldBorderCrossings = this.openBorderCrossings;
      this.openBorderCrossings = [];
      for(let stage of this.adjacentStages) {
        let tiles: [number, number][] = [];
        for(let myTile of this.translatedOpenBorderTiles) {
          if(this.compareTileAgainstOthers(myTile, stage.translatedOpenBorderTiles)) {
            tiles.push(this.untranslateTile(myTile));
            this.openBorderCrossings.push(this.untranslateTile(myTile));
          }        
        }
        if(tiles.length > 0) {
          edges.push([this, stage, tiles]);
        }    
      }
  
      return edges;
    }
  
    // is this tile adjacent to another tile
    compareTileAgainstOthers(myTile: [number, number], otherTiles: [number, number][]): boolean {
      for(let otherTile of otherTiles) {
        if(((otherTile[0] == myTile[0] + 1 || otherTile[0] == myTile[0] - 1) && otherTile[1] == myTile[1]) ||
           ((otherTile[1] == myTile[1] + 1 || otherTile[1] == myTile[1] - 1) && otherTile[0] == myTile[0])) {
          return true;
        }
      }
  
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
      let crossings = JSON.stringify(this.openBorderCrossings);
  
  
      for(let w = 0; w < this.collisionLayer.width; w++) {
        for(let h = 0; h < this.collisionLayer.height; h++) {
          if(this.dataMap[w][h] != 0) {
            ctx.fillStyle = "grey";
            ctx.fillRect(this.x * pixelSize + w * pixelSize - panX,
              this.y * pixelSize + h * pixelSize - panY, pixelSize, pixelSize);
          }  
          if(h == 0 || w == 0 || h == this.collisionLayer.height - 1 || w == this.collisionLayer.width - 1) {
            let coords: string = JSON.stringify([w, h]);
            if(crossings.indexOf(coords) != -1) {
              ctx.fillStyle = this.borderCrossingColor;
            } else if(this.dataMap[w][h] == 0) {
              ctx.fillStyle = this.openBorderColor;
            } else {
              ctx.fillStyle = this.outlineColor;          
            }
            ctx.fillRect(this.x * pixelSize + w * pixelSize - panX,
              this.y * pixelSize + h * pixelSize - panY, pixelSize, pixelSize);          
          }
        }
      }
  
      ctx.fillText(
        `${this.name} (${this.x}, ${this.y})`,
        this.x * pixelSize + this.width * this.pixelSize * 0.5 - panX,
        this.y * pixelSize + this.height * this.pixelSize * 0.5 - panY,
        this.width * pixelSize
      );
      
    }
  }