import { Component, OnInit, Output } from '@angular/core';
import { MainsvcService } from '../mainsvc.service';
import * as Enumerable from 'linq';

@Component({
  selector: 'app-masterconsole',
  templateUrl: './masterconsole.component.html',
  styleUrls: ['./masterconsole.component.css']
})
export class MasterconsoleComponent implements OnInit {

  constructor(public mainSVC: MainsvcService) { }

  currentHash: String = null;

  loading = null;
  error = null;

  db: any = null;

  data: any = null;
  totalData: any = null;

  ngOnInit() {
    this.initOrbit();
  }

  reload(){
    this.data=null;
    this.totalData=null;
    setTimeout(() => {
      this.db.load(-1);
    }, 500);
  }

  async downloadData(){
    var content = JSON.stringify(this.totalData);
    this.mainSVC.download(content, this.db.address.root+'_'+this.db.address.path + '_orbitdb.json', "application/json")
  }

  async initOrbit() {
    this.db = await this.mainSVC.odb.log(this.mainSVC.config.eventlog);

    let db = this.db;

    db.events.on('load', (dbname) => {
      console.log('load');
    })

    db.events.on('peer', (peer) => {
      console.log('peer ' + peer);

    })

    this.db.events.on('synced', (res) => {
      console.log('db synced', res);
    });
    this.db.events.on('load.progress', (address, hash, entry, progress, total) => {
      console.log('db - load.progress', progress, total);
    });

    db.events.on('replicated', (address) => {
      console.log("replicated");
      db.load(-1);
    })

    db.events.on('replicate', (address) => {
      console.log("replicate");
    })

    
    db.events.on('replicate.progress', (address, hash, entry, progress, have) => {
      console.log(address+"/"+entry);
    });


    db.events.on('ready', (dbname, heads) => {
      console.log(dbname);

      var all = db.iterator({ limit: -1 })
        .collect()
        .map((e) => e.payload.value);
      // [{ name: 'User1' }]


      this.procConsole(all).then(() => {
        console.log('procconsole:OK');
      })
    })


    await db.load(-1);

  }

  async procConsole(all) {
    var decrypteds = [];

    for (let index = 0; index < all.length; index++) {
      const element = all[index];
      if (element.payload && element.action == 'submit' && element.payload.indexOf('�') < 0) {
        let encoded = this.mainSVC.str2ab(atob(element.payload));
        try {
          let pk = this.mainSVC.privateKey;
          let buffermsg = await window.crypto.subtle.decrypt("RSA-OAEP", pk, encoded);
          let cmsg = (this.mainSVC.ab2str(buffermsg));
          var newObj = JSON.parse(JSON.stringify(element));
          newObj.payload = cmsg;
          decrypteds.push(newObj);
        } catch (error) {
          console.log(error)
        }
      }

    }
    this.totalData=decrypteds;
    this.data = Enumerable.from(decrypteds).orderByDescending(p=>p.ts).take(30).toArray();
  }

}
