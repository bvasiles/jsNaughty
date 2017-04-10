 (function() {

 
	Rodin.viewport_type = {
	
		floorplan: 0,
		viewport:  1
	}
	
    // ---- class MouseEvent
    Rodin.MouseEvent = function(event, target_j) {
    
        this.event = event;
		//this.target_j = target_j;
		
		if (target_j.hasClass('floorplan')) {
		
			this.viewport_type = Rodin.viewport_type.floorplan;
		}
		else if (target_j.hasClass('viewport')) {
		
			this.viewport_type = Rodin.viewport_type.viewport;
		}
		else {
		
			Rodin.error('Rodin.MouseEvent: unknown dom target type');
		}
		
        var offset = target_j.offset();
        this.viewport_position = new Rodin.Vector2
        (
            event.pageX - offset.left,
            event.pageY - offset.top
        );
    }
    
    Rodin.MouseEvent.prototype = {
        
		is_floorplan: function () {
		
			return this.viewport_type == Rodin.viewport_type.floorplan;
		},
		
		is_viewport: function () {
		
			return this.viewport_type == Rodin.viewport_type.viewport;
		}
    }
    
    // ---- class ToolManager
    
    Rodin.ToolManager = function(default_tool) {
		
        this.current_tool = null;
		this.default_tool = default_tool;		
		this.set_current_tool(default_tool);
		
		this.use_default_tool = false;
    }
    
    Rodin.ToolManager.prototype = {
    
        set_current_tool: function(new_tool) {
			
			if (new_tool != this.current_tool) {
			
				// désactive le tool courant:
				if (this.current_tool != null) {
				
					this.current_tool.desactivate();
					this.current_tool = null;
				}
				
				this.current_tool = new_tool;
				
				//if (this.current_tool != null) {
			 
					this.current_tool.activate();
				//}
			}
        },
		
		active_default_tool: function() {
		
			this.set_current_tool(this.default_tool);
		},
		
        mouse_down: function(event, target_j) {
		
			// shiftKey, ctrlKey, altKey
			this.use_default_tool = event.ctrlKey;
			
			this._mouse_event(event, target_j, this._active_tool().mouse_down);
        },
        
        mouse_move: function(event, target_j) {
		
			this._mouse_event(event, target_j, this._active_tool().mouse_move);
        },
        
        mouse_up: function(event, target_j) {
			
			this._mouse_event(event, target_j, this._active_tool().mouse_up);
        },
		
		_active_tool: function() {
		
			return this.use_default_tool ? this.default_tool : this.current_tool;
		},
		
		_mouse_event: function(event, target_j, mouse_fn) {
			
			var tool = this._active_tool();
			
			var mouse_event = new Rodin.MouseEvent(event, target_j);
			if (tool != null && tool.accept_event(mouse_event)) {
			
				mouse_fn.call(tool, mouse_event);
			}
		}
		
    }
    
    
})()