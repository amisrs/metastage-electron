import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { fromEvent } from "rxjs";
import { Observable } from "rxjs";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {


  title = 'metastage';
  resizeObservable: Observable<Event>
  resizeSubscription: Subscription

  @ViewChild("mapDiv") mapDiv: ElementRef;
  divHeight: number;
  divWidth: number;
  
  divElement: ElementRef;

  ngOnInit() {
    this.resizeObservable = fromEvent(window, 'resize')
    this.resizeSubscription = this.resizeObservable.subscribe(e => {
      console.log("resize");
      this.divHeight = this.mapDiv.nativeElement.offsetHeight;
      this.divWidth = this.mapDiv.nativeElement.offsetWidth;
      this.divElement = this.mapDiv;
    })
  }

}
