function updatePhoto(info) {
    ADS.$('previewPhoto').src = info.webHref;
    ADS.removeChildren('photoFile').appendChild(
        document.createTextNode(info.file));
    ADS.removeChildren('photoExposure').appendChild(
        document.createTextNode(info.exposure));
    ADS.removeChildren('photoFStop').appendChild(
        document.createTextNode(info.fStop));
    ADS.removeChildren('photoISO').appendChild(
        document.createTextNode(info.iso));
}

function updateGalleryList(files) {
    // Alter the page as necessary
    var thumb;
    for(var i=0 ; i<files.length ; i++) {
        if((thumb = ADS.$('photo'+(i+1)+'Thumb'))) {
            var li = ADS.$('photo'+(i+1));
            
            if (files[i]) {
                // Update the thumbnail with the new image
                thumb.src = '/source/chapter7/browser/thumbs/' + files[i];
                thumb.title = 'Photo: ' + files[i];
                thumb.alt = 'Photo: ' + files[i];
                ADS.removeClassName(li,'noFile');
                li.getElementsByTagName('A')[0].href = '#photo/' + files[i].split('.')[0];
            } else {
                // There's no thumbnail file so hide this one
                thumb.src = '';
                thumb.title = '';
                thumb.alt = '';
                ADS.addClassName(li,'noFile');
                li.getElementsByTagName('A')[0].href = '';
            }
        }
    }
}

ADS.addLoadEvent(function() {

    ADS.actionPager.register('start',function(hash) {
        // Any starting event you want to add
        // This will be invoked when the page loads 
        // without any hash
    });

	// Photo change listener
	ADS.actionPager.register(
		/photo\/([0-9a-z-]+)\/{0,1}$/i,
		function(hash,photo) {
	
			// Send a queued ajaxRequest to fetch the photo
			ADS.ajaxRequestQueue(hash,{
				// The server is returning an application/json response
				jsonResponseListener:function(response) {
					// Update the thumbnail navigation with the 
					// new list (if any)
					updateGalleryList(response.currentPageFiles);
					// Update the preview
					updatePhoto(response.currentPhoto);
		
					// Update the document title
					document.title = 'Photo Album Photo ' 
						+ response.currentPhoto.file;
				}
			},'photoBrowserQueue'); 
		}
	);

    // Page change listener
    ADS.actionPager.register(
        /page\/([0-9]+)\/{0,1}$/i,
        function(hash,page) {
            
            // Send a request to fetch the new page info
            // Follows the same idea as the photo listener
            ADS.ajaxRequestQueue(hash,{
                jsonResponseListener:function(response) {
                    updateGalleryList(response.currentPageFiles);
                    updatePhoto(response.currentPhoto);
                    document.title = 'Photo Album Page ' 
                        + response.currentPage;
                }
            },'photoBrowserQueue');

    });

    // Start the actionPager by scanning for ajaxify links and 
    // make the root of the hashes start after the browser folder
    ADS.actionPager.init('ajaxify','/source/chapter7/browser/');
});