import { Component, ViewChild, ElementRef, OnInit, HostListener, Input } from '@angular/core';
import { fromEvent } from "rxjs";
import { StageModel } from './StageModel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {


  title = 'metastage';

  @ViewChild("mapDiv") mapDiv: ElementRef;
  divHeight: number;
  divWidth: number;
  
  divElement: ElementRef;
  addStage: StageModel;
  path: string;

  receiveAddStageFromStageList(data: StageModel) {
    this.addStage = data;
  }

  receiveSaveClickEvent(path: string) {
    this.path = path;
  }

  ngOnInit() {
    console.log("app oninit");
    this.divHeight = this.mapDiv.nativeElement.offsetHeight;
    this.divWidth = this.mapDiv.nativeElement.offsetWidth;
    this.divElement = this.mapDiv;

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    console.log("resize");
    this.divHeight = this.mapDiv.nativeElement.offsetHeight;
    this.divWidth = this.mapDiv.nativeElement.offsetWidth;
    this.divElement = this.mapDiv;
  }

}
