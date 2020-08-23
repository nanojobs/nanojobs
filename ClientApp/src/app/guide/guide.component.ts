import { Component, OnInit } from '@angular/core';
import { MainsvcService } from '../mainsvc.service';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements OnInit {

  constructor(public mainSVC: MainsvcService) { }

  currentHash: string = null;
  loading = null;

  async ngOnInit() {
    this.loading="Loading instructions..."
    this.currentHash = this.mainSVC.GetParamOrDefault("hash");
    localStorage.setItem(this.mainSVC.dirHash+"_show_guide","true");
    try {
      var contentGuide = await this.mainSVC.GetStringFromDirectoryHash(this.currentHash, "/guide.html");
      document.getElementById("guide").innerHTML = contentGuide;
    } catch (error) {
      document.getElementById("guide").innerHTML = "<h1>Error on loading guide</h1>";
    } finally {
      this.loading=null;
    }

  }

}
