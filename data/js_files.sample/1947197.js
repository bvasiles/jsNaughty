var i = 0;
     var tem = "";
     var real = "";
       $('#tagin').bind("keydown",function(e){
           $('#tagin').val($('#tagin').val().replace(" ","")); 
           //ÏìÓ¦ÍË¸ñ¼üÉ¾³ı×îºóÒ»¸ö±êÇ©
           if(e.which == 8 && i > 0 && $('#tagin')[0].selectionStart == 0){
              var str = "<span>"+$('#'+i+'').parent().html()+"</span>";
              var del =  $('#'+i+'').parent().text().replace(" ×","");
              real = real.replace(del+",","");
              str = str.replace(/\"/g, '\'');
              tem = tem.replace(str,"");
              $('#'+i+'').parent().remove(); 
              $('#tag_real').val(real);
              i--;
             }
            //ÏìÓ¦Õ³Ìù¼ü
            if ( e.ctrlKey && (e.which == 86 || e.which==118) ){
              //todo....
            } 
       });
       $('#faketag').click(function(){
          $('#tagin').focus();
       });
     
     $('#tagin').bind("keyup",function(){  
         //ÏŞÖÆ5¸ö±êÇ©.
         if(i >= 5)
           $('#tagin').val("");
         //Ã¿´ÎÊäÈë¿Õ¸ñÊ±×ª»»³É±êÇ©.   
         if($('#tagin').val().indexOf(" ") != -1 && $.trim($('#tagin').val()).length >= 1){
           //Èç¹ûÓĞÖØ¸´µÄ½ûÖ¹ÊäÈë.    
           if($('#tagout').text() !="" && $('#tagout').text().indexOf($('#tagin').val()) != -1){
             $('#tagin').val("");
             return false;
            }  
           i++;
           tem += "<span>"+$('#tagin').val()+"<span id='"+i+"' class='close'>×</span></span>";
           real += $.trim($('#tagin').val())+",";
           $('#tagout').html(tem);
           $('#tagin').val("");
           //ÎªÃ¿¸öĞÂ¼ÓµÄ±êÇ©Ìí¼Óµã»÷ÊÂ¼ş.
           $('.close').bind("click", function(){
              var del =  $(this).parent().text().replace("  ×","");
              var str = "<span>"+$(this).parent().html()+"</span>";
              real = real.replace(del+",","");
              str = str.replace(/\"/g, '\'');
              tem = tem.replace(str,"");
              $(this).parent().remove(); 
              i--;
              $('#tag_real').val(real);
             });
         } 
         $('#tag_real').val(real);
     });

