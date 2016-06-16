// groundjs/util.js --------

if(typeof groundjs === 'undefined') throw 'Requires groundjs/core.js';

groundjs.Util = {} //only for verifying that this module is loaded in other modules

groundjs.StringUtil = function(){

    var g = groundjs;

    var isEmpty = function(s){
    	return g.Type.isUndefined(s) || g.Type.isNull(s) || g.StringUtil.trim(s).length == 0;
    }
    var trim = function(s){
        return s.replace(/^\s+|\s+$/g, '');
    }
    var startsWith = function(a,b){
        if(a == null || b == null) return false;
        if(!g.Type.isString(a)){
            a = a.toString();
        }
        if(!g.Type.isString(b)){
            b = b.toString();
        }
        return a.indexOf(b) == 0;
    }
    var endsWith = function(a,b){
        if(a == null || b == null) return false;
        if(!g.Type.isString(a)){
            a = a.toString();
        }
        if(!g.Type.isString(b)){
            b = b.toString();
        }
        return a.lastIndexOf(b) + b.length == a.length;
    }

    /**
     * Pads a string with the specified character up to the specitied length on left or right
     * @param s string to pad
     * @param pad string used for padding
     * @param max maximum length of the resulting string
     * @side 'left' to pad on the left (default), 'right' to pad on the right
     * @return padded string
     */
    var pad = function(s, pad, max, side){
        if(side == null){
            side = 'left';
        } 
        if(side != 'left' && side != 'right'){
            throw 'side must equal "left" or "right"'
        }
        if(!g.Type.isString(s)){
            s = s.toString();
        }
        if(!g.Type.isString(pad)){
            pad = pad.toString();
        }
        if(!g.Type.isNumber(max) || max < s.length()){
            throw 'max must be a number';
        }
        if(max < s.length()){
            return s;
        }
        var charsToPad = max - s.length();
        var result = s;
        if(side == 'left'){
            while(result.length() < max){
                result = pad + result;
            }
            if(result.length() > max){
                var start = result.length() - max;
                result = result.substring(start, result.length());
            }
        } else if(side == 'right'){
            while(result.length() < max){
                result = result + pad;
            }
            if(result.length() > max){
                result = result.substring(0, max);
            }
        }
        return result;
    }
    var insert = function(s,index,stringToInsert){
        if(g.Type.isUndefined(s) || g.Type.isNull(s)){
            return s;
        } else if(!g.Type.isString(s)){
            s = s.toString();
        }
        
        if(!g.Type.isNumber(index)){
            throw 'index must be a number';
        }
        
        if(index < 0 || index > s.length){
            throw 'index must be between 0 and ' + s.length;
        }
        
        if(g.Type.isUndefined(stringToInsert) || g.Type.isNull(stringToInsert)){
            return s;
        }
        
        if(index === 0){
            return stringToInsert + s;
        } else if(index === s.length){
            return s + stringToInsert;
        } else {
            return s.substring(0,index) + stringToInsert + s.substring(index, s.length);
        }
        
    }
    
    var first = function(s){
        if(g.Type.isUndefined(s) || g.Type.isNull(s)){
            return s;
        }
        if(!g.Type.isString(s)){
            s = s.toString();
        }
        if(s.length() == 0){
            return s;
        }
        return s.charAt(0);
    }
    
    var last = function(s){
        if(g.Type.isUndefined(s) || g.Type.isNull(g)){
            return s;
        }
        if(!g.Type.isString(s)){
            s = s.toString();
        }
        if(s.length() == 0){
            return s;
        }
        return s.charAt(s.length() - 1);
    }
    
    var eval = function(s){
        if(!s){
            return s;
        }
        
        //while(true){
            
            var start = s.indexOf('{');
            //if(start == -1) break;

            var end = s.indexOf('}',start);
            //if(end == -1) break;

            var exp = s.substring(start + 1, end);
            
            try{
                eval('var v = ' + exp);
            } catch(e){console.log(e)}
        //}
        
        return s;
        
    }
    
    return {
        endsWith: endsWith,
        eval: eval,
        first: first,
        insert: insert,
        isEmpty: isEmpty,
        last: last,
        pad: pad,
        startsWith: startsWith,
        trim: trim
    }
    
}();

groundjs.ArrayUtil = function(){

	var g = groundjs;
	
	var isEmpty = function(a){
		if(g.Type.isUndefined(a) || g.Type.isNull(a) || a.length == 0){
			return true;
		}
		for(var i = 0; i < a.length; i++){
			var e = a[i];
			if(!g.Type.isUndefined(a) && !g.Type.isNull(a)) return false;
		}
		return true;
	}
		
    /**
     * The array must be sorted
     */
    var binarySearch = function(find, comparator) {
        var low = 0, high = this.length - 1, i, comparison, div = 2;
        while (low <= high) {
            i = Math.floor((low + high) / div);
            comparison = comparator(this[i], find);
            if (comparison < 0) {low = i + 1;continue;};
            if (comparison > 0) {high = i - 1;continue;};
            return i;
        }
        return null;
    }
	return{
		isArray: g.isArray,
		isEmpty: isEmpty,
		binarySearch: binarySearch
	}
}();
