import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MainsvcService } from '../mainsvc.service';

@Component({
  selector: 'app-nohash',
  templateUrl: './nohash.component.html',
  styleUrls: ['./nohash.component.css']
})
export class NohashComponent implements AfterViewInit {

  @ViewChild('nohashlogo',{static:true}) logo;

  constructor(public mainSVC: MainsvcService) { }
  ngAfterViewInit(): void {
    var imgLogo=<HTMLImageElement>document.getElementById("logosteve");
    var img=this.logo.nativeElement;
    img.src=imgLogo.src;
  }

  currentHash: string = null;
  loading = null;

  enterHash(){
    localStorage.setItem("current_hash",this.currentHash);
    window.location.reload();
  }

  ngOnInit() {
    localStorage.removeItem("current_hash");
  }

}
