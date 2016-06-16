/**
 * private function
 * This function creates an abstract item list. It is used for the worlds and
 * brains in the lists where you can select, delete, edit etc. See BrainList.js
 * and WorldList.js
 */
function getItemList (events, textElems, baseElem) {
	var highlighted = 0; // the id of the item currently highlighted
	var list = new LogicalGroup(events, textElems);

	/**
	 * adds a new item to the list
	 * @param name The name of the item
	 * @param id The unique id number of the item
	 * @param preset A boolean value stating whether or not the item is built
	 *        in to the game.
	 */
	list.add = function (name, id, preset) {
		// compile individual html elements
		var list_item = world_name = btn_group = edit_btn = del_btn = pick_btn = "";
		list_item  += "<li class='ag-" + baseElem + "-item' id='" + id + "'>";
		
		world_name += "<a href='#'>";
		world_name +=   name;
		
		btn_group  +=     "<div class='btn-group pull-right'>"
		
		if (!preset) { // only include delet  & edit button for custom brains
			del_btn +=      "<a class='btn btn-mini btn-danger' href='#'>";
			del_btn +=        "<i class='icon-remove-sign icon-white'></i>";
			del_btn +=      "</a>";

			edit_btn +=     "<a class='btn btn-mini btn-warning' href='#'>";
			edit_btn +=       "<i class='icon-pencil icon-white'></i>";
			edit_btn +=     "</a>";
		}
		
		pick_btn   +=       "<a class='btn btn-mini btn-success' href='#'>";
		pick_btn   +=         "use &raquo;";
		pick_btn   +=       "</a>";

		btn_group  +=     "</div>"

		world_name +=   "</a>";

		list_item  += "</li>";

		// attach the html elements to the DOM and set up events & callbacks

		// create list item
		var li = $(list_item).prependTo("#ag-" + baseElem + "-list");
		// create link element
		var a = $(world_name).appendTo(li);
		// create button group
		var btns = $(btn_group).appendTo(a).hide();


		var that = this; // standard js closure fiddle
		if (!preset) {
			// only allow deletes and edits for non-preset items
			var del = $(del_btn).appendTo(btns);
			del.click(function (event) { 
				event.stopPropagation();
				that.trigger("delete", [id, highlighted]); 
			});

			var edit = $(edit_btn).appendTo(btns);
			edit.click(function () { that.trigger("edit", [id]); });
		}

		var pick = $(pick_btn).appendTo(btns);
		pick.click(function (event) { 
			event.stopPropagation();
			that.trigger("pick", [id]); 
		});

		// show buttons only on hover
		li.hover(
			function (event) {
				btns.show();
			},
			function (obj) {
				btns.hide();
			}
		);

		
		li.click(function () { that.trigger("select", [id]); });
	};

	/**
	 * highlights the desired item
	 * @param id The id of the item to be highlighted
	 */
	list.highlight = function (id) {
		$(".ag-" + baseElem + "-item[id='" + highlighted + "']").removeClass("active");
		$(".ag-" + baseElem + "-item[id='" + id + "']").addClass("active");
		highlighted = id;
	};

	/**
	 * clears the list
	 */
	list.clear = function () {
		$("#ag-" + baseElem + "-list").html("");
	};

	/**
	 * removes the desired item
	 * @param id The id of the item to be removed
	 */
	list.remove = function (id) {
		$(".ag-" + baseElem + "-item[id='" + id + "']").remove();
	};

	/**
	 * clears the list and displays an "empty" message
	 */
	list.sayEmpty = function () {
		$("#ag-" + baseElem + "-list").html('<li class="nav-header">empty</li>');
	};

	return list;
}

