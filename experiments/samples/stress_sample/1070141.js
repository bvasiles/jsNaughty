$(function () {
    
  $("#tree").jstree({
    "plugins": [ "themes", "html_data", "dnd", "ui", "crrm", "contextmenu" ],
    "ui" : {
      "select_limit" : 1
    },
    "contextmenu": {
      "items": {
        "create": {
          "label": "Создать",
          "_disabled": false,
          "action": create_node
        },
        "rename": {
          "label": "Редактировать",
          "_disabled": false,
          "action": edit_node
        },
        "remove": {
          "label": "Удалить",
          "_disabled": false,
          "action": remove_node
        },
        "ccp": false
      }
    }
  }).bind("move_node.jstree", function (e, data) {
        
    cur = data.rslt.o;
      
    action = data.inst._get_move();
        
    $.ajax({
      url: url_move,
      type: 'get',
      data: 'id='+$(cur).attr('item_id')+'&ref_id='+$(action.r).attr('item_id')+'&type='+action.p
    });

  });

  $("#create_item").click(function () {

    parent = root;
      
    $.fancybox({
      type: 'ajax',
      href: url_get_form,
      onComplete: function(){
        $('#sf_category_parent').val(parent);
      }
    });

  });
   
  //Form
  
  $('#item_form').live('submit', function() { 
    
    var options = { 
      success:   showResponse,
      dataType:  'json'
    };
    
    $(document).find("input#item_submit").attr("disabled", "disabled");
    $(document).find("img#form_loader").show();
    
    $(this).ajaxSubmit(options); 

    return false; 
  });

});

function showResponse(data)  {
  
  if(data.action == "create"){
    
    item = $("#tree").jstree("create", '#phtml_'+data.parent, "last", data.title, false, true);

    $(item).attr('id', 'phtml_'+data.id);
    $(item).attr('item_id', data.id);
    $(item).attr('title', data.title);
    
  } else if (data.action == "edit"){
    
    $("#phtml_"+data.id).attr('title', data.title);
    $("#tree").jstree("set_text", '#phtml_'+data.id, data.title);
    
  }
  
  $.fancybox.close();
} 

function edit_node(obj){
  
  $.fancybox({
    type: 'ajax',
    href: url_get_form+"?item="+obj.attr("item_id")
  });
    
}

function remove_node(obj){

  if(!confirm("Уверены, что хотите удалить?")) return false;

  $("#tree").jstree("remove", "#"+obj.attr('id'));

  $.ajax({
    type: 'get',
    url: url_remove,
    data : {
      "item_id" : obj.attr("item_id")
    }
  });

}

function create_node(obj){
    
  parent = obj.attr("item_id");
    
  $.fancybox({
    type: 'ajax',
    href: url_get_form,
    onComplete: function(){
      $('#sf_category_parent').val(parent);
    }
  });
    
}
  
function form_button_disabled(){
  
  $("#item_submit").attr("disabled", "disabled");
    
}
  
function form_button_enabled(){
    
  $("#item_submit").removeAttr("disabled");
    
}