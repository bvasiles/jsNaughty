var i = 0;
     var tem = "";
     var real = "";
       $('#tagin').bind("keydown",function(e){
           $('#tagin').val($('#tagin').val().replace(" ","")); 
           //��Ӧ�˸��ɾ�����һ����ǩ
           if(e.which == 8 && i > 0 && $('#tagin')[0].selectionStart == 0){
              var str = "<span>"+$('#'+i+'').parent().html()+"</span>";
              var del =  $('#'+i+'').parent().text().replace(" �","");
              real = real.replace(del+",","");
              str = str.replace(/\"/g, '\'');
              tem = tem.replace(str,"");
              $('#'+i+'').parent().remove(); 
              $('#tag_real').val(real);
              i--;
             }
            //��Ӧճ����
            if ( e.ctrlKey && (e.which == 86 || e.which==118) ){
              //todo....
            } 
       });
       $('#faketag').click(function(){
          $('#tagin').focus();
       });
     
     $('#tagin').bind("keyup",function(){  
         //����5����ǩ.
         if(i >= 5)
           $('#tagin').val("");
         //ÿ������ո�ʱת���ɱ�ǩ.   
         if($('#tagin').val().indexOf(" ") != -1 && $.trim($('#tagin').val()).length >= 1){
           //������ظ��Ľ�ֹ����.    
           if($('#tagout').text() !="" && $('#tagout').text().indexOf($('#tagin').val()) != -1){
             $('#tagin').val("");
             return false;
            }  
           i++;
           tem += "<span>"+$('#tagin').val()+"<span id='"+i+"' class='close'>�</span></span>";
           real += $.trim($('#tagin').val())+",";
           $('#tagout').html(tem);
           $('#tagin').val("");
           //Ϊÿ���¼ӵı�ǩ��ӵ���¼�.
           $('.close').bind("click", function(){
              var del =  $(this).parent().text().replace("  �","");
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

