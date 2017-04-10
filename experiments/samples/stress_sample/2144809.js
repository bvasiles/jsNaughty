jQuery(document).ready(function($) {
			$(".news span").mouseover(function(){
				$.ajax({
				url:"core/News/News.php",
				type:"GET",
				data:{'s':'true','ctr':'right'},
				success: function(data, status, request){
					$('.news table tr.top td.right').html(data);
				}
			});
			
				$.ajax({
				url:"core/News/News.php",
				type:"GET",
				data:{'s':'true','ctr': 'bottom'},
				success: function(data, status, request){
					$('.news table tr.bottom').html(data);
				}
			});				
			});
						
			$(".tutorials span").mouseover(function(){				
				$.ajax({
				url:"core/Tutorial/Tutorial.php",
				type:"GET",
				data:{'s':'true','ctr':'left'},
				success: function(data, status, request){
					$('.tutorials table tr.top td.left').html(data);
				}
			});
			$.ajax({
				url:"core/Tutorial/Tutorial.php",
				type:"GET",
				data:{'s':'true','ctr':'right'},
				success: function(data, status, request){
					$('.tutorials table tr.top td.right').html(data);
				}
			});
			$.ajax({
				url:"core/Tutorial/Tutorial.php",
				type:"GET",
				data:{'s':'true','ctr':'bottom'},
				success: function(data, status, request){
					$('.tutorials table tr.bottom').html(data);
				}
			});
					
			});
			
			});
			jQuery(document).ready(function($){
			$(".tutorials").mouseover(function(){$(".tutorials table tr.top td.right p a").eq(0).mouseover(function(){
																																				$(".subject-form").show();
																																				$(".class-form").hide();});});
			$(".tutorials").mouseover(function(){$(".tutorials table tr.top td.right p a").eq(1).mouseover(function(){
																																				$(".class-form").show();
																																				$(".subject-form").hide();});})
		});
		function runs(){
			var order= $(".subject").val();
			$.ajax({
			url:"core/Tutorial/Tutorial.php",
			type:"GET",
			data:{'subject':order,'ctr':'left','s':'true'},
			success: function(data, status, request){
					$('.tutorials table tr.top td.left').html(data);
					}
				});
		}
		function runc(){
			var order= $(".class").val();
			$.ajax({
			url:"core/Tutorial/Tutorial.php",
			type:"GET",
			data:{'class':order,'ctr':'left','s':'true'},
			success: function(data, status, request){
					$('.tutorials table tr.top td.left').html(data);
					}
				});
		}
			
			