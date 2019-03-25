import { Component, OnInit, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-stagelist',
  templateUrl: './stagelist.component.html',
  styleUrls: ['./stagelist.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class StagelistComponent {

  levelsFolder: string[];
  files: string[] = ['yo'];
  fs;
  constructor(private _electronService: ElectronService, private _ngZone: NgZone) {
    this.fs = _electronService.remote.require('fs');
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
    let newFiles: string[] = [];
        this.fs.readdir(this.levelsFolder.join(), (err, dir) => {

          dir.forEach((element: string) => {
            if(element == 'meta_stage.json') {
              // load metastage
            }
            else if(element.endsWith('.json')){
              this._ngZone.run(() => {

                setTimeout( () => {
                  newFiles.push(element);
                },500)
              })
            }
          });
          this.files = this.files.slice(0,0);
          this.files = newFiles;
      console.log(this.files);

    })

  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
  }
}
