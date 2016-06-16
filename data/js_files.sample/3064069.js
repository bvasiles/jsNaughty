// ==UserScript==
// @name        adblock#_lite.uc.js
// @description Block Ads
// @include     main
// @author      nodaguti
// @license     MIT License
// @compatibility Firefox 3.6 - Firefox 19
// @version     13/02/23 12:00 Firefox 21 で動かない問題を修正
// @note        adblock#_lite.uc.js は, 09/09/15 19:30 に以下の更新相当の変更を加え,
//              さらに最新版の adblock#.uc.js の高速化方法を導入したものです.
//                 11/01/30 07:30 Bug 623435 - Rip out deprecated |RegExp.compile| builtin method
//                 11/01/05 17:10 ON/OFFが正しく切り替えられないことがあるバグを修正
//                 11/01/04 16:00 最後のwindowが閉じられたときにobserverを解除するようにした
//                 11/01/04 09:00 observerをwindow毎ではなく1回だけ登録するようにした
//                 10/05/21 21:30 正規表現フィルタのマッチ処理を高速化
//                 10/05/21 20:30 マッチング処理を15%程度高速化
// ==/UserScript==
// @version     12/09/03 17:30 adblock#_lite.uc.js
// @version     09/09/15 19:30 typo
// @version     09/09/14 18:00 ちょこっと高速化
// @version     09/09/09 20:00 前方一致/後方一致フィルタに対応
// @version     09/09/09 17:30 ホワイトリスト対応
// @version     09/09/09 17:10 ON,OFFができるように
// @version     09/08/31 10:30 高速化+メモリリーク対処
// @version     09/08/31 9:30 アスタリスクフィルターが正しく動作していなかったのを修正
// @version     09/08/30 22:00 /ads/(ADBでは*/ads/*)のようなフィルターが正規表現と解釈されていたのを修正
// @version     09/08/30 19:00 正規表現/アスタリスクを使ったフィルターに対応
// @version     09/08/29 6:00 単純文字列/アスタリスク使用フィルターに対応(正規表現/?/()を使ったものには未対応)

var adblockSharp = {

	// --- config ---


	//ブロックするサイトのURL
	// デフォルトで部分一致, 大文字小文字の区別有り (ads と書けばURIに ads を含むすべてのサイトをブロックするが Ads はブロックしない)
	// /ads/ のようなフィルタを作りたい時は, 正規表現と間違えられないよう */ads/* と表記する
	// 正規表現を用いるには文字列を「/」で挟む
	// アスタリスクを用いるには文字列を「+」で挟む
	// ホワイトリストを用いるには始めに「@@」をつける
	// 前方一致は先頭に、後方一致は最後に「|」をつける (ただし,フィルタは単純文字列かアスタリスクしか使用できない)
	//
	//  *注意*
	//    ''でくくるため, \は\\と書く必要があります.
	//    つまり, /sample\d+\.jp/ は '/sample\\d+\\.jp/', と書かなくてはいけません.
	filter: [
		// 「'」ですべてのフィルタを括り, 末尾に「,」を付け加えて下さい.
		// 例:
		//   'example.com',
		//   'example.jp',
	],


	// --- /config ---


	blackList: {},

	whiteList: {},

	enabled: true,

	init: function(){

		var black = [], white = [];

		//ON,OFFメニュー作成
		var menuPopup = document.getElementById("menu_ToolsPopup");
		var separator = document.getElementById("devToolsSeparator");
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("label", "Enable Adblock#.uc.js");
		menuitem.setAttribute("type", "radio");
		menuitem.setAttribute("checked", true);
		menuitem.setAttribute("id", "adblocksharp-tool-menu-enabled");
		menuitem.addEventListener("command", adblockSharp.toggleEnabled, false);
		menuPopup.insertBefore(menuitem, separator);

		//フィルタの仕分け
		var $;
		for(let i=0, l=this.filter.length; i<l; i++){
			if($ = this.filter[i].match(/^@@(.*)$/))
				white.push($[1]);
			else
				black.push(this.filter[i]);
		}
		this.blackList = this.sortFilters(black);
		this.whiteList = this.sortFilters(white);

		this.observer.start();

		window.addEventListener('unload', this.uninit, false);
	},

	uninit: function(){
		window.removeEventListener('unload', adblockSharp.uninit, false);
		adblockSharp.observer.stop();
	},

	/**
	 * adblock#.uc.jsの有効/無効を切り替える
	 */
	toggleEnabled: function(){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
		var enumerator = wm.getEnumerator('navigator:browser');

		while(enumerator.hasMoreElements()){
			var win = enumerator.getNext();
			if(win.adblockSharp){
				win.adblockSharp.enabled ? 
					win.document.getElementById('adblocksharp-tool-menu-enabled').removeAttribute('checked') :
					win.document.getElementById('adblocksharp-tool-menu-enabled').setAttribute('checked', true);

				win.adblockSharp.enabled = !win.adblockSharp.enabled;
			}
		}
	},

	sortFilters: function(list){
		var filterObject = {
			plainTextFilter: [],
			regFilter: [],
			starFilter: [],
			prefixSuffixFilter: [],
		};

		for(let i=0; i<list.length; i++){
			var filter = list[i];

			//正規表現のフィルター
			if($ = filter.match(/^\/(.*)\/$/)){
				var re = new RegExp($[1]);
				filterObject.regFilter.push(re);
				continue;
			}

			//アスタリスク使用フィルター
			if($ = filter.match(/^\+(.*)\+$/)){
				var str = $[1].split('*');
				filterObject.starFilter.push(str);
				continue;
			}

			//前方一致
			if(filter[0] === "|"){
				filter = filter.substr(1);
				if(filter.indexOf("*") > -1){
					var str = filter.split('*');
					filterObject.prefixSuffixFilter.push([2, str]);
					continue;
				}

				filterObject.prefixSuffixFilter.push([1, filter]);
				continue;
			}

			//後方一致
			if(filter[filter.length-1] === "|"){
				filter = filter.substr(0,filter.length-1);
				if(filter.indexOf("*") > -1){
					var str = filter.split('*');
					filterObject.prefixSuffixFilter.push([4, str]);
					continue;
				}

				filterObject.prefixSuffixFilter.push([3, filter]);
				continue;
			}

			//「/」 で囲まれた単純文字列フィルター
			if($ = filter.match(/^\*\/(.*)\/\*$/)){
				filterObject.plainTextFilter.push('/' + $[1] + '/');
				continue;
			}

			//単純文字列のフィルター
			filterObject.plainTextFilter.push(filter);
			continue;
		}

		return filterObject;
	},

	matchesAny: function(url, filterset){

		//単純な文字列のフィルターにマッチするかどうか : 高速
		if(filterset.plainTextFilter.length !== 0){
			for(let i=0, l=filterset.plainTextFilter.length; i<l; i++){
				if(url.indexOf(filterset.plainTextFilter[i]) > -1){
					return true;
				}
			}
		}

		//アスタリスクフィルターにマッチするかどうか : 普通?
		if(filterset.starFilter.length !== 0){
			for(let j=0, l=filterset.starFilter.length; j<l; j++){
				var lastMatch = 0, match = -1;

				for(let i=0, h=filterset.starFilter[j].length; i<h; i++){

					match = url.indexOf(filterset.starFilter[j][i], lastMatch);

					if(match !== -1)
						lastMatch = match + filterset.starFilter[j][i].length + 1;
					else break;
				}

				if(i===l){
					return true;
				}
			}
		}

		//前方or後方一致フィルターにマッチするかどうか : 普通?
		if(filterset.prefixSuffixFilter.length !== 0){
			for(let i=0, l=filterset.prefixSuffixFilter.length; i<l; i++){
				var fs = filterset.prefixSuffixFilter[i][1];

				switch(filterset.prefixSuffixFilter[i][0]){

					//前方一致 - 単純文字列
					case 1:
						if(url.lastIndexOf(fs, 0) !== -1) return true;
						break;

					//前方一致 - アスタリスク
					case 2:
						var lastMatch = 0, match = -1;

						//先頭
						if(url.lastIndexOf(fs[0], 0) === -1) break;

						//2番目以降
						for(let j=1, h=fs.length; j<h; j++){
							match = url.indexOf(fs[j], lastMatch);

							if(match !== -1)
								lastMatch = match + fs[j].length + 1;
							else break;
						}

						if(j===h) return true;

						break;

					//後方一致 - 単純文字列
					case 3:
						if(url.indexOf(fs, url.length - fs.length) !== -1) return true;
						break;

					//後方一致 - アスタリスク
					case 4:

						//一番後ろ
						var lastChild = fs[fs.length-1];
						if(url.indexOf(lastChild, url.length - lastChild.length) === -1) break;

						//それ以外
						var lastMatch = 0, match = -1;

						for(let j=0, h=fs.length-1; j<h; j++){
							match = url.indexOf(fs[j], lastMatch);

							if(match !== -1) lastMatch = match + fs[j].length + 1;
							else break;
						}

						if(j===h) return true;

						break;
				}
			}
		}

		//正規表現のフィルターにマッチするかどうか : 低速
		if(filterset.regFilter.length !== 0){
			for(let j=0, l=filterset.regFilter.length; j<l; j++){
				if(filterset.regFilter[j].test(url)){
					return true;
				}
			}
		}

		return false;
	}

};

adblockSharp.observer = {

	_observer: null,

	/**
	 * observerを登録する
	 */
	start: function(){
		var enumerator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator)
								.getEnumerator('navigator:browser');

		//すでにスタートしていたら何もしない
		while(enumerator.hasMoreElements()){
			var win = enumerator.getNext();
			if(win.adblockSharp && win.adblockSharp.observer._observer) return;
		}

		//どのウィンドウでもobserverが登録されていないときは登録処理を行う
		this._observer = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
		this._observer.addObserver(this, 'http-on-modify-request', false);
		Application.console.log('Observer started.');
	},

	/**
	 * observerをストップする
	 * その際他のウィンドウがあるならそこにobserverを委託する
	 * ウィンドウが閉じられるときに呼び出される
	 */
	stop: function(){
		var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
		var mainWindow = wm.getMostRecentWindow("navigator:browser");

		var enumerator = wm.getEnumerator('navigator:browser');
		var isLastWindow = !enumerator.hasMoreElements();

		//このウィンドウにobserverがあるならobserverを削除する
		if(this._observer){
			//remove observer
			this._observer.removeObserver(this, 'http-on-modify-request');
			this._observer = null;
			Application.console.log('Observer removed.');

			//もし他のウィンドウがあるなら, そのウィンドウにobserverを委託する
			if(!isLastWindow && mainWindow && mainWindow.adblockSharp){
				mainWindow.adblockSharp.observer.start();
			}
		}
	},

	observe: function(subject, topic, data){
		if(topic !== 'http-on-modify-request' || !adblockSharp.enabled) return;

		var http = subject.QueryInterface(Components.interfaces.nsIHttpChannel)
		http = http.QueryInterface(Components.interfaces.nsIRequest);

		var url = http.URI.spec;

		if( !adblockSharp.matchesAny(url, adblockSharp.whiteList) && 
			adblockSharp.matchesAny(url, adblockSharp.blackList)){
			http.cancel(Components.results.NS_ERROR_FAILURE);
			Application.console.log('[Adblock] BLOCK:' + url);
		}
	}
};

adblockSharp.init();
