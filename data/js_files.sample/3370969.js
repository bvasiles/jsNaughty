function APIConnection(){
  var _xhr = null;
  this.getXhr = function(){ return _xhr; };

  this.getVideoDetails = function(video_id, async, success_cb){
    if(async){
      this.executeXHRCall(
        "GET", 
        "../api/videos.php?mode=details&id="+video_id,
        null,
        true,
        success_db
      );
    }else{
      var xhr = this.executeXHRCall(
        "GET", 
        "../api/videos.php?mode=details&id="+video_id,
        null,
        false
      );
      return xhr.responseText;
    }
  }
  this.getRelatedVideos = function(video_id, async, success_cb){
    if(async){
      this.executeXHRCall(
        "GET", 
        "../api/videos.php?mode=related&id="+video_id,
        null,
        true,
        success_db
      );
    }else{
      var xhr = this.executeXHRCall(
        "GET", 
        "../api/videos.php?mode=related&id="+video_id,
        null,
        false
      );
      return xhr.responseText;
    }
  };

  this.executeXHRCall = function(method, url, data, async, success_cb){
    _xhr = new XMLHttpRequest();
    _xhr.open(method, url, async);
    if(async){
      _xhr.onreadystatechange = function() {
        if(_xhr.readyState == 4){
          if(_xhr.status == 200) {
            success_cb(JSON.parse(xhr.responseText), _xhr);
          }else{
            //What to do..
          }
        }
      }
    }
    _xhr.send(data);
    if(!async) return _xhr;
  }
}
