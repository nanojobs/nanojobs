
finddeeper=function (rootElm){
    var deeper=null;
    try{
    var deepers=__finddeepers(rootElm);
    
    deepers.forEach(element => {
        if (deeper==null || element.innerLevel>deeper.innerLevel) deeper=element;
    });
} catch(err){}
    return deeper;
}

__finddeepers=function (rootElm, nextlevel=0,guid=null,masterroot=null){
    var deeper=null;
    if (guid==null) {
        guid=__uuidv4();
        window['deepers_'+guid]=[];
        masterroot=rootElm;
    }

    if (rootElm.children){
        var visible=true;
        if (rootElm.visiblewhen && rootElm.whentagname){
            visible=false;
            masterroot.children.forEach(child=>{
                if (child.name==rootElm.whentagname){
                    var selecteds=__finddeepers(child,0,null);
                    if (selecteds[0].value==rootElm.whenchoicevalue){
                        visible=true;
                    }
                }
            })
        }
        if (visible) rootElm.children.forEach(child=>{
            if (child.selected){
                deeper=child;
            } else if (child.children) {
                let fd=__finddeepers(child, nextlevel+1,guid,masterroot);
            }
            if (deeper!=null) {
                var objDeeper=JSON.parse(JSON.stringify(deeper));
                objDeeper.innerLevel=nextlevel;
                window['deepers_'+guid].push(objDeeper);
                deeper=null;
            }
        })
    }


    if (nextlevel>0) {
        return deeper;
    }

    deepers=window['deepers_'+guid]
    delete window['deepers_'+guid]
    return deepers;
}

__uuidv4=function () {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }