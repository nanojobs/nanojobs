import { Component, OnInit } from '@angular/core';
import { MainsvcService } from '../mainsvc.service';
import * as Enumerable from 'linq';
import { config } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(public mainSVC: MainsvcService) { }

  currentHash: String = null;

  loading=null;
  error=null;
  outputTo=null;

  data:{
    validCompletions?:any,
    cCompletions?:any,
    dirCompletions?:any,
    countCompletions?:[{result:string,count:number}],
    total:number
  }=<any>{};

  ngOnInit() {
    this.processData();
  }

  getEstimatedPayout(){
    let totalValid=<number> this.data.validCompletions.length
    return (+(totalValid*this.mainSVC.config.payPerCompletion)).toFixed(2) +''+this.mainSVC.config.paymentCurrency;
  }

  async createNewDb(){
    this.outputTo=await this.mainSVC.createOrbitDatabase();
  }

  async createNewKeys(){
    let keys=await this.mainSVC.genKeys();
    this.outputTo=keys.publicKey+"\r\n\r\n"+keys.privateKey;
  }

  processData(){
    var _self=this;
    _self.loading="Loading OrbitDb Log...";
    window['Enumerable']=Enumerable;
    var completions=Enumerable.from(Object.keys(this.mainSVC.hashCompletions)).select(p=>this.mainSVC.hashCompletions[p]).toArray();
    var validCompletions=[];
    var cCompletions={};
    completions.forEach(compl => {
      window['root']=compl.root;
      let resultCheck= (this.mainSVC.config.jobPaymentRule && this.mainSVC.config.jobPaymentRule.length>3) ? eval(_self.mainSVC.config.jobPaymentRule):true;
      if (resultCheck){
        validCompletions.push(compl);
        var simpleCompletionString=this.mainSVC.getCompletionSimpleResult(compl);
        if (!cCompletions[simpleCompletionString]) cCompletions[simpleCompletionString]=[];
        cCompletions[simpleCompletionString].push(compl);
      }
    });
    var dirCompletions=Object.keys(cCompletions);

    this.data={
      validCompletions:validCompletions,
      cCompletions:cCompletions,
      dirCompletions:dirCompletions,
      countCompletions:<any>Enumerable.from(dirCompletions).select(p=><any>{result:p,count:cCompletions[p].length}).toArray(),
      total:completions.length
    }
    _self.loading=null;
  }

}
