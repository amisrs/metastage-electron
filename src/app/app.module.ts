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

@NgModule({
  declarations: [
    AppComponent,
    StagesComponent,
    StagelistComponent
  ],
  imports: [
    NgxElectronModule,
    NgxFsModule,
    BrowserModule,
    AngularDraggableModule,
    BrowserAnimationsModule,
    DragDropModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
