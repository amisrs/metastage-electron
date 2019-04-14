import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { StageModel } from '../StageModel';
import { StagelistComponent } from '../stagelist/stagelist.component';

@Component({
  selector: 'app-map-bar',
  templateUrl: './map-bar.component.html',
  styleUrls: ['./map-bar.component.css'],
  host: {
    'class': 'app'
  }, 
  changeDetection: ChangeDetectionStrategy.Default

})
export class MapBarComponent implements OnInit  {

  constructor() { }


  // events going to stagelist
  @ViewChild(StagelistComponent)
  stagelistComponent: StagelistComponent;

  directoryChange() {
    this.stagelistComponent.directoryChange();
  }

  save() {
    this.stagelistComponent.save();
  }

  // events coming from stagelist
  clickedStage: StageModel;
  @Output() addStageToWorldMap = new EventEmitter<StageModel>();
  _addStageToWorldMap(data: StageModel) {
    this.addStageToWorldMap.emit(data)
  }

  @Output() sendSaveClickEvent = new EventEmitter<string>();
  _sendSaveClickEvent() {
    this.sendSaveClickEvent.emit(this.stagelistComponent.levelsFolder.join());
    alert(`Saving to ${this.stagelistComponent.levelsFolder.join()}`);
  }



  receiveClickedStageFromStageList(data) {
    this.clickedStage = data;
  }

  receiveAddStageFromStageList(data) {
    this._addStageToWorldMap(data);
  }
  

  ngOnInit() {
  }

}
