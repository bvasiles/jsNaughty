if (typeof (window.Helper) == "undefined") {
  window.Helper = {
    HOME: "http://lixian.vip.xunlei.com/",
    TASK_MANAGER_HOST: "dynamic.cloud.vip.xunlei.com",
    TASK_MANAGER_PATH: "/user_task",
    downloadURL: "",
    userID: "",

    openTaskManager: function () {
      var tab = this.getTaskManagerTab();
      if (tab != null) {
        tab.activate();

        var uri = URI.parse(tab.url);
        if (uri.params["userid"]) {
          this.userID = uri.params["userid"];
          this.openTaskCreatePanel();
        } else {
          tab.url = this.HOME;
        }
      } else {
        tab = safari.application.activeBrowserWindow.openTab("foreground");
        tab.url = this.HOME;
      }
    },

    openTaskCreatePanel: function () {
      var url = "http://" + this.TASK_MANAGER_HOST + this.TASK_MANAGER_PATH +
          "?userid=" + this.userID +
          "&st=4&furl=" + encodeURIComponent(this.downloadURL);
      safari.application.activeBrowserWindow.activeTab.url = url;
      this.downloadURL = "";
    },

    handleContextMenu: function (event) {
      if (event.userInfo != null && event.userInfo != "") {
        event.contextMenu.appendContextMenuItem("download", "使用迅雷离线下载");
      }
    },

    handleCommand: function (event) {
      if (event.target.identifier == "download") {
        this.downloadURL = event.userInfo;
        this.openTaskManager();
      }
    },

    handleMessage: function (event) {
      switch (event.name) {
        case "taskmanager-ready" : {
          this.handleTaskManagerReady(event.message);
          break;
        }

        default :
          break;
      }
    },

    handleTaskManagerReady: function (userID) {
      this.userID = userID;
      if (this.downloadURL != "") {
        this.openTaskCreatePanel();
      }
    },

    getTaskManagerTab: function () {
      var tab = null;
      var uri = null;
      for (var i in safari.application.activeBrowserWindow.tabs) {
        if (safari.application.activeBrowserWindow.tabs[i].url != undefined) {
          uri = URI.parse(safari.application.activeBrowserWindow.tabs[i].url);
          if (uri.host == this.TASK_MANAGER_HOST &&
              uri.path == this.TASK_MANAGER_PATH) {
            tab = safari.application.activeBrowserWindow.tabs[i];
            break;
          }
        }
      }

      return tab;
    },

    init: function () {
      safari.application.addEventListener("contextmenu", function (event) {
        Helper.handleContextMenu(event);
      }, false);
      safari.application.addEventListener("command", function (event) {
        Helper.handleCommand(event);
      }, true);
      safari.application.addEventListener("message", function (event) {
        Helper.handleMessage(event);
      }, false);
    }
  };

  $(document).ready(function () {
      Helper.init();
  });
}