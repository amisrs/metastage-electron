import { Component, OnInit } from '@angular/core';
import { StageModel } from '../StageModel';

@Component({
  selector: 'app-map-bar',
  templateUrl: './map-bar.component.html',
  styleUrls: ['./map-bar.component.css'],
  host: {
    'class': 'app'
},
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
