CodeMirror.defineMode("calcsane", function(config, parserConfig) {
  var indentUnit = config.indentUnit,
      keywords = parserConfig.keywords || {},
      blockKeywords = parserConfig.blockKeywords || {},
      builtins = parserConfig.builtins || {},
      atoms = parserConfig.atoms || {},
      hooks = parserConfig.hooks || {},
      multiLineStrings = parserConfig.multiLineStrings;

  var isOperatorChar = /[+\-*&%=<>!?|\/]/;

  var curPunc;

  function tokenBase(stream, state) 
  {
    var ch = stream.next();

    if (ch == '"' || ch == "'") 
    {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    }
    if (/[\[\]{}\(\),;\:\.]/.test(ch)) 
    {
      curPunc = ch;
      return null
    }
    
    if (/\d/.test(ch)) 
    {
      stream.eatWhile(/[\w\.]/);
      return "number";
    }

    if (ch == "/") 
    {
      //if (stream.eat("*")) {
      //  state.tokenize = tokenComment;
      //  return tokenComment(stream, state);
      //}
      if (stream.eat("/")) {
        stream.skipToEnd();
        return "comment";
      }
    }

    if (isOperatorChar.test(ch)) 
    {
      stream.eatWhile(isOperatorChar);
      return "operator";
    }

    stream.eatWhile(/[\w\$_]/);
    var cur = stream.current();
    
    if (keywords.propertyIsEnumerable(cur)) 
    {
      if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
      return "keyword";
    }

   if (builtins.propertyIsEnumerable(cur))
   {
       return "builtin"
   }

   if (atoms.propertyIsEnumerable(cur)) 
       return "atom";

  return "word";
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) {end = true; break;}
        escaped = !escaped && next == "\\";
      }
      if (end || !(escaped || multiLineStrings))
        state.tokenize = tokenBase;
      return "string";
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return "comment";
  }

  function Context(indented, column, type, align, prev) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.align = align;
    this.prev = prev;
  }
  function pushContext(state, col, type) {
    return state.context = new Context(state.indented, col, type, null, state.context);
  }
  function popContext(state) {
    var t = state.context.type;
    if (t == ")" || t == "]" || t == "}")
      state.indented = state.context.indented;
    return state.context = state.context.prev;
  }

  // Interface

  return {
    startState: function(basecolumn) {
      return {
        tokenize: null,
        context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
        indented: 0,
        startOfLine: true
      };
    },

    token: function(stream, state) {
      var ctx = state.context;
      if (stream.sol()) {
        if (ctx.align == null) ctx.align = false;
        state.indented = stream.indentation();
        state.startOfLine = true;
      }
      if (stream.eatSpace()) return null;
      curPunc = null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style == "comment" || style == "meta") return style;
      if (ctx.align == null) ctx.align = true;

      if ((curPunc == ";" || curPunc == ":") && ctx.type == "statement") popContext(state);
      else if (curPunc == "{") pushContext(state, stream.column(), "}");
      else if (curPunc == "[") pushContext(state, stream.column(), "]");
      else if (curPunc == "(") pushContext(state, stream.column(), ")");
      else if (curPunc == "}") {
        while (ctx.type == "statement") ctx = popContext(state);
        if (ctx.type == "}") ctx = popContext(state);
        while (ctx.type == "statement") ctx = popContext(state);
      }
      else if (curPunc == ctx.type) popContext(state);
      else if (ctx.type == "}" || ctx.type == "top" || (ctx.type == "statement" && curPunc == "newstatement"))
        pushContext(state, stream.column(), "statement");
      state.startOfLine = false;
      return style;
    },

    indent: function(state, textAfter) {
      if (state.tokenize != tokenBase && state.tokenize != null) return 0;
      var firstChar = textAfter && textAfter.charAt(0), ctx = state.context, closing = firstChar == ctx.type;
      if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : indentUnit);
      else if (ctx.align) return ctx.column + (closing ? 0 : 1);
      else return ctx.indented + (closing ? 0 : indentUnit);
    },

    electricChars: "{}"
  };
});

(function() {
  function words(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
 
  // C#-style strings where "" escapes a quote.
  function tokenAtString(stream, state) {
    var next;
    while ((next = stream.next()) != null) {
      if (next == '"' && !stream.eat('"')) {
        state.tokenize = null;
        break;
      }
    }
    return "string";
  }

  CodeMirror.defineMIME("text/calc-sane", 
  {
    name: "calcsane",
    keywords: words("if for while"),
    blockKeywords: words("if for while"),
    atoms: words(""),
    builtins: words("add subtract multiply divide power inverse modulus bitwise_and bitwise_or bitwise_xor and or not bitwise_not equals not_equals greater_than less_than greater_equal less_equal exactly not_exactly average sum max min mod pi power pow floor ceil rad2deg log2 round sqrt abs ln log exp sin sinh arcsin asin arcsinh asinh cos cosh acos arccos arccosh acosh tan tanh atan atan arctanh atanh decbin dechex decoct bindec hexdec octdec to_ascii from_ascii rand between oneOf boolean zero_extend sign_extend to_packed_bcd from_packed_bcd start_unique_pool start_unique_between unique_value zero_trim sign_trim debug_show_errors strhex hexdump print_to_php debug_dump_vars debug_dump_interpreter"),
  }
  
  );
}());
