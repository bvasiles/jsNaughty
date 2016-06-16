angular.module('demo',['ngRoute', 'ngAnimate'])
.run(function($templateCache, $rootScope, $window){
	// templates
	var path
	,template = {
		'dashboard.html': '<header><h1>Security Insight for f15hb0wn.com</h1></header><bar-chart api="/api/stats.json"></bar-chart>'
		+ '<section class=details><threat api="/api/threat.json"></threat><identities api="/api/identities.json"></identities></section>'
		,"404.html": "<p>Sorry, couldn't find <a href='{{url}}'><code>{{url}}</code></a></p>"	
		,"params.html":"<h1>params</h1><div ng-repeat='(key, val) in params'>{{key}}:{{val}}</div>"
	};

	for (path in template) {
		$templateCache.put(path, template[path]);
	};
})
.config(function($locationProvider, $routeProvider){
	$locationProvider.html5Mode(true);
	$routeProvider
	.when('/', {
	templateUrl: 'dashboard.html'
	,resolve: {
	}
	,controller: function($scope, $location, $timeout){
	
	}})
	.otherwise({templateUrl:'404.html', controller: function($scope){
			$scope.url = location.pathname + location.search + location.hash;
	}
	})
})
.directive('barChart', function($http){
/*
stats object: organizational, global
	for each array of items (time, requests): [ 1396594800, 5797 ],
*/
	return {
		restrict: 'E'
		,transclude: true
		,replace:true
		,scope:{api:'@'}
		,template: '<section class="bar-chart barChart" ng-class="{\'show-stats-local\':showTraffic.local,\'show-stats-global\':showTraffic.global}"><nav><h3>Adjust traffic view:</h3> <input ng-model="showTraffic.local" type=checkbox ng-attr-id="{{i+\'-local\'}}"><label class=local-label ng-attr-for="{{i+\'-local\'}}">Your Traffic</label><input ng-model="showTraffic.global" type=checkbox ng-attr-id="{{i+\'-global\'}}"><label class=global-label ng-attr-for="{{i+\'-global\'}}">Global</label></nav></section>'
		,controller: function($scope){
			$scope.stats = {};
			$scope.i = ['_',Date.now(), Math.random()].join('').replace(/[^a-z0-9_-]/gi,'');
			$scope.showTraffic = {
				local:true 
				,global: true
			};
			// TODO setup re-scaling for various traffic states to re-render and re-scale
			// the bar charts + y axis (helpful when the local traffic is very low relative to global)
		}
		,link: function(scope, element, attr, ctrl){
			$http.get(attr.api).success(function(res){
			var el = element[0], svg, infos
			, margin = 40 , height = 400 - (margin), width = 1000 - (margin * 2)
			, xScale, yScale, xAxis, yAxis;

				scope.stats = res;
				// axes + data
				scope.stats.layers = [
					{name:'x-axis', type:'axis', data:[]}
					,{name:'y-axis', type:'axis', data:[]}
				].concat(
				['global','organizational'].map(function(d,i,a){
					return {name:d, type:'data', data:res[d]}
				})
				);

				xScale = d3.time.scale.utc().range([0,width]);
				yScale = d3.scale.linear().range([height,0]);
				xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickFormat(d3.time.format('%H:%M')).tickSize(0);
				yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(8).tickSize(width);

				el = d3.select(el);

				svg = el.append('svg')
				.attr('height',height + margin)
				.attr('width',width + margin)
		//		.attr('viewBox','0 0 '+width+' '+height)//(width+margin.right+margin.left) + ' '+(height+margin.top+margin.bottom))
		//		.attr('preserveAspectRatio','xMidYMid meet')
				.datum(scope.stats);
				infos = document.createElement('div');
				infos.id = scope.i + '-infos';
				infos.className = 'infos';
				element.append(infos);
				element.on('mouseover',function(e){
					var d,i,global,local,x,q,margin = 3;
					if(e.target.nodeName !== 'rect' || !(d = e.target.parentNode).classList.contains('bar')) return;
					infos.classList.remove('active');
					// expando
					i = d.i;
					if((q=d.parentNode.querySelector('.active'))) q.classList.remove('active');
					d.classList.add('active');
/* TODO
					if(e.pageX+infos.offsetWidth>this.scrollWidth) x = 'right:'+((this.scrollWidth - e.pageX)-margin).toFixed(0)+'px;';
					else x = 'left:'+(e.pageX+margin).toFixed(0)+'px;';
*/
					x = 'left:'+(e.pageX+margin).toFixed(0)+'px;';
					d = d.__data__;
					global = scope.stats.global[i][1];
					local = scope.stats.organizational[i][1];
					infos.setAttribute('style',x);
					infos.innerHTML = 
						'<span class=time>'+d3.time.format('%b %e, %Y %H:%M')(new Date(d[0]))+'</span>'
						+ '<span><em>' + local + '</em> Your Requests</span>'
						+ '<span><em>' + global + '</em> Global Requests</span>'
						+ '<span><em>' + (local / global * 100).toFixed(2) + '%</em> Traffic Ratio</span>'
						+ '<span class=i>'+i+'</span>'
					infos.classList.add('active');
				})
				angular.element(infos).on('click',function(e){
					e.stopPropagation();
				}); // '
				angular.element(document).on('click',function(e){
					var i=0,l, list = infos.parentNode.querySelectorAll('.active');
					infos.classList.remove('active');
					while(l = list.item(i++)){ l.classList.remove('active'); }
				});

svg = svg
	.selectAll('g.layer')
	.data(function(d,i){
		return d.layers;
	});

svg.enter().append('g')
	.attr('class',function(d){
		return 'layer layer-'+d.name+' layer-'+d.type;
	}).attr('transform',function(d){
		return 'translate('+ (
		d.type === 'axis' ? (
			d.name === 'y-axis' ?
			(width+margin)+','+0//(margin)
			: margin+','+(height)
		): (
		+ d.name === 'organizational' ? margin+','+(height) : margin+','+(height)
		)
		) +')' + (d.type !== 'axis' ? 'scale(1, -1) ':'')
	});

scope.update = function(nuData, oldData, scope){
	var 
	global = nuData.global
	,local = nuData.organizational
	,bar
	,barsize = width / global.length
	,_barsize = barsize.toFixed(1);
	// update time range
	xScale.domain([ global[0][0], global[global.length-1][0] ]);
	// update requests
	yScale.domain([0, d3.max(global, function(d,i,a){ return d[1]; })]);

	d3.selectAll('g.layer-axis').each(function(d,i){
		switch(d.name){
		case 'y-axis':
			yAxis(d3.select(this))
		break;
		case 'x-axis':
			xAxis(d3.select(this))
		break;
		};
	});
	// data binding
	bar = svg.selectAll('g.bar').data(function(d,i){
		return d.data;
	});
	bar.enter().append('g')
	.attr('class','bar')
	.attr('transform',function(d,i){
		// expando
		this.i = i;
		return 'translate('+Math.round(i*barsize)+','+0+')'
	})

	// update
	bar.each(function(d,i){
		d3.select(this)
		.append('rect')
		.attr('class','barred')
		.attr('width',_barsize)
		.attr('height',function(d){
			return Math.round(height - yScale(d[1]));
		});
	});

	// exit
	bar.exit().remove();
	bar = false;
};
scope.$watch('stats', scope.update, true);
			}); // $http.get.success
		} // link
	}; // { directive }
}) // directive()
.directive('identities', function($http){
/*
identities array of items:
 {
	"rank":1,
	"queries":1,
	"origin":"Vinny Lariza (ad.office.opendns.com)",
	"originType":"ad_computer",
	"originId":15044849
 }
*/
	return {
		restrict: 'E'
		,transclude: true
		,replace:true
		,scope:{api:'@'}
		,template: '<table class=identities><thead><tr><th colspan=2>Top Identities by Request <small>as of {{time}}</small></th></tr></thead><tbody>'
			+ '<tr ng-repeat="item in identities" ng-class=item.originType><td>{{item.origin}}</td><td>{{item.queries}}</td></tr>'
			+ '</tbody></table>'
		,controller: function($scope){
			$scope.identities = {};
		}
		,link: function(scope, element, attr, ctrl){
				$http.get(attr.api).success(function(res){
					scope.identities = res.sort(function(a,b){ return a.rank - b.rank });
				});
		}
	};

})
.directive('threat', function($http){
/*
threat.json returns object:
{
 "attack_name":"",
 "threat_type":"",
 "ff_candidate":false,
 "asns":[
	1887
 ],
 "hosting_location":[
	"PL"
 ],
 "dga_score":false,
 "ips":[
	"148.81.111.111"
 ],
 "cname":""
}
*/
	return {
		restrict: 'E'
		,transclude: true
		,replace:true
		,scope:{api:'@'}
		,template: '<table class=threat><thead><tr><th colspan="4">Security Details</th></tr></thead><tbody>'
			+ '<tr ng-repeat="cells in rows"><th>{{key[cells[0]]}}</th><td>{{val(value[cells[0]])}}</td><th>{{key[cells[1]]}}</th><td>{{val(value[cells[1]])}}</td></tr>'
			+ '</tbody></table>'
		,controller: function($scope){
			$scope.rows = [
			['attack_name', 'hosting_location']
			,['dga_score', 'ips']
			,['ff_candidate', 'asns']
			];
			$scope.key = {
				attack_name: 'Security Category'
				,threat_type: 'Security Category'
				,ff_candidate: 'Fast Flux Candidate'
				,dga_score: 'Potential DGA'
				,hosting_location: 'Hosting Location'
				,asns: 'ASN'
				,ips: 'IP Address'
			};
			$scope.value = {};
			$scope.val = function(val){
				val = typeof val !== 'undefined' ? val : '';
				return val.join ? val.join(', ') : val;
			}
		}
		,link: function(scope, element, attr, ctrl){
				$http.get(attr.api).success(function(res){
					scope.value = res;
				});
		}
	};
})
.directive('cell',function(){
	return {
		restrict: 'E'
		,replace: true
		,scope: {name:'@'}
		,template: '<th>{{key()}}</th><td>{{value()}}</td>'
		,controller: function($scope){
console.log($scope.name);
			$scope.value = function(){
				var v = this.$parent.value[$scope.name] || '';
				return 5; v.join ? v.join(', ') : v;
			}
			$scope.key = function(){
				return 'attack_name';this.$parent.key[$scope.name]
			}
		}
	};
})
/*
.factory('api',function($http, $rootScope, $location, $timeout){
	var data = {
		state: 'good'
		,get: function(src){
			return data.req[src] || (data.req[src] = $http.get(src).then(function(res){
				data.model = res.data;
				data.model.forEach(function(d,i,a){
					var group = data._group;
					// get the group or create and use it if it doesn't exist
					group = group[ d.lane_id ] || (group[ d.lane_id ] = []);
					group.push(d);
				});
//					console.log('>>',data);
				return res;
			},function(res){ // error
				// TODO
				//data.req[] = false;
			}));
		}
		,req: {}
	};
	return data;
})
*/
