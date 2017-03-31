//Filename: boilerplate.js
/**
 *
 *
 * @author Robert Säll <pr_125@hotmail.com>
 */
var pictureMapView = Backbone.View.extend({
    
    template: _.template($('#picturesmaptemplate').html()),
    map: {},
    infoWindow: {},
    
    initialize: function() {
        var self = this;
		var user_id = this.options.user_id || 0;
		var tag = this.options.tag || null;
		this.collection = new pictureCollection();
		
		if (user_id != 0 ) {
			this.collection.fetchByUser(user_id, {
				success: function() {
					console.log('success (fetchByUser)');
					//self.render();
					self.centerFirstPicture();
					self.renderPictures();
					self.renderMarkers();
				},
				error: function() {
					console.log(arguments);
				}
			});
		} else if (tag != null) {
			this.collection.fetchByTags(tag, {
				success: function() {
					console.log('success (fetchByTag)');
					//self.render();
					self.centerFirstPicture();
					self.renderPictures();
					self.renderMarkers();
				},
				error: function() {
					console.log(arguments);
				}
			});
		}
        this.pictureListView = new pictureListView({collection: this.collection});
        vent.on('scrollTo', this.onScrollTo, this);
        
        this.infoWindow = new google.maps.InfoWindow({
            disableAutoPan: true
        });
    },
    render: function() {
        $(this.el).html(this.template());
        
        this.renderMap();
    },
    renderPictures: function() {
        $(this.el).find('#pictureListContainer').html(this.pictureListView.render().el);
    },
    renderMap: function() {
        
        var myOptions = {
            center: new google.maps.LatLng(36.853046944444 , 28.271021111111 ),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.map = new google.maps.Map(document.getElementById("map_canvas"),
        myOptions);
        
    },
	centerFirstPicture: function() {
		var lat = this.collection.at(0).get('latitude');
		var lng = this.collection.at(0).get('longitude')
		this.map.panTo( new google.maps.LatLng(lat, lng));
	},
    renderMarkers: function() {
        var self = this;
        var image = BASE_URL + 'icons/16x16/image.png';
        // All markers
        this.collection.each(function(m) {
            var myLatLng = new google.maps.LatLng(m.get('latitude'), m.get('longitude'));

            var marker = new google.maps.Marker({
                position: myLatLng,
                map: self.map,
                icon: image,
                model: m
            });
            
            google.maps.event.addListener(marker, 'mouseover', function(mouseEvent) {
                var model = this.model;
                self.infoWindow.setContent('<img src="' + model.get('uri_medium') + '" />' +
                ' <br />By ' + model.get('name') + ' ' + model.get('surname') + ' at ' + model.get('photo_shot'));

                self.infoWindow.open(self.map, this);
            });
            google.maps.event.addListener(marker, 'mouseout', function(mouseEvent) {
                self.infoWindow.close();
            });
            
        });
    },
    onScrollTo: function(event) {
        this.map.panTo(new google.maps.LatLng(
            event.lat, 
            event.lng
        ));
        console.log('map::onScrollTo');
    },
	close: function() {
		$(this.el).undelegate();
	}
});