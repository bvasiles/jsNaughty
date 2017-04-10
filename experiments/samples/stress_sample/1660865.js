(function() {
  "use strict";
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SEQ.utils.namespace('SEQ.modules');

  SEQ.modules.CoffeeModal = (function() {

    function CoffeeModal(container) {
      this.container = container;
      this.el = {};
      this.overlay = {};
      this.outer = {};
      this.inner = {};
      this.closeBtn = {};
    }

    CoffeeModal.prototype.render = function(html) {
      this.container.append(this.el = $("<div />").addClass("modal_window").append(this.overlay = $("<div />").addClass("overlay").append(this.outer = $("<div />").addClass("outer").append(this.closeBtn = $("<div />").addClass("close_btn"), this.inner = $("<div />").addClass("inner").html(html)))));
      this.outer.fadeOut(0);
      return this.overlay.fadeOut(0);
    };

    CoffeeModal.prototype.add = function() {
      var _this = this;
      this.overlay.fadeIn(300, function() {
        return _this.outer.fadeIn(500);
      });
      return this.closeBtn.click(function() {
        return _this.remove();
      });
    };

    CoffeeModal.prototype.remove = function() {
      var _this = this;
      this.outer.fadeOut(200);
      return this.overlay.fadeOut(300, function() {
        return _this.el.remove();
      });
    };

    CoffeeModal.prototype.setDimensions = function(dimensions) {
      this.outer.css(dimensions);
      return this.inner.css(dimensions);
    };

    CoffeeModal.prototype.renderIframe = function(url, width, height, callback) {
      var $iframe,
        _this = this;
      $iframe = $("<iframe />").attr({
        "id": "frame",
        "src": url,
        "width": width,
        "height": height,
        "scrolling": "no",
        "frameBorder": "0"
      });
      $iframe.bind("load", function(e) {
        var $frame, dimensions;
        $frame = $iframe;
        dimensions = {
          width: $iframe.contents().find("object").attr("width"),
          height: $iframe.contents().find("object").attr("height")
        };
        $iframe.attr({
          "width": dimensions.width,
          "height": dimensions.height
        });
        _this.setDimensions(dimensions);
        return callback();
      });
      return this.render($iframe);
    };

    return CoffeeModal;

  })();

  SEQ.FlashModalController = (function() {

    function FlashModalController() {
      var _this = this;
      $("a[rel='flash_modal']").bind("click", function(e) {
        var modal, url;
        e.preventDefault();
        url = $(e.target).attr("href");
        modal = new App.Modal($("body"));
        modal.renderIframe(url, 757, 700, function() {
          modal.el.addClass("flash");
          return modal.add();
        });
        return false;
      });
    }

    return FlashModalController;

  })();

  SEQ.LeavingModalController = (function() {

    function LeavingModalController() {
      this.onContinueBtnClick = __bind(this.onContinueBtnClick, this);
      this.onGoBackBtnClick = __bind(this.onGoBackBtnClick, this);
      this.onExternalLinkClick = __bind(this.onExternalLinkClick, this);
      var modal;
      modal = {};
      $("a[rel='external']").bind("click", this.onExternalLinkClick);
    }

    LeavingModalController.prototype.onExternalLinkClick = function(e) {
      var modal, url;
      e.preventDefault();
      url = $(e.target).attr("href");
      modal = new App.Modal($("body"));
      modal.renderIframe(url, 620, 300);
      modal.add();
      modal.el.addClass("leaving");
      $("#go_back").bind("click", this.onGoBackBtnClick);
      $("#continue").bind("click", this.onContinueBtnClick);
      return false;
    };

    LeavingModalController.prototype.onGoBackBtnClick = function(e) {
      e.preventDefault();
      modal.remove();
      return false;
    };

    LeavingModalController.prototype.onContinueBtnClick = function(e) {
      return modal.remove();
    };

    return LeavingModalController;

  })();

}).call(this);
