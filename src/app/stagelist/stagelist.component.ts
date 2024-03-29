import { Component, OnInit, ChangeDetectionStrategy, NgZone, EventEmitter, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { ElectronService } from 'ngx-electron';
import { StageModel } from '../StageModel'
import { reject } from 'q';

interface FileIndex {
  filename: string;
  index: number;
}

interface Dictionary<T> {
  [Key: string]: T;
}

@Component({
  selector: 'app-stagelist',
  templateUrl: './stagelist.component.html',
  styleUrls: ['./stagelist.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})


export class StagelistComponent {

  levelsFolder: string[];
  files: string[] = ['yo'];
  indexMappings: Map<number, string>;
  // indexMappings: Dictionary<string> = {};
  stagesInDirectory: Map<string, StageModel>;

  orderedStages: StageModel[] = [];
  viewList: StageModel[] = [];

  graphJson: string;

  // TODO: new files, deleted files
  metastageFileCount: number = 0;
  directoryFileCount: number = 0;
  fs;
  constructor(private _electronService: ElectronService, private _ngZone: NgZone) {
    this.fs = _electronService.remote.require('fs');
  }

  initialise() {
    this.indexMappings = new Map<number, string>();
    this.stagesInDirectory = new Map<string, StageModel>();
    this.orderedStages = [];
    this.viewList = [];
    this.metastageFileCount = 0;
    this.directoryFileCount = 0;
  }

  directoryChange() {
    if(this._electronService.isElectronApp) {
      this._electronService.remote.dialog.showOpenDialog({
        title: 'Select folder',
        properties: ['openDirectory']
      }, 
        (folderPath) => {
          if(folderPath === undefined) {
            alert("No folder selected.");
            return;
        }
        this.levelsFolder = folderPath;
        this.loadLevels();
      });
    }
  }

  loadLevels() {
    this.initialise();
    let newFiles: string[] = [];
        this.fs.readdir(this.levelsFolder.join(), (err, dir) => {
          if(dir.includes('meta_level.txt')) {
            this.fs.readFile(this.levelsFolder.join() + '/meta_level.txt', 'utf8', this.loadMetastage) 
          } 

          if(dir.includes('meta_graph.txt')) {
            this.fs.readFile(this.levelsFolder.join() + '/meta_graph.txt', 'utf8', (err, data) => {
              this.graphJson = data;
            }) 
          }
          
          let fileReads = dir.map((item) => {
            if(item.endsWith('.json')) { 
              return new Promise((resolve, reject) => {
                  this.fs.readFile(this.levelsFolder.join() + '/' + item, 'utf8', (err, data) => {
                    if(err) { reject(err); }
                    let stage: StageModel = JSON.parse(data);
                    stage.filename = item;
                    this.stagesInDirectory.set(item, stage);
                    resolve(data);
                  })
              })
            }
          })

          Promise.all(fileReads).then(() => {
            //
            this.populateList();
          }, function() { console.log("rejected?")});
    })

  }

  loadMetastage = (err, data) => {
    if(err) {
      alert(err);
      throw err;
    }

    let indexLines: FileIndex[] = JSON.parse(data);
    for(let line of indexLines) {
      this.metastageFileCount++;
      this.indexMappings.set(line.index, line.filename);

    }
  }

  populateList = () => {
    let orderedIndex: number = 0;

    // check if directory has new stages not in metastage
    this.stagesInDirectory.forEach((value: StageModel, key: string) => {
      if(this.mapContainsValue(this.indexMappings, key)) {
        // expected case, this will be caught in the second pass
      } else {
        this.orderedStages[orderedIndex] = value;
        this.orderedStages[orderedIndex].changeFlag = 'new';
        orderedIndex++;
      }
    })


    // check if metastage has stages not in directory
    for(var i = 0; i < this.metastageFileCount; i++) {
      console.log("I'm setting index " + i + " to be " + this.indexMappings.get(i) + " < filename, which has a MODEL: " + this.stagesInDirectory.get(this.indexMappings.get(i)));
      if(this.stagesInDirectory.has(this.indexMappings.get(i))) {
        this.orderedStages[orderedIndex] = this.stagesInDirectory.get(this.indexMappings.get(i));
        orderedIndex++;
      } else {
        // there's a stage named in metastage that doesn't exist in directory (meaning you deleted it)
        // create a dummy stage, just to SHOW that it's gone, or just ignore i guess
        console.log(`Couldn't find ${this.indexMappings.get(i)}.`);
      }

    
       // get model belonging to string belonging to index
      //this.TEMPDEBUGorderedStagesStrings[i] = this.stagesInDirectory[this.indexMappings[i]].filename;
    }

    console.log(this.orderedStages);
    this._loadStagesToWorldMap(this.orderedStages);
    this.orderedStages.forEach(stage => {
      this._ngZone.run(() => {
        setTimeout( () => {
          this.viewList.push(stage);
        },500)
      })
    });

  }

  save() {
    let newFileIndexes: FileIndex[] = [];
    
    for(var i = 0; i < this.metastageFileCount; i++) {
      this.indexMappings[i] = this.orderedStages[i].filename;
      let fileIndex: FileIndex = {filename: '', index: -1};
      fileIndex.filename = this.indexMappings.get(i);
      fileIndex.index = i;
      newFileIndexes.push(fileIndex);
    }

    this.fs.writeFile(this.levelsFolder.join() + '/meta_level.txt', JSON.stringify(newFileIndexes), 'utf8', function(err) {
      if(err) {
        alert("Failed to write to file.");
      } else {
        alert("Saved!");
      }
    })
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.viewList, event.previousIndex, event.currentIndex);
    moveItemInArray(this.orderedStages, event.previousIndex, event.currentIndex);
  }

  @Output() sendStageToMapPreview = new EventEmitter<StageModel>();
  _sendStageToMapPreview(data: StageModel) {
    this.sendStageToMapPreview.emit(data)
  }

  @Output() addStageToWorldMap = new EventEmitter<StageModel>();
  _addStageToWorldMap(data: StageModel) {
    this.addStageToWorldMap.emit(data)
  }

  @Output() loadStagesToWorldMap = new EventEmitter<[string, StageModel[]]>();
  _loadStagesToWorldMap(data: StageModel[]) {
    this.loadStagesToWorldMap.emit([this.graphJson, data]);
  }

  mapContainsValue(map: Map<any, any>, value: any): boolean {
    for (let [itemValue, itemKey] of map.entries()) {
      if(itemKey == value) {
        return true;
      }
    }
    return false;
  }
  
}


/* To add a thing ot the list:
  this._ngZone.run(() => {
    setTimeout( () => {
      newFiles.push(element);
    },500)
  })
*/