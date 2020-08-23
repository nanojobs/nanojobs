import { Component, OnInit } from '@angular/core';
import { MainsvcService } from '../mainsvc.service';
import { TaskerComponent } from '../tasker/tasker.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  constructor(public mainSVC: MainsvcService) { }

  currentAddress:string = null;
  currentEmail:string=null;

  loading=null;
  error=null;

  async register(){
    this.mainSVC.walletAddress=this.currentAddress;
    this.mainSVC.emailAddess=this.currentEmail;
    localStorage.setItem(this.mainSVC.dirHash+"_email",this.currentEmail);
    localStorage.setItem(this.mainSVC.dirHash+"_eth",this.currentAddress);
    await this.mainSVC.LoadData(TaskerComponent.instance.currentHash);
    TaskerComponent.instance.loadHash(TaskerComponent.instance.currentHash);
    let showedGuide = localStorage.getItem(this.mainSVC.dirHash + "_show_guide");
    if (!showedGuide) {
      this.mainSVC.CurrentScreen = "guide";
    } else {
      this.mainSVC.CurrentScreen="current_job";
    }
  }

  ngOnInit() {
    this.currentAddress=this.mainSVC.walletAddress;
    this.currentEmail=this.mainSVC.emailAddess;
  }

}
