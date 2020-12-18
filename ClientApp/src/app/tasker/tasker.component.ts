import { Component, OnInit } from '@angular/core';
import { MainsvcService } from '../mainsvc.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap, map, timeout } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tasker',
  templateUrl: './tasker.component.html',
  styleUrls: ['./tasker.component.css']
})
export class TaskerComponent implements OnInit {

  public static instance: TaskerComponent;
  constructor(public mainSVC: MainsvcService) { TaskerComponent.instance = this; }

  currentHash: String = null;

  loading = null;
  toploading = "";
  error = null;
  showed = false;
  cfg: string = null;

  ngOnInit() {
    this.currentHash = this.mainSVC.GetParamOrDefault("hash");

    if (this.currentHash != null && this.currentHash.length > 3) {
      this.loadHash(this.currentHash);
    } else {
      this.mainSVC.CurrentScreen = "nohash";
    }


    // this.currentHash = this._route.paramMap.pipe(
    //   map((params: ParamMap) =>
    //     params.get("hash")
    //   )
    // );


    // this.currentHash.subscribe((async hashValue => {
    //   this.loadHash(hashValue);
    // }));



  }

  async loadHash(hashValue: String, tmpInside = false) {
    try {
      if (this.mainSVC.config==null) await this.mainSVC.LoadData(hashValue);
      if (this.cfg == null) {
        this.loading = "Loading config.xml ...";
        this.cfg = await this.mainSVC.GetTaskConfigFromDirectoryHash(hashValue);
      }
      if (!this.mainSVC.guideString) {
        this.loading = "Loading instructions...";
        if (this.mainSVC.guideString == null) this.mainSVC.guideString = await this.mainSVC.GetStringFromDirectoryHash(hashValue, "/guide.html");
      }

      if (this.mainSVC.walletAddress != null) {
        if (this.mainSVC.hashCompletions == null || Object.keys(this.mainSVC.hashCompletions).length == 0) {
          let showedGuide = localStorage.getItem(this.mainSVC.dirHash + "_show_guide");
          if (!showedGuide) {
            this.mainSVC.CurrentScreen = "guide";
          }
        }
      } else {
        this.mainSVC.CurrentScreen = "wallet"
      }

      this.mainSVC.CurrentScreen=this.mainSVC.GetParamOrDefault("current_screen",this.mainSVC.CurrentScreen);

      let counter = 0;
      
      var images = await this.mainSVC.GetFileListFromDirectoryHash(hashValue, (fileloaded) => {
        counter++;
        this.loading = "Loading image (" + counter + (this.mainSVC.config!=null&&this.mainSVC.config.batchSize > 0 ? " of " + this.mainSVC.config.batchSize : '') + "): " + fileloaded + "";
        this.toploading = "" + counter + (this.mainSVC.config!=null&&this.mainSVC.config.batchSize > 0 ? " of " + this.mainSVC.config.batchSize : '') + "";

        if (!this.showed && counter > 5 && !tmpInside) {
          this.loadHash(hashValue, true);
        }
      });


      if (images.next != null && !this.showed) {
        this.showed = true;
        var idx = images.hashs.indexOf(images.next);
        var _self = this;
        var hash = images.index[images.next].cid.string;
        var url = await this.mainSVC.GetFileUrlFromDirectoryHash(hash);
        var msvc = this.mainSVC;
        msvc.currentHash = hash;
        console.log(url);
        var labelStudio = new window['LabelStudio']('label-studio', {
          config: _self.cfg,

          interfaces: [
            "panel",
            "update",
            "controls"
          ],

          user: {
            pk: 1,
            firstName: msvc.walletAddress,
            lastName: msvc.emailAddess
          },

          task: {
            completions: [],
            predictions: [],
            id: idx,
            data: {
              image: url,
              hash: hashValue
            }
          },

          onLabelStudioLoad: function (LS) {
            var c = LS.completionStore.addCompletion({
              userGenerate: true
            });
            LS.completionStore.selectCompletion(c.id);
          },

          onSubmitCompletion: function (ls, completion) {
            try {
            var strJson = JSON.stringify(completion);
            msvc.updateCompletion(hashValue.toString(), hash, JSON.parse(strJson));
            {
              _self.showed = false;
              document.getElementById('label-studio').innerHTML = "";
              _self.loadHash(hashValue).then((v) => { });
            }
          } catch (err){}

          },
          onUpdateCompletion: function(ls, completion) {
            try{
            var strJson = JSON.stringify(completion);
            msvc.updateCompletion(hashValue.toString(), hash, JSON.parse(strJson));
            {
              _self.showed = false;
              document.getElementById('label-studio').innerHTML = "";
              _self.loadHash(hashValue).then((v) => { });
            }
          }catch(erro){}
          }
        });

        this.loading = null;
      }

    } catch (error) {
      console.log(error);
      this.loading = null;
      this.error = 'Error on loading ipfs directory hash!';
    }

  }

}
