import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stages',
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.less']
})
export class StagesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("yo what");
  }

  onMoving(event) {
    console.log("moving");
  }

}
