var quickring = {};

quickring.main = function() {
    console.printf("loading quickring<br>");
};


function sideBarSelect(id){
 //    alert(id);   
}

function login(form) {
//todo: clearly we should validate these values before blindly passing themn to agilib

    var user = document.getElementById('loginForm').name.value;
     var pass = document.getElementById('loginForm').pass.value;   
    //agi.mount(0,"xmppfs", "/local/dev/message/xmpp", [user, pass]);     
    agi.login("#xmpp:softsurve.com:5280", user, pass);
}