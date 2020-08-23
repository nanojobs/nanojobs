import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dashsimple',
  templateUrl: './dashsimple.component.html',
  styleUrls: ['./dashsimple.component.css']
})
export class DashsimpleComponent implements OnInit {
  @Input() simplevalue: string;
  @Input() simpletitle: string;
  @Input() simpleicon: string;
  @Input() simplecolor: string="accent";
  

  constructor() { }

  ngOnInit() {
  }

}
