function tabSwitch_2(active, number, tab_prefix, content_prefix) {  
  
    for (var i=1; i < number+1; i++) {  
      document.getElementById(content_prefix+i).style.display = 'none';  
      document.getElementById(tab_prefix+i).className = '';  
    }  
    document.getElementById(content_prefix+active).style.display = 'block';  
    document.getElementById(tab_prefix+active).className = 'active';      
}   