import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { StageModel } from '../StageModel';

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

  clickedStage: StageModel;

  receiveStageFromStageList(data) {
    this.clickedStage = data;
  }

  ngOnInit() {
  }

}
