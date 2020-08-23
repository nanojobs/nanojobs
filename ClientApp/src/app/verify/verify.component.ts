import { Component, OnInit } from '@angular/core';
import { MainsvcService } from '../mainsvc.service';
import { VerifyService } from './verify.service';
import { verifyHostBindings } from '@angular/compiler';
import * as Enumerable from 'linq';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

  constructor(public mainSVC: MainsvcService, public verifySvc: VerifyService) { }

  currentHash: String = null;

  currentJob:string=null;

  jobs = null;


  imagesData=null;

  loading = null;
  error = null;
  outputTo = null;

  ngOnInit() {
    this.loadData();
  }

  getCardStyleFrom(imagesCompletions){
    //console.log(completion);
    let comps=Enumerable.from<any>(imagesCompletions);
    let grps=comps.groupBy(p=>p.simple_result).select(p=> new Object({
      result:p.key(),
      acc:p.count()
    })).toArray();
    let maxcount=Enumerable.from<any>(grps).select(p=>p.acc).max();

    var ret={};
    if (imagesCompletions.length==maxcount){
      ret["background-color"]="#cfefcf";
    } else if (imagesCompletions.length-1==maxcount){
      ret["background-color"]="#ffffdc";
    } else if (maxcount<imagesCompletions.length-1){
      ret["background-color"]="#f5d9d9";
    }

    return ret;
  }

  getStyleFrom(completion,imagesCompletions){
    //console.log(completion);
    let comps=Enumerable.from<any>(imagesCompletions);
    let grps=comps.groupBy(p=>p.simple_result).select(p=> new Object({
      result:p.key(),
      acc:p.count()
    })).toArray();
    let mycount=Enumerable.from<any>(grps).where(p=>p.result==completion.simple_result).select(p=>p.acc).first();
    let maxcount=Enumerable.from<any>(grps).select(p=>p.acc).max();

    var ret={};
    if (mycount==maxcount){
      ret["background-color"]="green";
    } else if (mycount==maxcount-1){
      ret["background-color"]="yellow";
    } else if (mycount<maxcount-1){
      ret["background-color"]="red";
    }

    return ret;
  }

  async openJob(job_hash:string){
    this.currentJob=job_hash;
    this.imagesData=await this.verifySvc.getImageCompletions(job_hash);
  }

  loadData() {
    this.verifySvc.getJobs().then(v => {
      this.jobs = v;
    })
  }

  addNewJobCompletions() {
    var _self = this;
    this.verifySvc.importJobCompletions(function () {
      setTimeout(() => {
        _self.jobWallets={};
        _self.loadData();
      }, 500);
    });
  }

  jobWallets = {};
  getJobWallets(job_hash: string) {

    var ret = [];
    if (this.jobWallets[job_hash] == undefined ) {
      this.verifySvc.getJobWallets(job_hash).then(v => {
        this.jobWallets[job_hash] = v;
      })
    }
    ret = this.jobWallets[job_hash];

    return ret;
  }

}
