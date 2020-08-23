import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MainsvcService } from './mainsvc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'ClientApp';

  constructor(public mainSvc:MainsvcService){
  }

  @ViewChild("drawer",{static:true}) drawer:MatDrawer;

  ngOnInit(): void {
    this.mainSvc.menu=this.drawer;
    window.history.pushState('current_job','current_job');
    window.history.pushState('current_job','current_job');
    window.history.pushState('current_job','current_job');
  }

}
