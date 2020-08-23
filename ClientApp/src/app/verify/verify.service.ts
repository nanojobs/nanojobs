import { Injectable } from '@angular/core';
import { promise } from 'protractor';
import { MainsvcService } from '../mainsvc.service';
import { count } from 'rxjs/operators';
import * as Enumerable from 'linq';

@Injectable({
  providedIn: 'root'
})
export class VerifyService {


  idb: IDBOpenDBRequest;
  db: IDBDatabase;


  constructor(public mainSvc:MainsvcService) {

  }

  async importJobCompletions(resolve=undefined) {
    var _self = this;
    var element = document.createElement('div');
    element.innerHTML = '<input type="file">';
    var fileInput = <HTMLInputElement>element.firstChild;

    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];

      if (file.name.match(/\.(txt|json)$/)) {
        var reader = new FileReader();

        reader.onload = async function () {
          var jobj = JSON.parse(reader.result as string);
          if (jobj && Object.keys(jobj).length > 0) {
            let vobj=jobj[Object.keys(jobj)[0]];
            let wallet='';
              let email='';
              if (vobj.createdBy){
                wallet=vobj.createdBy.split(' ')[0];
                email=(vobj.createdBy as string).substring(wallet.length+1);
              }
            _self.addJob({
              job_hash:vobj.dirhash
            });
           
            let counter=0;
            let valid_counter=0;
            let hashs=[];
            for (var hash in jobj) {
              let obj=jobj[hash];
              counter++;
              var simple_result=_self.mainSvc.getCompletionSimpleResult(obj);
              window['root']=obj.root;
              window['Enumerable']=Enumerable;
              let resultCheck= (_self.mainSvc.config.jobPaymentRule && _self.mainSvc.config.jobPaymentRule.length>3) ? eval(_self.mainSvc.config.jobPaymentRule):true;
              if (resultCheck) valid_counter++;

              _self.addImage({
                imagejob_hash:obj.dirhash+"_"+hash,
                image_hash:hash,
                job_hash:obj.dirhash
              });

              _self.addCompletion({
                hash_wallet:hash+"_"+wallet,
                image_hash:hash,
                job_hash:obj.dirhash,
                wallet:wallet,
                email:email,
                simple_result:simple_result
              });
            }

            _self.addJob({
              job_hash:vobj.dirhash
            });

            _self.addJobWallet({
              job_wallet:vobj.dirhash+"_"+wallet,
              job_hash:vobj.dirhash,
              wallet:wallet,
              email:email,
              total:counter,
              valid:valid_counter
            });

            if (resolve!=undefined){
              resolve();
            }
          }

          console.log(jobj);
        };

        reader.readAsText(file);
      } else {
        alert("File not supported, .txt or .json files only");
      }
    });

    fileInput.click();
  }


  async addJob(job) {
    if (!this.db) this.db = await this.loadDB();
    let jobStore = this.db.transaction("jobs", "readwrite").objectStore("jobs")
    jobStore.add(job);
    console.log('job stored');
  }

  async addImage(img) {
    if (!this.db) this.db = await this.loadDB();
    let jobStore = this.db.transaction("images", "readwrite").objectStore("images")
    jobStore.add(img);
    console.log('img stored');
  }

  async addCompletion(completion) {
    if (!this.db) this.db = await this.loadDB();
    let completionsStore = this.db.transaction("completions", "readwrite").objectStore("completions")
    completionsStore.add(completion);
    console.log('completion stored');
  }

  async addJobWallet(jobwallet) {
    if (!this.db) this.db = await this.loadDB();
    let jobwalletStore = this.db.transaction("jobwallet", "readwrite").objectStore("jobwallet")
    jobwalletStore.add(jobwallet);
    console.log('completion stored');
  }

  getJobs() {
    return new Promise<{job_hash:string}[]>(async (resolve, reject) => {
      if (!this.db) this.db = await this.loadDB();
      let jobStore = this.db.transaction("jobs", "readwrite").objectStore("jobs")
      jobStore.getAll().onsuccess = (event) => {
        resolve((event.target as IDBRequest).result)
      }
    });
  }

  getJobWallets(job_hash:string) {
    return new Promise<{job_hash:string}[]>(async (resolve, reject) => {
      if (!this.db) this.db = await this.loadDB();
      var ret=[];
      let jobwalletStore = this.db.transaction("jobwallet", "readwrite").objectStore("jobwallet")
      let idx=jobwalletStore.index("job_hash");
      var singleKeyRange = IDBKeyRange.only(job_hash);
      idx.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = (event.target as IDBRequest).result;
        if (cursor) {
          // Do something with the matches.
          console.log(cursor);
          ret.push(cursor.value);
          cursor.continue();
        } else {
          resolve(ret);
        }
      };
    });
  }

  getImageCompletions(job_hash:string) {
    return new Promise<any>(async (resolve, reject) => {
      if (!this.db) this.db = await this.loadDB();
      var ret=[];
      let jobwalletStore = this.db.transaction("completions", "readwrite").objectStore("completions")
      let idx=jobwalletStore.index("job_hash");
      var singleKeyRange = IDBKeyRange.only(job_hash);
      var dic={};
      var dicWallets={};
      var wallets=[];
      idx.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = (event.target as IDBRequest).result;
        if (cursor) {
          // Do something with the matches.
          let comp=cursor.value;
          if (dicWallets[comp.wallet]==undefined){
            wallets.push(comp.wallet);
            dicWallets[comp.wallet]=[];
          }
          dicWallets[comp.wallet].push(comp);

          if (dic[comp.image_hash]==undefined){
            ret.push(comp.image_hash);
            dic[comp.image_hash]=[];
          }

          dic[comp.image_hash].push(comp);
          
          cursor.continue();
        } else {
          resolve({
            images_hashs:ret,
            images_dic:dic,
            wallets:wallets,
            wallets_dic:dicWallets
          });
        }
      };
    });
  }

  getImgs() {
    return new Promise<{image_hash:string,job_hash:string,imagejob_hash:string}[]>(async (resolve, reject) => {
      if (!this.db) this.db = await this.loadDB();
      let imgStore = this.db.transaction("images", "readwrite").objectStore("images")
      imgStore.getAll().onsuccess = (event) => {
        resolve((event.target as IDBRequest).result)
      }
    });
  }

  loadDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {

      var _self = this;
      console.log("abrindo db");
      this.idb = indexedDB.open("nanojobs.eth");

      if (this.idb != null) {

        this.idb.onsuccess = function (event) {
          console.log("success db");
          resolve((event.target as IDBOpenDBRequest).result);
        }

        this.idb.onupgradeneeded = function (event) {
          console.log("upgrade db");
          // Create an objectStore for this database
          var jobStore = (event.target as IDBOpenDBRequest).result.createObjectStore("jobs", { keyPath:"job_hash" });
          var completionsStore = (event.target as IDBOpenDBRequest).result.createObjectStore("completions", { keyPath: "hash_wallet"});
          completionsStore.createIndex("image_hash","image_hash", { unique: false });
          completionsStore.createIndex("job_hash","job_hash", { unique: false });
          completionsStore.createIndex("wallet","wallet", { unique: false });
          completionsStore.createIndex("email","email", { unique: false });
          completionsStore.createIndex("simple_result","simple_result", { unique: false });

          var jobwalletStore= (event.target as IDBOpenDBRequest).result.createObjectStore("jobwallet", { keyPath: "job_wallet"});
          jobwalletStore.createIndex("job_hash", "job_hash", { unique: false });
          jobwalletStore.createIndex("wallet", "wallet", { unique: false });
          jobwalletStore.createIndex("email", "email"), { unique: false };

          var imageStore= (event.target as IDBOpenDBRequest).result.createObjectStore("images", { keyPath: "imagejob_hash"});
          imageStore.createIndex("image_hash","image_hash", { unique: false })
          imageStore.createIndex("job_hash","job_hash", { unique: false })
      
        }
      }

      console.log("OK");
    });
  };


}
