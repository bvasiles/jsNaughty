Ext.define('AM.controller.master.employee.Employee', {
			extend : 'Ext.app.Controller',

			views : ['master.employee.EmployeeList'],
			stores : ['master.employee.Employees'],
			models : ['master.employee.Employee'],

			init : function() {
				this.control({
							
							'employeeList button[text=Add]' : {
								click : this.addEmployee
							},
							'employeeList button[text=Delete]' : {
								click : this.deleteEmployee
							},
							'employeeList button[action=save]' : {
								click : this.saveEmployee
							}


						});

			},
			deleteEmployee : function(button) {
				var viewport = button.up('viewport');
				var grid = viewport.down('employeeList');
				var selection = grid.getView().getSelectionModel()
						.getSelection()[0];
				if (selection) {
					this.getStore('master.employee.Employees').remove(selection);
					this.getStore('master.employee.Employees').sync();
				}
			},

			addEmployee : function(button) {
				var record = new AM.model.master.employee.Employee();
				this.getStore('master.employee.Employees').insert(0, record);
			},
			
			saveEmployee : function(button) {
				
				this.getStore('master.employee.Employees').sync();
			}			
		});