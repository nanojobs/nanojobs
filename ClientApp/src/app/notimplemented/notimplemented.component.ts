import { Component, OnInit } from '@angular/core';
import { MainsvcService } from '../mainsvc.service';

@Component({
  selector: 'app-notimplemented',
  templateUrl: './notimplemented.component.html',
  styleUrls: ['./notimplemented.component.css']
})
export class NotimplementedComponent implements OnInit {

  constructor(public mainSVC: MainsvcService) { }

  ngOnInit() {
  }

}
