describe("Bookmarks", function() {
	
	var olink = opera.link;
	var bookmarks = opera.link.bookmarks;
	var server = OLinkServer;
	
	function cb(data) {
		var response = '';
		if (typeof data.response != 'object')
			response = data.response;
		else
			response = writeObject(data.response);
		
		console.debug('status: ' + data.status + '\nresponse: ' + response);
	}
	
	//olink.debug = true;
	authorize();

	beforeEach(function() {
		setupBookmarks();
	})

	it('GET request to /bookmark/ should return 405: Method Not Allowed', function() {
		var callback = sinon.spy();
		bookmarks.get('', callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.MethodNotAllowed,
			response: ''
		});	
	});

	it('should be able to get all bookmarks', function() {
		var callback = sinon.spy();
		bookmarks.getAll(callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: bookmarkData
		});
	});
	
	it('should be able to get a bookmark by ID', function() {
		var callback = sinon.spy();
		bookmarks.get(bookmarkId, callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: server.findById(bookmarkData, bookmarkId)
		});
	});
	
	it("should be able to get a bookmark folder's children by its ID", function() {
		var callback = sinon.spy();
		bookmarks.getAll(folderId, callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: server.findById(bookmarkData, folderId).children
		});
	})
	
	it('should be able to get a bookmark within a folder by its ID', function() {
		var callback = sinon.spy();
		bookmarks.get(folderId + '/' + childId, callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: server.findById(bookmarkData, folderId + '/' + childId)
		});
	});
	
	it('should be able to create a bookmark', function() {
		var callback = sinon.spy();
		bookmarks.create({title: 'Test Bookmark', uri: 'http://opera.com'}, callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: createBookmarkData
		})
	});
	
	it('should be able to create a bookmark folder', function() {
		var callback = sinon.spy();
		bookmarks.createFolder({title: 'Test Folder'}, callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: createFolderData
		})
	});
	
	it('should be able to create a bookmark separator', function() {
		var callback = sinon.spy();
		bookmarks.createSeparator(callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: createSeparatorData
		})
	});
	
	it('should be able to move a bookmark relative to an item', function() {
		var callback = sinon.spy();
		bookmarks.move(bookmarkId, folderId, 'before', callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: server.findById(bookmarkData, bookmarkId),
		})
	});
	
	it('should be able to move a bookmark into a folder', function() {
		var callback = sinon.spy();
		bookmarks.move(bookmarkId, folderId, 'into', callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: server.findById(bookmarkData, bookmarkId),
		})
	});
	
	
	it('should be able to delete an item', function() {
		var callback = sinon.spy();
		bookmarks.deleteItem(bookmarkId, callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Deleted,
			response: ''
		})
	})
	
	it('should not be able to delete the trash folder', function() {
		var callback = sinon.spy();
		bookmarks.deleteItem(trashId, callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.BadRequest,
			response: 'Bad Request'
		})
	})
	
	it('should be able to trash an item', function() {
		var callback = sinon.spy();
		bookmarks.trash(bookmarkId, callback);
		server.respond();
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: server.findById(bookmarkData, bookmarkId)
		})
	})
	
	it('should be able to update an item', function() {
		var callback = sinon.spy();
		bookmarks.update(bookmarkId, {
			uri: 'http://chaosinacan.com',
			title: 'Chaos in a Can',
		}, callback);
		server.respond();
		
		var newItem = cloneObject(server.findById(bookmarkData, bookmarkId));
		newItem.properties.uri = 'http://chaosinacan.com';
		newItem.properties.title = 'Chaos in a Can';
		
		expect(callback).toHaveBeenCalledWith({
			status: olink.response.Ok,
			response: newItem
		})
	})
	
	
	function setupBookmarks() {
		var respond = OLinkServer.makeResponse;
		var server = OLinkServer.server;

		server.respondWith(/\/bookmark\/?(\?.+)?$/, function(xhr) {
			if (xhr.method == 'GET')
				OLinkServer.methodNotAllowed(xhr);
			else {
				var request = JSON.parse(xhr.requestBody);
				switch (request.api_method) {
					case 'create':
						if (request.item_type == 'bookmark')
							respond(200, 'json', createItem(request, createBookmarkData), xhr);
						else if (request.item_type == 'bookmark_folder')
							respond(200, 'json', createItem(request, createFolderData), xhr);
						else if (request.item_type == 'bookmark_separator')
							respond(200, 'json', createItem(request, createSeparatorData), xhr);
						else
							OlinkServer.badRequest(xhr);
						break;
						
					default:
						OLinkServer.methodNotAllowed(xhr);
				}
				
			}
		});

		server.respondWith(/\/bookmark\/descendants\/?(\?.+)?$/, function(xhr) {
			if (xhr.method == 'GET')
				respond(200, 'json', bookmarkData, xhr);
		});

		server.respondWith(/\/bookmark\/([0-9A-Z/]+)\/?(\?.+)?$/, function(xhr, id) {
			var item = OLinkServer.findById(bookmarkData, id);
			
			if (!item) 
				OLinkServer.notFound(xhr);
			else if (xhr.method == 'GET') 
				respond(200, 'json', item, xhr);
			else {
				var request = JSON.parse(xhr.requestBody);
				switch (request.api_method) {
					case 'move':
						var referenceItem = OLinkServer.findById(bookmarkData, request.reference_item);
						var pos = request.relative_position;
						
						if (item == referenceItem || (pos != 'before' && pos != 'after' && pos != 'into')) 
							OLinkServer.badRequest(xhr);		
						else if (pos == 'into' && request.reference_item == '')
							respond(200, 'json', item, xhr);
						else if (!referenceItem || (pos == 'into' && referenceItem.item_type != 'bookmark_folder'))
							OLinkServer.badRequest(xhr);
						else
							respond(200, 'json', item, xhr);
						break;
						
					case 'update':
						var newItem = createItem(request, item);
						respond(200, 'json', newItem, xhr);
						break;
						
					case 'trash':
						if (item.properties.type == 'trash')
							OLinkServer.badRequest(xhr);
						else
							respond(200, 'json', item, xhr);
						break;	
						
					case 'delete':
						if (item.properties.type == 'trash')
							OLinkServer.badRequest(xhr);
						else
							OLinkServer.deleted(xhr);

						break;
						
					default:
						OLinkServer.methodNotAllowed(xhr);
				}
			}
		});

		server.respondWith(/\/bookmark\/([0-9A-Z/]+)\/descendants\/?(\?.+)?$/, function(xhr, id) {
			if (xhr.method == 'GET') {
				var data = OLinkServer.findById(bookmarkData, id).children;
				respond(200, 'json', data, xhr);
			}
		});

	}
	
	// Simulates creating a bookmark item
	function createItem(props, template) {
		// duplicate the template object
		var item = cloneObject(template);
		for (var key in props) {
			switch (key) {
				case 'api_method':
				case 'api_output':break;
				case 'item_type':
					item[key] = props[key];
					break;
					
				default:
					item.properties[key] = props[key];
			}
		}

		return item;
	}
	

	var folderId = '4E1601F6F30511DB9CA51FD19A7AAECA';
	var trashId = '4E1601F6F30511DB9CA51FD19A7AAECA';
	var childId = '740C2D4ABC09468DB5A26170AF2609E6';
	var bookmarkId = 'D57C973715B847CAB4A8B8398D325CAC';
	

	var bookmarkData = [
		{
			'item_type': 'bookmark_folder',
			'id': folderId,
			'properties': {
				'show_in_panel': false,
				'title': 'Trash',
				'panel_pos': -1,
				'show_in_personal__bar': false,
				'type': 'trash',
				'personal_bar_pos': -1
			},
			'children': [
				{
					'item_type': 'bookmark',
					'id': childId,
					'properties': {
						 'created': '2011-04-24T02:39:52Z',
						 'uri': 'http://test.com',
						 'title': 'Trash Test'
					}
				}
			]
		},
		{
			'item_type': 'bookmark',
			'id': bookmarkId,
			'properties': {
				'created': '2011-04-19T04:39:35Z',
				'uri': 'http://opera.com',
				'title': 'Test Bookmark'
			}
		}
	]
	
	var createBookmarkData = {
		"item_type": "bookmark",
		"id": "631945F274D24110A6FF963189285D2F",
		"properties": {
			"created": "2011-08-02T04:38:13Z",
			"uri": "http://opera.com",
			"title": "Test Bookmark"
		}
	}
	
	var createFolderData = {
		"item_type": "bookmark_folder",
		"id": "00DFB26468614E2D9CA560A930B3DDD4",
		"properties": {
			"created": "2011-08-02T04:54:31Z",
			"title": "Test Folder"
		}
	}
	
	var createSeparatorData = {
		"item_type": "bookmark_separator",
		"id": "1F468DD981EB4B6D93B5BACEDE119180",
		"properties": {}
	}
	
});


