function cnbc_displayUsername (parent,id) {
    
    var userText = "Welcome, Guest";
	var x = document.getElementById(id);
	var isValidUser = cnbc_isLoggedIn(cnbc_validUserCheckURL);
    var isRegister = cnbc_watchlist_isRegistered();
	
	if (isValidUser && isRegister) {
	    var temp  = cnbc_readCookie('SUBSCRIBERINFO');
	    var temp2 = cnbc_readCookie('ACEGI_SECURITY_HASHED_REMEMBER_ME_COOKIE');
	    var temp3 = cnbc_readCookie('CASTOKEN');
	    
	    if(temp) {
	        userText = temp;
	    } else if(temp2) {
	        userText = temp2.split(":")[0];
	    } else if(temp3) {
	        userText = temp3;
	    } else {
	        userText = "Guest";
	    }
	    
	    if(userText.length <= 24) {
		    userText = "Welcome, "+userText;
	    }
    }
	x.innerHTML = userText;
}