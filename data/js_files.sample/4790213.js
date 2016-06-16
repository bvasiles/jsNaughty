/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

/**
 * Require: arAkahukuConfig, arAkahukuConverter, arAkahukuDOM, arAkahukuLink
 */

/**
 * タイトル管理
 *   [タイトルを修正]
 *   [レスの一部をサブタイトルにする]
 */
var arAkahukuTitle = {
  enable : false,           /* Boolean  タイトルを修正 */
  type : "simple",          /* String  タイトルの設定
                             *   simple: 簡易設定
                             *   expert: 詳細設定 */
  enableComment : false,    /* Boolean  スレ本文の先頭 */
  commentLength : 0,        /* Number  スレ本文の先頭の長さ */
  commentLengthType : 0,    /* Number  長さの単位 (0:文字, 1:バイト) */
  enableCommentMultiLine : false, /* Boolean  複数行から */
  enableMode : false,       /* Boolean  [ページ n]、[返信] 等 */
  enableThreadInfo : false, /* Boolean  スレの消滅情報 */
  format : "",              /* String  フォーマット */
    
  enableSubtitle : false,     /* Boolean レスの一部をサブタイトルにする */
  enableCommentFixUp : false, /* Boolean 本文なしを適当に修正する */
    
  /**
   * ドキュメントのスタイルを設定する
   *
   * @param  arAkahukuStyleData style
   *         スタイル
   * @param  HTMLDocument targetDocument
   *         対象のドキュメント
   * @param  arAkahukuLocationInfo info
   *         アドレス情報
   */
  setStyle : function (style, targetDocument, info) {
    if (info.isNormal) {
      /* 通常モード */
            
      if (arAkahukuTitle.enableSubtitle) {
        style
        .addRule ("#akahuku_subtitle_container",
                  "font-size: 12pt;"
                  + "text-align: center;"
                  + "margin-bottom: 0;");
      }
    }
  },
    
  /**
   * 設定を読み込む
   */
  getConfig : function () {
    arAkahukuTitle.enable
    = arAkahukuConfig
    .initPref ("bool", "akahuku.title", true);
    if (arAkahukuTitle.enable) {
      arAkahukuTitle.type
        = arAkahukuConfig
        .initPref ("char", "akahuku.title.type", "simple");
      arAkahukuTitle.enableComment
        = arAkahukuConfig
        .initPref ("bool", "akahuku.title.comment", false);
      arAkahukuTitle.enableMode
        = arAkahukuConfig
        .initPref ("bool", "akahuku.title.mode", true);
      arAkahukuTitle.enableThreadInfo
        = arAkahukuConfig
        .initPref ("bool", "akahuku.title.thread_info", false);
      var defFormat
        = "%3Cold%3E%u53E4%20%3C/old%3E%3Cnijiura%3E%26server%3B%3C/nijiura%3E%3C_nijiura%3E%26board%3B%3C/_nijiura%3E%0A%3Cmessage%3E%20%26message%3B%3C/message%3E%3Cpage%3E%20%26page%3B%3C/page%3E%3Ccatalog%3E%20%u30AB%u30BF%u30ED%u30B0%3C/catalog%3E%0A%3Cexpire%3E%20%28%26expire%3B%29%3C/expire%3E";
      arAkahukuTitle.format
        = arAkahukuConfig
        .initPref ("char", "akahuku.title.format", defFormat);
      arAkahukuTitle.format
        = arAkahukuConverter.unescapeExtra
        (unescape (arAkahukuTitle.format));
    }

    arAkahukuTitle.commentLength
      = arAkahukuConfig
      .initPref ("int",  "akahuku.title.comment.length", 20);

    arAkahukuTitle.commentLengthType
      = arAkahukuConfig
      .initPref ("int",  "akahuku.title.comment.length.type", 0);

    arAkahukuTitle.enableCommentMultiLine
      = arAkahukuConfig
      .initPref ("bool",  "akahuku.title.comment.multiline", false);
        
    arAkahukuTitle.enableSubtitle
    = arAkahukuConfig
    .initPref ("bool", "akahuku.subtitle", false);
        
    arAkahukuTitle.enableCommentFixUp
    = arAkahukuConfig
    .initPref ("bool", "akahuku.comment.fixup", true);
  },
    
  /**
   * 本文なしを修正する
   *
   * @param  String text
   *         修正する文字列
   * @return String
   *         修正した文字列
   */
  fixUpText : function (text) {
    if (arAkahukuTitle.enableCommentFixUp
        && text.match
        (/^([^\u2501]+)\u2501+\(\uFF9F\u2200\uFF9F\)\u2501+/)) {
      var prefix = RegExp.$1;
      if (prefix == "\uFF77\uFF80") {
        return "\u304A\u3061\u3093\u3061\u3093\u30E9\u30F3\u30C9";
      }
            
      return prefix + "\u3061\u3093\u3061\u3093\u30E9\u30F3\u30C9";
    }
    else {
      return text;
    }
  },

  /**
   * 長いコメントを打ち切る
   * @param  String text
   *         文字列
   * @param  Number length
   *         最大長さ (省略時はarAkahukuTitle.commentLength)
   * @param  Number type
   *         長さの単位 (0:文字数, 1:SJISバイト数)
   *         (省略時はarAkahukuTitle.commentLengthType)
   * @param  String sign
   *         打ち切り時に末尾に付ける文字列 (省略可)
   * @return String
   *         文字列
   */
  truncateComment : function (text, length, type, sign) {
    length = length || arAkahukuTitle.commentLength;
    type = type ||  arAkahukuTitle.commentLengthType;
    var ret;
    var truncated = false;
    text = arAkahukuConverter.unescapeEntity (text);
    if (type == 1) {
      // SJISバイト数単位の場合
      ret = arAkahukuConverter.getSubstrForSJISByteLength (text, length);
    }
    else {
      // 文字数単位の場合
      ret = text.substr (0, length);
    }
    if (ret.length != text.length) {
      truncated = true;
    }
    if (truncated && sign) {
      ret += sign;
    }
    ret = arAkahukuConverter.escapeEntity (ret);
    return ret;
  },
    
  /**
   * コメントを取得する
   *
   * @param  HTMLDocument targetDocument
   *         対象のドキュメント
   * @param  HTMLQuoteElement element
   *         対象の要素
   * @return String
   *         コメント
   */
  getComment : function (targetDocument, element) {
    var node = element.cloneNode (true);
        
    return arAkahukuDOM.getInnerText (node);
  },
    
  /**
   * 最初の行を抜き出す
   *
   * @return String text
   *         コメント全体
   * @return String
   *         最初の行
   */
  getFirstLine : function (text) {
    var lines = text.split (/\n/);
    if (lines.length == 0) {
      return "";
    }
        
    var s = lines [0];
    for (var i = 0; i < lines.length; i ++) {
      if (lines [i].length > 0
          && !lines [i].match (/^&gt;/i)
          && !lines [i].match (/^\[proxy\?\]$/i)
          && !lines [i].match (/:\/\//)) {
        s = lines [i];
        break;
      }
    }
        
    s
    = s.replace (/^\s*/, "")
    .replace (/\s*$/, "")
    .replace (/^(&gt;)+/, "");
        
    return s;
  },
    
  /**
   * どこか行のどこかを抜き出す
   *
   * @return String text
   *         コメント全体
   * @param  Number position
   *         どこを取得するか
   *           0: 先頭
   *           1: 中間
   *           2: 末尾
   * @param  Number maxLength
   *         最大の長さ
   * @return String
   *         どこかの行
   */
  getRandomLine : function (text, position, maxLength) {
    var lines = text.split (/\n/);
    if (lines.length == 0) {
      return "";
    }
        
    if (maxLength > 16) {
      maxLength = 16;
    }
    else if (maxLength <= 0) {
      return "";
    }
        
    var head = (position == 0);
        
    var s = lines [head ? 0 : lines.length - 1];
    for (var i = head ? 0 : lines.length - 1;
         i >= 0 && i < lines.length;
         i += head ? 1 : -1) {
      if (lines [i].length > 0
          && !lines [i].match (/^>/i)
          && !lines [i].match (/:\/\//)) {
        s = lines [i];
        break;
      }
    }
        
    s
    = s.replace (/^\s*/, "")
    .replace (/\s*$/, "")
    .replace (/^(&gt;)+/, "");
        
    var length = 1 + Math.floor (Math.random () * maxLength);
    if (s.length > length) {
      if (position == 0) {
        s = s.substr (0, length);
      }
      else if (position == 1) {
        var l = s.length - length;
        l = 1 + Math.floor (Math.random () * l);
        s = s.substr (l, length);
      }
      else if (position == 2) {
        s = s.substr (s.length - length);
      }
    }
        
    return s;
  },
    
  /**
   * ドキュメントのタイトルを設定する
   *
   * @param  HTMLDocument targetDocument
   *         対象のドキュメント
   * @param  arAkahukuLocationInfo info
   *         アドレスの情報
   */
  setTitle : function (targetDocument, info) {
    var text = "";
        
    var names = [
      "message",
      "message2",
      "entiremessage",
      "name",
      "mail",
      "subject",
      "ip",
      "id"
      ];
    var tmp = new Object ();
        
    var nodes = [];
    if (!info.isCatalog) {
      nodes = Akahuku.getMessageBQ (targetDocument);
    }
    if (nodes.length == 0) {
      for (var i = 0; i < names.length; i ++) {
        var n = names [i];
        tmp [n] = info [n];
        info [n] = "";
      }
    }
        
    if (arAkahukuTitle.type == "simple") {
      if (arAkahukuTitle.enableThreadInfo && info.isOld) {
        text += "[\u53E4] ";
      }
            
      text += info.board;
            
      if (arAkahukuTitle.enableComment && info.isReply) {
        text
          += " " + arAkahukuConverter.unescapeEntity (info.message);
      }
      else if (arAkahukuTitle.enableMode && info.mode != "") {
        text += " [" + info.mode + "]";
      }
            
      if (arAkahukuTitle.enableThreadInfo && info.expire) {
        text += " (\uFF5E" + info.expire + ")";
      }
    }
    else {
      text
      = arAkahukuConverter.unescapeEntity
      (info.format (arAkahukuTitle.format));
    }

    if (nodes.length == 0) {
      for (var i = 0; i < names.length; i ++) {
        var n = names [i];
        info [n] = tmp [n];
      }
    }
        
    text = text.replace (/^[\r\n]+/, "");
        
    targetDocument.title = text;
  },

  /**
   * ドキュメントのタイトル要素を得る
   *
   * @param  HTMLDocument targetDocument
   *         対象のドキュメント
   * @param  arAkahukuLocationInfo info
   *         アドレスの情報
   * @return HTMLElement
   *         タイトル要素
   */
  getTitleElement : function (targetDocument, info) {
    var pos = null;
    var nodes2 = targetDocument.getElementsByTagName ("p");
    if (nodes2.length >= 2 && nodes2[1].align == "center") {
      var nodes3 = nodes2 [1].getElementsByTagName ("font");
      if (nodes3.length >= 1) {
        pos = nodes3 [0];
      }
      else {
        pos = nodes2 [1];
      }
    }
    /* 避難所 patch */
    if (!pos) {
      nodes2 = targetDocument.getElementsByTagName ("h1");
      if (nodes2.length >= 1) {
        pos = nodes2 [0];
      }
    }
    /* hr基準のタイトル要素検索 */
    if (!pos) {
      nodes2 = targetDocument.getElementsByTagName ("hr");
      if (nodes2.length >= 1) {
        pos = nodes2 [0].previousSibling;
      }
    }
    return pos;
  },
    
  /**
   * ドキュメントのタイトルにサーバ名、状況などを追加する
   *
   * @param  HTMLDocument targetDocument
   *         対象のドキュメント
   * @param  arAkahukuLocationInfo info
   *         アドレスの情報
   */
  apply : function (targetDocument, info) {
    if (info.isNotFound) {
      return;
    }
        
    var nodes;
    if (arAkahukuTitle.enable) {
      if (info.isRedirect || info.isImage) {
        return;
      }
      arAkahukuTitle.setTitle (targetDocument, info);
    }
        
    if (info.isNormal && arAkahukuTitle.enableSubtitle) {
      var nodes = Akahuku.getMessageBQ (targetDocument);
            
      if (nodes.length != 0) {
        var pos = arAkahukuTitle.getTitleElement (targetDocument, info);
        if (pos) {
          var newNode = targetDocument.createElement ("div");
          newNode.id = "akahuku_subtitle_container";
                    
          var text;
          var i;
          var n;
          var maxLength = 30;
          var subtitle = "";
          subtitle = "\u2500\u2500 ";
                    
          i = Math.floor (Math.random () * nodes.length);
          text
            = arAkahukuTitle.getComment (targetDocument,
                                         nodes [i]);
          text = arAkahukuTitle.getRandomLine (text, 0,
                                               maxLength);
          text = arAkahukuTitle.fixUpText (text);
          maxLength -= text.length;
          subtitle += text;
                    
          n = Math.floor (Math.random () * 3);
                    
          maxLength -= 6;
          for (var j = 0; j < n && maxLength > 0; j ++) {
            i = Math.floor (Math.random () * nodes.length);
            text
              = arAkahukuTitle.getComment (targetDocument,
                                           nodes [i]);
            text = arAkahukuTitle.getRandomLine (text, 1,
                                                 maxLength);
            text = arAkahukuTitle.fixUpText (text);
            maxLength -= text.length;
            subtitle += text;
          }
          maxLength += 6;
                    
          i = Math.floor (Math.random () * nodes.length);
          text
            = arAkahukuTitle.getComment (targetDocument,
                                         nodes [i]);
          text = arAkahukuTitle.getRandomLine (text, 2,
                                               maxLength);
          text = arAkahukuTitle.fixUpText (text);
          subtitle += text;
                    
          subtitle += " \u2500\u2500";

          subtitle = arAkahukuConverter.unescapeEntity (subtitle);
                    
          arAkahukuDOM.setText (newNode, subtitle);
                    
          if (pos.nextSibling) {
            if (pos.nextSibling.nodeName.toLowerCase () == "br") {
              pos.nextSibling.parentNode
                .replaceChild (newNode, pos.nextSibling);
            }
            else {
              pos.nextSibling.parentNode
                .insertBefore (newNode, pos.nextSibling);
            }
          }
          else {
            pos.parentNode.appendChild (newNode);
          }
        }
      }
    }
  }
};
