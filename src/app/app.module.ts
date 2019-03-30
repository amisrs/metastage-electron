import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgxElectronModule } from 'ngx-electron';
import { NgxFsModule } from 'ngx-fs';

import { AppComponent } from './app.component';
import { StagesComponent } from './stages/stages.component';

import { AngularDraggableModule } from 'angular2-draggable';
import { StagelistComponent } from './stagelist/stagelist.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop'; 
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSplitModule } from 'angular-split';
import { MapBarComponent } from './map-bar/map-bar.component';
import { MapPreviewComponent } from './map-preview/map-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    StagesComponent,
    StagelistComponent,
    MapBarComponent,
    MapPreviewComponent,
  ],
  imports: [
    NgxElectronModule,
    NgxFsModule,
    BrowserModule,
    AngularDraggableModule,
    BrowserAnimationsModule,
    DragDropModule,
    NgbModule,
    AngularSplitModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
