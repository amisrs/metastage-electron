import { Component, OnInit, Input } from '@angular/core';
import { StageModel } from '../StageModel';

@Component({
  selector: 'app-map-preview',
  templateUrl: './map-preview.component.html',
  styleUrls: ['./map-preview.component.css']
})
export class MapPreviewComponent implements OnInit {

  @Input() clickedStage: StageModel;
  constructor() { }

  ngOnInit() {
  }

}
