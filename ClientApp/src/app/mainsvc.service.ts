import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { stripSummaryForJitFileSuffix } from '@angular/compiler/src/aot/util';


@Injectable({
  providedIn: 'root'
})
export class MainsvcService {

  public AppTitle: string = "nanojobs.eth";
  public _currentScreen = "current_job";
  public get CurrentScreen():string{
    return this._currentScreen;
  }
  public set CurrentScreen(v){
    var _self=this;
    window.history.pushState(v,v);
    this._currentScreen=v;
    
    window.onpopstate = function(event) {
      if ((typeof event.state)=='string'){
        _self.CurrentScreen=event.state;
      }
      
    }
  }

  public menu: MatDrawer;
  public ipfsnode: any = null;

  public loadingDirectory = false;

  public odb: any = null;

  public odbEvents = null;

  public hashCompletions: any = null;

  public fileIndex = null;
  public fileList = [];

  public jobsList = [];

  public fileHashs = [];
  public currentHash = null;
  public dirHash = null;
  public guideString = null;

  public walletAddress = null;
  public emailAddess = null;

  public publicKey: CryptoKey = null;
  public privateKey: CryptoKey = null;

  public config: {
    eventlog: string,
    jobWallet: string,
    jobPaymentRule: string,
    payPerCompletion: number,
    paymentCurrency: string,
    batchSize: number,
    app_bar_tittle: string,
    app_bar_color: string,
    email: string
  } = null;

  public rsa = null;

  constructor() {

  }

  async importPublicKey(keystr: string) {
    const pemContents = keystr.split('\n')[1].trim();
    const binaryDerString = atob(pemContents);
    const binaryDer = this.str2ab(binaryDerString);
    return await window.crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );
  }

  async importPrivateKey(keystr: string) {
    const pemContents = keystr.replace('\r', '').replace('\r', '').replace('\r', '').replace('\r', '').replace('\r', '').split('\n')[1].trim();
    const binaryDerString = atob(pemContents);
    const binaryDer = this.str2ab(binaryDerString);
    return await window.crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      <any>{
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["decrypt"]
    );
  }

  async genKeys() {
    let keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    );

    var pubkStr = "";
    var prikStr = "";

    var pubk = await window.crypto.subtle.exportKey(
      "spki", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
      keyPair.publicKey //can be a publicKey or privateKey, as long as extractable was true
    );
    pubkStr = `-----BEGIN PUBLIC KEY-----\n${btoa(this.ab2str(pubk))}\n-----END PUBLIC KEY-----`;

    var prik = await window.crypto.subtle.exportKey(
      "pkcs8", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
      keyPair.privateKey //can be a publicKey or privateKey, as long as extractable was true
    );
    prikStr = `-----BEGIN PRIVATE KEY-----\n${btoa(this.ab2str(prik))}\n-----END PRIVATE KEY-----`

    return {
      privateKey: prikStr,
      publicKey: pubkStr
    }
  }

  /*
  Convert  an ArrayBuffer into a string
  from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
  */
  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  /*
Convert a string into an ArrayBuffer
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
  str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  async broadcryst(_msg: string, _actionName: string) {
    try {
      let encoded = this.str2ab(_msg);
      let buffermsg = await window.crypto.subtle.encrypt("RSA-OAEP",
        this.publicKey,
        encoded);
      let cmsg = btoa(this.ab2str(buffermsg));
      let strTS = (new Date()).toISOString();
      let toSend = JSON.parse(JSON.stringify({ ts: strTS, payload: cmsg, action: _actionName, wallet: this.walletAddress }));
      let db = this.odbEvents;
      db.add(toSend);
    } catch (error) {
      console.log(error);
    }

  }

  async enc(_msg) {
    let encoded = this.str2ab(_msg);
    let buffermsg = await window.crypto.subtle.encrypt("RSA-OAEP",
      this.publicKey,
      encoded);
    let cmsg = btoa(this.ab2str(buffermsg));
    return cmsg;
  }

  async dec(cmsg) {
    let encoded = this.str2ab(atob(cmsg));
    let buffermsg = await window.crypto.subtle.decrypt("RSA-OAEP",
      this.privateKey,
      encoded);
    let msg = (this.ab2str(buffermsg));
    return msg;
  }

  async loadOrbit() {
    await this.odbEvents.load(10);
  }

  async createOrbitDatabase() {
    let dbName = prompt("Enter your OrbitDb Name:", "evt");
    let newDb = await this.odb.create(dbName, 'eventlog', {
      overwrite: true,
      accessController: {
        write: ['*']
      },
      replicate: true
    });
    return (newDb.id);
  }

  async LoadData(workDirHash: String) {
    var _self = this;
    this.dirHash = workDirHash;
    var completionsString = localStorage.getItem(workDirHash + "_completions");
    var email = localStorage.getItem(workDirHash + "_email");
    var eth = localStorage.getItem(workDirHash + "_eth");

    if (eth != null) {
      this.walletAddress = eth;
      var jobsListStr = localStorage.getItem("nanojobs.eth_" + eth);
      if (jobsListStr != null && jobsListStr.length > 2) {
        this.jobsList = JSON.parse(jobsListStr);
      } else {
        this.jobsList = [];
      };

      if (this.jobsList.indexOf(workDirHash) < 0) {
        this.jobsList.push(workDirHash);
        localStorage.setItem("nanojobs.eth_" + eth, JSON.stringify(this.jobsList));
      }

      await this.checkIpfsNode();

      var configStr = await this.GetStringFromDirectoryHash(workDirHash, "/config.json");
      if (configStr != null && configStr.length > 3) {
        this.config = JSON.parse(configStr);
      } else {
        this.config = <any>{
          eventlog: "/orbitdb/zdpuAnMqXaQCsYBZKSMWT37JZP2fjp1qqUJ19asrfX465vM2p/evt",
        };
      }
      let keyStr = await this.GetStringFromDirectoryHash(workDirHash, "/public.key");
      this.publicKey = await this.importPublicKey(keyStr);

      // this.odbEvents = await this.odb.create('evt','eventlog',{
      //   accessController:{
      //     write:['*']
      //   },
      //   replicate:true
      // });
      // this.odbEvents = await this.odb.open('/orbitdb/QmTugn3dhmEca7k3nVDJZqgYr4TVtV3hkfUPx3tfzqECjj/dododo', {
      //   type: 'eventlog'
      // });

      (window as any).OrbitDB.createInstance(this.ipfsnode).then(async _odb => {
        this.odb = _odb;
        this.odbEvents = await this.odb.log(this.config.eventlog);

        let db = this.odbEvents;

        db.events.on('load', (dbname) => {
        })
        db.events.on('peer', (peer) => {
          console.log('peer ' + peer);
        })

        db.events.on('synced', (res) => {
          console.log('db synced', res);
        });
        db.events.on('load.progress', (address, hash, entry, progress, total) => {
          console.log('db - load.progress', progress, total);
        });

        db.events.on('replicated', (address) => {
          //this.odbEvents.load(-1);
        })
        db.events.on('replicate', (address) => {
        })
        
        db.events.on('replicate.progress', (address) => console.log('db - replicate progress', address) );



        db.events.on('ready', (dbname, heads) => {
          console.log(dbname);

          var all = db.iterator({ limit: -1 })
            .collect()
            .map((e) => e.payload.value);
          // [{ name: 'User1' }]

          console.log(all);
        })
        // db created & opened

        db.events.on('write', (address, entry, heads) => {
          console.log(entry);

        })
      })



      //await db.load(10);



    }
    if (email != null) {
      this.emailAddess = email;
    }

    this.hashCompletions = JSON.parse(completionsString);
    if (this.hashCompletions == null || this.hashCompletions == undefined) {
      this.hashCompletions = {};
    }
  }

  GetParamOrDefault(field: string, defaultValue: string = null) {
    var hash = "";
    var ret = defaultValue!=null?defaultValue:"";
    if (window.location.hash.length > 3) {
      hash = window.location.hash.substring(1);
      if (field == 'hash') ret = hash;
    } else if (window.location.search.length > 3) {
      var srch = window.location.search.substring(1).split('&');
      srch.forEach(pair => {
        var values = pair.split('=');
        if (values[0] == field) {
          ret = values[1];
        }
        if (values[0] == 'hash') {
          hash = values[1];
        }
      });
    }

    if (field == 'hash' && hash == '') {
      var chash = localStorage.getItem("current_hash");
      if (chash != null) {
        hash = chash;
        ret = hash;
      }
    }

    return ret;
  }

  importMasterPrivateKey() {
    var _self = this;
    var element = document.createElement('div');
    element.innerHTML = '<input type="file">';
    var fileInput = <HTMLInputElement>element.firstChild;

    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];

      if (file.name.match(/\.(txt|key)$/)) {
        var reader = new FileReader();

        reader.onload = function () {
          let strKey = <string>reader.result;
          _self.importPrivateKey(strKey).then(k => {
            _self.privateKey = k;
          })
        };

        reader.readAsText(file);
      } else {
        alert("File not supported, .key files only");
      }
    });

    fileInput.click();
  }

  async importBackup() {
    var _self = this;
    var element = document.createElement('div');
    element.innerHTML = '<input type="file">';
    var fileInput = <HTMLInputElement>element.firstChild;

    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];

      if (file.name.match(/\.(txt|json)$/)) {
        var reader = new FileReader();

        reader.onload = function () {
          localStorage.setItem(_self.dirHash + "_completions", <string>reader.result)
          window.location.reload();
        };

        reader.readAsText(file);
      } else {
        alert("File not supported, .txt or .json files only");
      }
    });

    fileInput.click();
  }

  exportBackup() {
    var content = JSON.stringify(this.hashCompletions);
    this.download(content, this.dirHash + '.json', "application/json")
  }

  download(content, filename, contentType) {
    if (!contentType) contentType = 'application/octet-stream';
    var a = document.createElement('a');
    var blob = new Blob([content], { 'type': contentType });
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  updateCompletion(directoryHash: string, fileHash: string, completion) {
    completion['filehash'] = fileHash;
    completion['dirhash'] = directoryHash;
    if (this.hashCompletions == null) this.hashCompletions = {};
    var old = this.hashCompletions[fileHash];
    this.hashCompletions[fileHash] = completion;
    if (old != completion) {
      localStorage.setItem(directoryHash + "_completions", JSON.stringify(this.hashCompletions));
    }
    let cmsg = this.getCMsg(directoryHash, fileHash, completion);

    this.broadcryst(cmsg, "submit");
  }

  getCompletionSimpleResult(completion) {
    let cmsg = "";
    completion.root.children.forEach(element => {
      if (element.name == 'choice') {
        let idx = 0;
        element.children.forEach(choice => {
          if (choice.selected == true) {
            cmsg += (cmsg.length > 0 ? "," : "") + choice.value;
          }
          idx++;
        });
      }
    });
    if (cmsg==""){
      try{
      cmsg=window['finddeeper'](completion.root).value;
      }catch(err){}
      if (cmsg==null) cmsg='';
    }
    return cmsg;
  }
  getCMsg(directoryHash, fileHash, completion) {
    let cmsg = directoryHash + "|" + fileHash;
    cmsg += "|" + this.getCompletionSimpleResult(completion);
    return cmsg;
  }

  async GetTaskConfigFromDirectoryHash(hash: String) {
    await this.checkIpfsNode();
    if (this.hashCompletions == null) {
      await this.LoadData(hash);
    }
    const stream = this.ipfsnode.cat(hash + '/config.xml');
    let data = ''

    for await (const chunk of stream) {
      data += chunk.toString();
    }

    return data;
  }

  async GetStringFromDirectoryHash(hash: String, path: String) {
    await this.checkIpfsNode();
    const stream = this.ipfsnode.cat(hash + '' + path);
    let data = ''

    for await (const chunk of stream) {
      data += chunk.toString();
    }

    return data;
  }

  async GetFileListFromDirectoryHash(hash: String, updateProgressAction = null) {
    await this.checkIpfsNode();
    var nextHash = null;
    if (this.fileIndex == null) {
      this.loadingDirectory = true;
      this.fileList = [];
      this.fileHashs = [];
      this.fileIndex = {};

      try {

        for await (const file of this.ipfsnode.ls(hash)) {
          if (file.name.indexOf('.xml') == -1 && file.name.indexOf('.html') == -1 && file.name.indexOf('.json') == -1 && file.name.indexOf('.orbitdb') == -1 && file.name.indexOf('.key') == -1) {
            this.fileList.push(file);
            this.fileIndex[file.cid.string] = file;
            this.fileHashs.push(file.cid.string);
            console.log("Loading file: " + file.cid.string);
            if (updateProgressAction != null) {
              setTimeout(() => {
                updateProgressAction(file.cid.string);
              }, 10);
            }
            if (this.hashCompletions[file.cid.string] == null || this.hashCompletions[file.cid.string] == undefined) {
              nextHash = file.cid.string;
            }
          }
        }
      } catch (error) {
      }
      this.loadingDirectory = false;
    } else {
      var fileList = this.fileList;
      var fileHashIndex = this.fileIndex;
      var filesHashs = this.fileHashs;

      var cidx = this.fileHashs.indexOf(this.currentHash);
      cidx = this.fileHashs.length;
      var ret = null;
      while (cidx > 0 && ret == null) {
        cidx--;
        var newHash = this.fileHashs[cidx];
        if (this.hashCompletions[newHash] == undefined || this.hashCompletions[newHash] == null) {
          ret = newHash;
        }
      }
      nextHash = ret;
    }

    return { fileList: this.fileList, index: this.fileIndex, hashs: this.fileHashs, next: nextHash };
  }

  async GetFileUrlFromDirectoryHash(hash: String) {
    const stream = this.ipfsnode.cat(hash);
    let data = null;

    for await (const chunk of stream) {
      // chunks of data are returned as a Buffer, convert it back to a string
      data = chunk;
    }

    var arrayBufferView = new Uint8Array(data);
    var blob = new Blob([data], { type: "image/jpeg" });
    var urlCreator = window.URL || window['webkitURL'];
    var imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
  }

  async checkIpfsNode() {
    if (this.ipfsnode == null) {
      this.ipfsnode = await window['Ipfs'].create({
        repo: 'myrepo',
        pubsub: true,
        EXPERIMENTAL: {
          pubsub: true
        }
        , config: {
          Addresses: {
            Swarm: [
              // This is a public webrtc-star server
              '/dns4/fierce-gorge-02924.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
              '/dns4/peaceful-ocean-78341.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
              '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
              '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',

              //'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
              //'/ip4/127.0.0.1/tcp/9090/wss/p2p-webrtc-star'
            ]
          },
          // If you want to connect to the public bootstrap nodes, remove the next line
          //Bootstrap: ['/ip4/177.95.228.226/tcp/4001/p2p/QmeSWa6nqZKJBxw4FNs4kQhuLsvRHnjo1eBzvcdYHpZ6Vb']
        }
      });

    }
  }




  // async testIpfs() {

  //   const cid = 'QmSNo2iUbKppZjc1rW6s4pnNXYofCvNntfuki78EVRyWb3'

  //   window['listfs']='';
  //   for await (const file of node.ls(cid)) {
  //     console.log(file.path)
  //     window['listfs']+=(file.name)+"\r\n";
  //   }

  //   const stream =node.cat('QmSNo2iUbKppZjc1rW6s4pnNXYofCvNntfuki78EVRyWb3/20191031183509_frame_63286-obj_270-track_306-dir_right_124-type_CAMINHAO-class_-eixos_3.jpg')
  //   let data = ''

  //   for await (const chunk of stream) {
  //     // chunks of data are returned as a Buffer, convert it back to a string
  //     data = chunk;
  //   }

  //   var arrayBufferView = new Uint8Array( data );
  //   var blob = new Blob( [ data ], { type: "image/jpeg" } );
  //   var urlCreator = window.URL || window.webkitURL;
  //   var imageUrl = urlCreator.createObjectURL( blob );

  //   //var bytes = new Uint8Array(data);
  //   var data2= "data:image/jpg;base64," + this.encode(data)
  //   var img = document.querySelector( "#imgtest" );
  //   img.src = data2;
  //   console.log(imageUrl)
  // }

  // public method for encoding an Uint8Array to base64
  // Shamelessly stolen off some stackoverflow response
  encode(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
      chr1 = input[i++];
      chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
      chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
        keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
  }

}
