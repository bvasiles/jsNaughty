/**
 * 流程处理函数
 *
 * @author rongjihuang@gmail.com
 * @date 2012-06-27
 * @dep jquery
 */
if(!window['bc'])window['bc']={};
bc.flow = {
	/**
	 * 选择流程
	 * @param {Object} option 配置参数
	 * @option {Boolean} isNewVersion [可选]是否只显示最新版本,默认true						
	 * @option {Boolean} multiple [可选]是否允许多选，默认false
	 * @option {Boolean} paging [可选]是否分页，默认true
	 * @option {Boolean} constraint [可选]是否受发起权限控制，默认true
	 * @option {Function} onOk 选择完毕后的回调函数，
	 * 单选返回一个对象 格式为{
	 *		id:[id],
	 *		name:[name],				--名称
	 *		key:[key],					--key值
	 *		deployTime:[deployTime]		--部署时间
	 *	}
	 * 如果为多选则返回的是对象集合，[对象1,对象2]。
	 */
	select: function(option) {
		// 构建默认参数
		option = jQuery.extend({
			mid: 'selectProcess',
			paging: false,
			title: '选择流程',
			constraint: true
		},option);
		
		// 将一些配置参数放到data参数内(这些参数是提交到服务器的参数)
		option.data = jQuery.extend({
			multiple: false,
			isNewVersion : true
		},option.data);
		if (option.title)
			option.data.title = option.title;
		if(option.multiple === true)
			option.data.multiple = true;
		if(option.isNewVersion === true)
			option.data.isNewVersion = true;
		if(option.constraint === true)
			option.data.constraint = option.constraint;
		
		//弹出选择对话框
		bc.page.newWin(jQuery.extend({
			url: bc.root + "/bc-workflow/select/"+ (option.paging ? "paging" : "list"),
			name: option.title,
			mid: option.mid,
			afterClose: function(status){
				if(status && typeof(option.onOk) == "function"){
					option.onOk(status);
				}
			}
		},option));
	},
	
	/**
	 * 发起流程
	 * @param {Object} option 配置参数
	 * @option {Boolean} isNewVersion [可选]是否只显示最新版本,默认true						
	 * @option {Boolean} multiple [可选]是否允许多选，默认false
	 * @option {Boolean} paging [可选]是否分页，默认false
	 * @option {Function} onStart 启动后的回调函数，
	 * 单选返回一个对象 格式为{
	 *		id:[id],
	 *		name:[name],				--名称
	 *		key:[key],					--key值
	 *		deployTime:[deployTime]		--部署时间
	 *	}
	 * 如果为多选则返回的是对象集合，[对象1,对象2]。
	 */
	start: function(option) {
		$page=$(this);
		bc.flow.select({
			constraint : option.constraint,
			onOk: function(def){
				logger.info($.toJSON(def));
				bc.ajax({
					dataType: "json",
					url: bc.root + "/bc-workflow/workflow/startFlow?id=" + def.id,
					success: function(json){
						if(json&&typeof(option.onStart) == "function"){
							option.onStart(json);
						}else{
							if(json.success === false){
								bc.msg.alert(json.msg);// 仅显示失败信息
							}else
								bc.msg.slide(json.msg);
						}
					}
				});
			}
		});
	},
	
	/**
	 * 打开工作空间
	 * @param {Object} option 配置参数
	 * @option {String} id 流程实例ID
	 * @option {String} name 标题 默认"工作空间"
	 */
	openWorkspace: function(option) {
		bc.page.newWin({
			url: bc.root+"/bc-workflow/workspace/open?id=" + option.id,
			name: option.name || "工作空间",
			mid: "workspace::" + option.id,
			data: option.data || null
		});
	},
	
	/**
	 * 选择用户信息
	 * @param {Object} option 配置参数
	 * @option {String} selecteds 已选择用户的id列表，多个值用逗号连接
	 * @option {String} excludes 要排除显示的项的值，多个值用逗号连接
	 * @option {String} taskId 任务id
	 * @option {Boolean} multiple 是否允许多选，默认false
	 * @option {Boolean} history 是否选择ActorHistory信息，默认true，设为false选择Actor信息
	 * @option {Function} onOk 选择完毕后的回调函数，函数第一个参数为选中的用户信息(多选时数组，单选时时对象)
	 */
	selectUser : function(option) {
		option.data = jQuery.extend({
			multiple: false,
			history: false,
			status: "0"
		},option.data);
		if(option.selecteds)
			option.data.selecteds = option.selecteds;
		if(option.excludes)
			option.data.excludes = option.excludes;
		if(option.taskId)
			option.data.taskId = option.taskId;
		if(option.history === false)
			option.data.history = false;
		if(option.multiple === true)
			option.data.multiple = true;
		if(option.status)
			option.data.status = option.status;
		
		option = jQuery.extend({
			url: bc.root + "/bc-workflow/selectUsers/paging",
			name: "选择用户信息",
			mid: "selectUserflow",
			history: true,
			afterClose: function(status){
				if(status && typeof(option.onOk) == "function"){
					option.onOk(status);
				}
			}
		},option);
		
		bc.page.newWin(option);
	},/**
	 * 获取流程全局变量
	 * @param {Object} option 配置参数
	 * @option {String} id 流程实例id
	 * @option {String} globalKeys 流程全部变量key 多个逗号隔开 如key1,key2,key3
	 * @option {Function} onReturn 选择完毕后的回调函数，
	 * 格式为{
	 *		key1:[value1],
	 *		key2:[value2],				
	 *		key3:[value3]
	 *	}
	 */
	findGlobalValus: function(option) {
		bc.ajax({
			dataType: "json",
			data:{id:option.id,globalKeys:option.globalKeys},
			url: bc.root + "/bc-workflow/workflow/findGlobalValues",
			success: function(json){
				if(json && typeof(option.onReturn) == "function"){
					option.onReturn(json);
				}
			}
		});
	}
};