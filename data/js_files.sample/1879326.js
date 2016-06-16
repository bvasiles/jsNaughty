/*global API BUS */

function OfflineBarPartial($parent) {
  this.e = $('<div></div>').addClass('offline_bar').appendTo($parent);
  this.offline = false;
  this.renderIntervalId = undefined;
  this.retryTimeoutId = undefined;
  this.render();

  BUS.on('rpc.connectionerror', this.switchOffline, this);
  BUS.on('api.notification', this.switchOnline, this);
}


OfflineBarPartial.prototype.switchOnline = function () {
  if (this.offline === false)
    return;
  this.offline = false;
  window.clearInterval(this.renderIntervalId);
  this.stopRetries();
  this.render();
}

OfflineBarPartial.prototype.switchOffline = function () {
  if (this.offline === true)
    return;

  var self = this;
  self.offline = true;
  self.retryTime = 1; // In Seconds

  self.startRetries();
  self.render();
  self.renderIntervalId = window.setInterval(function () {
    self.render();
  }, 1000);
};

OfflineBarPartial.prototype.stopRetries = function () {
  window.clearTimeout(this.retryTimeoutId);
  this.retryTimeoutId = undefined;
};

OfflineBarPartial.prototype.startRetries = function () {
  this.doRetry();
};
OfflineBarPartial.prototype.doRetry = function () {
  if (this.offline === false) {
    return;
  }
  var self = this;
  self.retryTimeoutId = window.setTimeout(function () {
    API.wobble_api_version(function (err, result) {
      if (err) {
        self.retryTime = Math.min(self.retryTime * 2, 5 * 60);
        self. doRetry();
      }
      else {
        self.switchOnline();
      }
    });
  }, self.retryTime * 1000);
  self.nextRetryAt = Date.now() + self.retryTime * 1000;
};

OfflineBarPartial.prototype.render = function () {
  if (this.offline) {
    var nextRetrySeconds = Math.floor((this.nextRetryAt - Date.now()) / 1000) + 1;
    var text = '<b>Not connected.</b> ';
    if (nextRetrySeconds <= 0) {
      text += 'Retrying ...';
    } else {
      if (nextRetrySeconds > 60) {
        text += 'Next retry in ' + Math.floor(nextRetrySeconds / 60) + ' minutes';
      } else {
        text += 'Next retry in ' + nextRetrySeconds + 's';
      }
    }
    this.e.css('display', '');
    this.e.html(text);
  }
  else {
    this.e.css('display', 'none');
  }
};

function DesktopClientHeader() {
  this.e = $('<div></div>').attr('id', 'headline').prependTo('body');

  this.e.append('<div class="navigation">' +
      '<span class="rpc_queue_state"></span> ' +
      '<span class="action userinfo">Moinz.de Wobble</span> ' +
      '<a class="action" href="http://github.com/zeisss/wobble" target="_new">Source</a> ' +
      '<a class="action" href="#" id="signout">Logout</a>' +
      '</div>'
      );
  this.offlineBar = new OfflineBarPartial(this.e);

  // Button Handler
  $("#signout").click(function() {
    console.log("Signout => Bye bye!");
    API.signout(function(err, data) {
      if (!err) {
        window.location.reload();
      }
    });
    return false;
  });

  $(".userinfo", this.e).on('click', function() {
    var pos = $(this).offset();
    pos.top += $(this).outerHeight() * 1.2;
    pos.left -= 50;
    BUS.fire('ui.profile.show', pos);
  });

  // Welcome the user
  function ui_username() {
    var user = API.user();
    if (user) {
      return user.name;
    } else {
      return "";
    }
  }
  BUS.on('api.user', function() {
     $(".navigation .userinfo").text(ui_username());
  }, this);
  $(".navigation .userinfo").text(ui_username());

  // Show a queue status
  var $rpcQueueState = $(".rpc_queue_state", this.e);
  var isDev = localStorage && localStorage.getItem('WOBBLE_DEV');
  BUS.on('rpc.queue.length', function(stateWaitingLength) {
    if (stateWaitingLength <= 1) {
      $rpcQueueState.removeClass('active').text('');
    } else {
      $rpcQueueState.addClass('active');
      
      if (isDev) {
        $rpcQueueState.text("" + stateWaitingLength);
      }
    }
  }, this);
}

