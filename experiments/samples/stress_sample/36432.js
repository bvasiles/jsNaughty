function do_post(action, name_value){
    var form = document.createElement('form');
    form.method='post';
    form.action = action;
    var name_input = document.createElement('input');
    name_input.setAttribute('name', 'name');
    name_input.setAttribute('value', name_value);
    form.appendChild(name_input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function trim(s){
    return s.replace(/^\s+|\s+$/g, "")
}

$(document).ready(function(){
    $('#proglist').children().click(function(){
        var url = trim($(this).text()) + "/";
        window.location = url;
    });
    $('#add_button').click(function(event){
        event.preventDefault();
        var prog_name = prompt("Enter name of Program to Add");
        if(prog_name){
            do_post("/add/", prog_name);
        }
    });
    $('#del_button').click(function(event){
        event.preventDefault();
        var prog_name = prompt("Enter Name of Program to Delete");
        if(prog_name){
            do_post("/del/", prog_name);
        }
    });
});