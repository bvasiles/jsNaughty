// Cybouz回り自分用スクリプト
// サブコマンド化
// TODO:表示の調整
// TODO:スケジュールの追加




commands.addUserCommand(["cy[bouz]"],	"my utility about cybouz.", 
	function(args){ // {{{
		
		// サブコマンドが指定されなかった場合の処理。
		// とりあえずスケジュールを表示さす。

		Cybouz.login();
		Cybouz.getScheduleDay(args);


	}, // }}}
	{
		// オプション定義
		options:[
			[["date","d"],commands.OPTION_ANY,null,
				[
					[	
						(function(){
							let d = new Date();
							return d.getFullYear().toString() + "." + (d.getMonth()+1).toString() + "." + d.getDate().toString();
						})()
						,"today"
					],
					[1,"tommorow"],
					[7,"next week"],
					[-1,"yesterday"]
				]
			],
			[["user","u"],commands.OPTION_ANY,null,
				(function(){
					let u = [];
					let store = storage.newMap("my_cybouz",{store:true});

					for (let key in store) {
						u.push(
							[
								store.get(key[0]).name,
								store.get(key[0]).name_kana + " : " + store.get(key[0]).email + " : " + store.get(key[0]).phone
							]
						)
					};

					return u 
				})()

			],
	
		], 


		// サブコマンド定義
		subCommands: [
			new Command(["getSchedule","g"], "get schedule from cybouz",
				function (args) {
					// getSchedule 
					liberator.echo("execute getSchedule:" + args.string);

					Cybouz.login();
					Cybouz.getScheduleDay(args);

				},{}
			),
			new Command(["refreshUserIDs"], "Refresh User IDs cache data.",
				function (args) {
					Cybouz.refreshUserIDs();
				}
			),
			new Command(["test"], "test",
				function (args) {
					alert(parseArgUser(args));
				}
			),
		],

	},	true
);





let Cybouz = {

	base_url : "https://www.retailcomm.co.jp",
	
	isLogin : function(){ 
	// ログイン判定 cookieからAGSESSIDを取得
	// セッション終了時までの有効期限cookieが設定してあるぽい
		let c = new CookieManager(this.base_url + "/cb8/");
		return c.getCookie("AGSESSID") ;
		  
	},

	login : function(){ // {{{

		if (this.isLogin()) return;

		// login-manager
		let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		let logins = manager.findLogins({},this.base_url,"",null);

		let req = new libly.Request(
			this.base_url + "/cb8/ag.cgi?page=AGIndex", //url
			null, //headers
			{ // options
				asynchronous:true,
				postBody:"?" + this.getParameterMap(
					{
						_Account : encodeURIComponent(logins[0].username),
						Password : encodeURIComponent(logins[0].password) ,
						_System : "login",
						_Login : "1",
					}
				)
			}
		);
		req.addEventListener("onSuccess",function(data){
			liberator.echo("cybouz login as =>" + encodeURIComponent(logins[0].username));
		});
		req.addEventListener("onFailure",function(data){
			liberator.echoerr(data.statusText);
		});
		req.post();

	}, // }}}



	refreshUserIDs : function(){
		// user id をスクレイプして整形するメソッド
		// https://www.retailcomm.co.jp/cb8/ag.cgi?page=UserListIndex&GID=0

		let req = new libly.Request(
			this.base_url + "/cb8/ag.cgi?page=UserListIndex&GID=0", //url
			null, //headers
			{ // options
				asynchronous:true,
				encoding : "Shift_JIS"	
			}
		);

		req.addEventListener("onSuccess",function(data){
			// replaceしているのは
			// http://vimperator.g.hatena.ne.jp/teramako/20090303/1236087939
			// のバグ回避のため。ブログコメント欄参照
			let response = libly.$U.createHTMLDocument(data.responseText.replace(/\shref\=\"/g," href\=\"" + Cybouz.base_url + "\/cb8\/"));
			let table = util.evaluateXPath('//div[4]/form/div/table',response).snapshotItem(0);

			let userData = [];
			for (let i = 1; i < table.rows.length; i++) {
				userData.push(
						{
							// id : cybouz用のUID.get時のパラメータとして使う
							// name : 名前
							// name_kana : かな
							// email : メアド
							// phone : 電話番号 
							id 			: table.rows[i].childNodes[1].firstChild.href.replace(/^.*uid\=([0-9]+).*$/,"$1") ,
							href 		: table.rows[i].childNodes[1].firstChild.href ,
							name		: table.rows[i].cells[0].textContent.replace(/\n|\s/g,"") ,
							name_kana 	: table.rows[i].cells[1].textContent.replace(/\n|\s/g,"") ,
							email 		: table.rows[i].cells[2].textContent.replace(/\n|\s/g,"") ,
							phone		: table.rows[i].cells[4].textContent.replace(/\n/g,"") ,
						}
					)

			};


			let store = storage.newMap("my_cybouz",{store:true});
			store.clear();

			for (let i = 0; i < userData.length; i++) {
				store.set(i,userData[i]);
			};
			store.save();

			liberator.echo("Cybouz => Update Complete for User IDs")

			
		});

		req.addEventListener("onFailure",function(data){
			liberator.echoerr(data.statusText);
		});

		req.get();
				 
	},



	getScheduleDay : function(args){ // {{{
	
		let _date = parseArgDate(args);
		let _uid = parseArgUser(args);
		let _uname = (args["user"]) ? args["user"] :"Your Schedule"; // 表示用


		// libly request
		let req = new libly.Request(
			this.base_url + "/cb8/ag.cgi?page=ScheduleUserDay&Date=da." + _date + "&UID=" + _uid , //url
			null, //headers
			{ // options
				asynchronous : true,
				encoding : "Shift_JIS"	
			}
		);
		req.addEventListener("onSuccess",function(data){
			let response = libly.$U.createHTMLDocument(data.responseText);
			let head = "";
			let html = util.evaluateXPath('//*[@id="userday"]',response).snapshotItem(0);
			html = new XMLSerializer().serializeToString(html) 
			head= <div>
					{" /*** " + _date }  
					<span style="color:red;font-weight:bold;">{ " " + _uname + " "}</span> 
					{ "***/ "}
				</div>;
			liberator.echo(head + new XML(html),true)
		});
		req.addEventListener("onFailure",function(data){
			liberator.echoerr(data.statusText);
		});

		req.get();



	}, // }}}

	getParameterMap : function(parameters){ // {{{
		
		let map = "";
		for (let key in parameters){
			if (map) map += "&";
			map += key + "=" + parameters[key];
		}
		return map

	}, // }}}

	checkDateFormat : function(day) { // {{{
		
					  
	}, // }}}
	

}

function parseArgUser(args){
// argsのuserオプションの値をパースする

	let store = storage.newMap("my_cybouz",{store:true});
	for (let key in store){
		if (args["user"] == store.get(key[0]).name){
			return store.get(key[0]).id
		}
	}
	return "";
}



function parseArgDate(args){
// argsのdateオプションの値をパースする
// 数値なら今日の日付から+か-して返す
// 文字列ならそのまま返す

	let _date;
	if (args["date"]) {
		if(!isNaN(args["date"])) {
			let _nd = new Date();
			let _today = _nd.getTime();
			let _msec = args["date"] * (24 * 60 * 60 * 1000);
			let _d = new Date(_today + _msec);

			_date = _d.getFullYear() + "." + (_d.getMonth()+1).toString() + "." + _d.getDate().toString();

		}else{
			_date = args["date"];
		}
	} else {
		_date = getToday();
	}

	return _date;

}



function getToday(){ 
	// return yyyy.mm.dd format
	let today = new Date();
	let y = today.getYear();
	let m = today.getMonth() + 1;
	let d = today.getDate();

	if (y < 1000) y += 1900;

	return y.toString() + "." + m.toString() + "." + d.toString();
}



// class definition
// cookie manager
function CookieManager() {
    this.initialize.apply(this, arguments);
}

CookieManager.prototype = {
    initialize: function (uri) {
        const Cc = Components.classes;
        const Ci = Components.interfaces;

        const MOZILLA = '@mozilla.org/';
        const IO_SERVICE = MOZILLA + 'network/io-service;1';
        const COOKIE_SERVICE = MOZILLA + 'cookieService;1';

        this.ioService = Cc[IO_SERVICE].getService(Ci.nsIIOService);
        this.cookieService = Cc[COOKIE_SERVICE].getService(Ci.nsICookieService);
        if(!this.ioService || !this.cookieService) {
            throw new Error('error on CookieManager initialize.');
        }

        this.readCookie(uri);
    },

    readCookie: function (uri) {
        if(uri) {
            this.uri = uri;
            this.uriObject = this.ioService.newURI(uri, null, null);
            this.cookie = this._deserializeCookie(this._getCookieString());
        }
    },

    _getCookieString: function () {
        return this.uriObject
            ? this.cookieService.getCookieString(this.uriObject, null)
            : null;
    },

    _setCookieString: function (cookieString) {
        if(this.uriObject && cookieString) {
            this.cookieService.setCookieString(this.uriObject, null, cookieString, null);
        }
    },

    _deserializeCookie: function (cookieString) {
        if (!cookieString) return {};

        let cookies = cookieString.split(/; */);
        let cookie = {};
        let key, val;
        for (let i=0, max=cookies.length ; i<max ; ++i) {
            [key, val] = cookies[i].split('=');
            cookie[key] = val;
        }
        return cookie;
    },

    getCookie: function (key) {
        return this.cookie[key] ? this.cookie[key] : null;
    },

    properties: function () {
        return [k for ([k, v] in Iterator(this.cookie))];
    },

    setCookie: function (obj) {
        this.cookie[obj.key] = obj.value;
        let string = [
            obj.key + '=' + obj.value,
            'domain=' + obj.domain,
            'expires=' + new Date(new Date().getTime() + obj.expires),
        ].join('; ');
        this._setCookieString(string);
    },
};





/********************************
// for debug
********************************/
function e(v,c){ 
	if(c) util.copyToClipboard(v);
	liberator.log(v,-1)
}


