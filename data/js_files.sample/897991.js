// module Lingr {{{

Lingr = {
  api_root: "http://lingr.com",
  observe_root: "http://lingr.com:8080",
  api_key: "538oWw",
  url: function(path,observe) {
      return (observe ? Lingr.observe_root : Lingr.api_root)+"/api"+path;
  },
  yakisoba: function(target,func){
    if(func){
      return function() { func.apply(target,arguments);};
    }else{
      return function() {};
    }
  }
};

//   class Lingr::API {{{

Lingr.API = function(username,password,session){ // initialize {{{
  Ti.API.info("Lingr.API: created");
  this.rooms = {};
  this.connected = false;
  this.observing = false;
  this.counter = null;
  this.observe_i = null;
  this.requesting = null;
  this.flag = false;
  this.session = {id: session};
  this.unsession();
  this.session.id = session;
  this.when_login_failed = this.empty_function;
  this.on_message = this.empty_function;
  this.on_member = this.empty_function;
  this.on_presence = this.empty_function;
  this.on_event = this.empty_function;
  this.on_error = this.empty_function;
  this.on_failure = this.empty_function;
  this.sign_with(username,password);
  Ti.API.info("Lingr.API: initialized");
}; // }}}

Lingr.API.prototype.empty_function = function() {};

Lingr.API.prototype.error_in_request = function(error) {
  this.on_error(error);
};

Lingr.API.prototype.unsession = function() { // {{{
  this.session = {
    id: null,
    pub: null,
    nick: null,
    username: null,
    verified: false
  };
}; // }}}

Lingr.API.prototype.set_session = function(json) { // {{{
  Ti.API.info("Lingr: set_session()");
  this.session = {
    id: json.id,
    pub: json.public_id,
    nick: json.nickname,
    username: json.user.username,
    verified: true
  };
}; // }}}

Lingr.API.prototype.sign_with = function(username,password) { // {{{
  this.username = username;
  this.password = password;
  return this;
}; // }}}

// params.url or path = requesting url.
// params.observe = observe? needed when params.path
// params.method = GET|POST
// params.data = data for get/post. when get, it will be appended to url.
// params.(success|failure|error|complete) = callback functions.
// params.append_session = append session id (default: true)
Lingr.API.prototype.request = function(params) { // {{{
  params.error    = Lingr.yakisoba(this,params.error);
  if(params.observe && !this.session.id){
    return {error: "No Session", result: false};
  }
  if(Titanium.Network.online == false) {
    this.error_in_request("Network Unreachable");
    params.error("Network Unreachable");
    return {error: "Network unreachable", result: false};
  }
  var method = params.method || "POST";
  var url = params.url || Lingr.url(params.path,params.observe);
  //var isjson = true;
  //if(params.json != undefined) { isjson = params.json; }
  var data = params.data||{};
  if(this.session.id && !params.append_session) {
    data.session = this.session.id;
  }

  params.success  = Lingr.yakisoba(this,params.success);
  params.failure  = Lingr.yakisoba(this,params.failure);
  params.complete = Lingr.yakisoba(this,params.complete);

  var http = Titanium.Network.createHTTPClient();
  //if(isjson) {
  http.onload = function(){
    Ti.API.info("HTTP Request Done: "+method+" "+url+" "+data.session);
    Ti.API.info("HTTP Request JSON: "+this.responseText);
    var json = JSON.parse(this.responseText);
    if(!json&&params.observe){
      return;
    }
    if(json&&json.status == 'ok') {
      params.success(json);
    }else{
      params.failure(json);
    }
    params.complete(json);
  };
  /*}else{
    http.onload = function(){
      (this.empty_function || params.success)(this.responseText);
      (this.empty_function || params.complete)(this.responseText);
    };
  }*/
  http.onerror = Lingr.yakisoba(this,function(error) {
    Ti.API.info("HTTP Request error: "+method+" "+url+"\n->"+error);
    this.error_in_request(error);
    params.error(error);
    params.complete(error);
  });

  if(params.observe){
    this.requesting = http;
  }

  if(method != "GET" && data) {
    Ti.API.info("HTTP Request: "+method+" "+url);
    http.open(method, url);
    http.send(data);
  }else{
    http.open(method, url)// + "?" + data);
    http.send(data);
  }

  return {result: true};
}; // }}}

Lingr.API.prototype.connect = function(success,failure) { // {{{
  Ti.API.info("Lingr: connect");
  if(!this.session.verified) {
    this.signin(Lingr.yakisoba(this,function() {
      Lingr.yakisoba(this,this.connect)(success,failure);
    }),failure);
  }else{
    this.get_rooms(Lingr.yakisoba(this,function(json){
      Ti.API.info("Lingr: connect -> get_rooms");
      this.subscribe(success,failure);
    }),failure);
  }
}; // }}}

Lingr.API.prototype.disconnect = function() {
  Ti.API.info("Lingr: disconnect");
  this.stop();
  this.request({
    path: '/session/destroy',
    success: Lingr.yakisoba(this,function(json){
      Ti.API.info("Lingr: bye bye my session...");
      this.unsession();
    }),
    failure: Lingr.yakisoba(this,function(json){
      this.unsession();
    })
  });
};

Lingr.API.prototype.signin = function(success,failure) { // {{{
  if(this.session.id) {
    // verify
    Ti.API.info("Lingr: Verify Session "+this.session.id);
    this.request({
      path: "/session/verify",
      success: function(json) {
        Ti.API.info("Lingr: Verified.");
        this.set_session(json.session);
        success(json.session);
        this.flag = true;
      },
      failure: function(json) {
        Ti.API.info("Lingr: Session Expired.");
        this.unsession();
        this.signin(success,failure);
        this.flag = true;
      }
    });
  }else{
    this.request({
      path: "/session/create",
      data: {user: this.username,
             password: this.password,
             api_version: "2"},
      success: Lingr.yakisoba(this,function(json) {
        Ti.API.info("Lingr: Session Created");
        this.set_session(json.session);
        success(json.session);
      }),
      failure: Lingr.yakisoba(this,function(json) {
        this.unsession();
        this.when_login_failed();
        if(failure) {
          failure(json);
        }
      })
    });
  }
}; // }}}

Lingr.API.prototype.test = function(callback) { // {{{
  this.when_login_failed = function(){};
  this.unsession();
  this.signin(function() {
    callback(true);
    // this.disconnect();
  },function() {
    callback(false);
  });
}; // }}}

Lingr.API.prototype.start = function() { // {{{
  this.observe(Lingr.yakisoba(this,function(){
    this.observe_i = setTimeout(Lingr.yakisoba(this,this.start),50);
  }),Lingr.yakisoba(this,function(){
    this.connected = false;
  }));
  this.connected = true;
}; //}}}

Lingr.API.prototype.stop = function() { // {{{
  if(this.observe_i) {
    clearTimeout(this.observe_i);
  }
  if(this.requesting) {
    this.requesting.abort();
  }
  this.connected = false;
}; // }}}

Lingr.API.prototype.observe = function(success,failure) { // {{{
  Ti.API.info("Lingr: observe()");
  this.request({
    path: '/event/observe',
    method: "GET",
    observe: true,
    data: {counter: this.counter},
    success: function(json) {
      Ti.API.info("Lingr: observe success");
      if(json.counter) {
        this.counter = Math.max(json.counter, this.counter);
      }
      if(json.events) {
        for(var i=0; i<json.events.length; i++) {
          var e = json.events[i];
          var room;
          if(e.message) {
            room = this.rooms[e.message.room];
            var mes = room.add_message(e.message);
            this.on_message(mes);
          }else if(e.presence) {
            room = this.rooms[e.presence.room];
            room.presence(e.presence);
            this.on_presence(e.presense);
          }else if(e.membership) {
            room = this.rooms[e.membership.room];
            room.membership(e.membership);
            this.on_member(e.membership);
          }
        }
      }
      success(json);
    },
    failure: function(json) {
      if(this.on_failure) {
        this.on_failure("observe","Failed to observe",json);
      }
      failure(json);
    }
  });
}; // }}}

Lingr.API.prototype.get_rooms = function(callback,failure) { // {{{
  Ti.API.info("Lingr: get_rooms");
  this.request({
    path: '/user/get_rooms',
    success: function(json) {
      Ti.API.info("Lingr: get_rooms succeeded");
      var r = json.rooms.join(',');
      this.request({
        path: '/room/show',
        data: {rooms: r,
               "with": "messages,roster"},
        success: function(ison) {
          Ti.API.info("Lingr: room/show succeeded");
          this.rooms = {};
          for(var i=0;i<ison.rooms.length;i++){
            this.rooms[ison.rooms[i].id] = new Lingr.Room(this,ison.rooms[i]);
          }
          callback(json);
        },
        failure: function(json){
          if(this.on_failure) {
            this.on_failure("room_show","Failed to show room",json);
          }
          if(failure){ failure(json); };
        }
      });
    },
    failure: function(json){
      if(this.on_failure) {
        this.on_failure("get_rooms","Failed to get rooms",json);
      }
      if(failure){ failure(json); };
    }
  });
}; // }}}

Lingr.API.prototype.say = function(room,text,success,failure) {
  this.request({
    path: '/room/say',
    data: {room: room.id,
           text: text},
    success: success,
    failure: failure
  });
};

Lingr.API.prototype.subscribe = function(success,failure) { //{{{
  var ro = [];
  for(var key in this.rooms){ if(this.rooms[key]) { ro.push(key); } }
  Ti.API.info("Lingr: subscribe()");
  var r = ro.join(',');
  this.request({
    path: "/room/subscribe",
    data: {rooms: r},
    success: function(json) {
      this.counter = json.counter;
      if(success){ success(json); };
    },
    failure: function(json) {
      if(this.on_failure) {
        this.on_failure("subscribe","Failed to subscribe",json);
      }
      if(failure) {
        failure(json);
      }
    }
  });
}; // }}}

//   end # Lingr::API }}}

//   class Lingr::Room {{{

Lingr.Room = function(lingr,room) {
  this.lingr = lingr;

  this.on_member = lingr.empty_function;
  this.on_presence = lingr.empty_function;
  this.on_message = lingr.empty_function;

  this.messages = [];
  this.members = {};
  this.bots = {};

  this.id = room.id;
  this.name = room.name;
  this.description = room.blurb;
  this.is_public = room.is_public;

  var m;

  for(var i=0; i<room.messages.length; i++) {
    this.add_message(room.messages[i],true);
  }
  for(i=0; i<room.roster.members.length; i++) {
    m = room.roster.members[i];
    this.members[m.username] = m;
  }
  for(i=0; i<room.roster.bots.length; i++) {
    m = room.roster.bots[i];
    this.bots[m.id] = m;
  }
};

Lingr.Room.prototype.say = function(text,success,failure) {
  return this.lingr.say(this,text,success,failure);
};

Lingr.Room.prototype.presence = function(presence) {
  Ti.API.info("Lingr.Room: presence()");
  if(this.members[presence.username]) {
    this.members[presence.username].is_online = (presence.type == "online");
  }
  this.on_presence(presence);
};

Lingr.Room.prototype.membership = function(membership) {
  Ti.API.info("Lingr.Room: membership()");
  if(membership.aciton == "join"){
    this.members[membership.username] = membership;
  }else if(membership.action == "quit"){
    delete this.members[membership.username];
  }
  this.on_member(membership);
};

Lingr.Room.prototype.add_message = function(message,flag) {
  var mes = new Lingr.Message(this.lingr,this,message);
  this.messages.push(mes);
  if(!flag) {
    Ti.API.info("Lingr: room_"+this.id+"->on_message");
    this.on_message(mes);
  }
  return mes;
};


//   end # Lingr::Room }}}

//   class Lingr::Message {{{

Lingr.Message = function(lingr,room,message) {
  this.lingr = lingr;
  this.room = room;
  this.id = message.id;
  this.room_id = message.room;
  this.public_session_id = message.public_session_id;
  this.type = message.type;
  this.username = message.speaker_id;
  this.nickname = message.nickname;
  this.icon_url = message.icon_url;
  this.text = message.text;
  this.time = new Date(message.timestamp);
};

//   end # Lingr::Message }}}

// end # Lingr }}}

// export
exports.Lingr = Lingr;
