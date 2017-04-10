function initiate_geolocation() {  
  navigator.geolocation.getCurrentPosition(handle_geolocation_query);  
}  
  
function handle_geolocation_query(position){  
  var MyLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var myOptions = {
    center: MyLatLng,
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions); 

  var marker = new google.maps.Marker({
      position: MyLatLng,
      map: map,
      title: "You are here!"
  });
}

