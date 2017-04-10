window.extCode = {
    numToText: function(it) {
        //http://snippets.dzone.com/posts/show/3710
        var units = new Array ("Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen");
        var tens = new Array ("Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety");
        var theword = "";
        var started;
        if(it>999) return "Lots";
        if(it===0) return units[0];
        for (var i = 9; i >= 1; i--){
            if (it>=i*100) {
                theword += units[i];
                started = 1;
                theword += " hundred";
                if (it!=i*100) theword += " and ";
                it -= i*100;
                i=0;
            }
        }
        
        for (var j = 9; j >= 2; j--){
            if (it>=j*10) {
                theword += (started?tens[j-2].toLowerCase():tens[j-2]);
                started = 1;
                if (it!=j*10) theword += "-";
                it -= j*10;
                j=0;
            }
        }
        
        for (var k=1; k < 20; k++) {
            if (it==k) {
                theword += (started?units[k].toLowerCase():units[k]);
            }
        }
	    return theword;
    }
};