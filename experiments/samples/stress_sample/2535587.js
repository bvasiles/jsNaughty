/**
 * @author Chia-Yuan Hsiung
 */
Ti.include('database.js');

var win = Titanium.UI.currentWindow; 

//the data storage empty array
var data = []; 

//declare the ht tp cl ient object
var recipesHTTPClient = Titanium.Network.createHTTPClient();

//define search bar which will attach to  table view
var searchBar = Titanium.UI.createSearchBar({
	showCancel:true,
	height :43,
	top:0
});

//print out the searchbar value whenever it changes 
searchBar.addEventListener('change' , function(e){
	
	Ti.API.info('user searching for: ' + e.value);
});
//when the return key is hit, make searchBar get blur
searchBar.addEventListener('return' , function(e){
	searchBar.blur(); 
});

//when the cancel but ton is tapped,make searchBar get blur too
searchBar.addEventListener('cancel', function(e){
	searchBar.blur();
});
//end of search bar

//create refresh view and relative variable
var pulling = false;
var reloading = false;

var tableHeader = Titanium.UI.createView({
	backgroundImage:'img/header.png',
	width: 320,
	height: 120
})

var arrowImage = Titanium.UI.createImageView({
	backgroundImage:"img/refreshArrow.png",
	width:22,
	height:54,
	bottom:20,
	left:20
})
var statusLabel = Ti.UI.createLabel({ 
	text:"Pull to refresh...",
	left:85,
	width:200,
	bottom:28,
	height:"auto",
	color:"#FFF",
	textAlign:"center",
	font :{fontSize:14, fontWeight :"bold"},
	shadowColor:"#89a",
	shadowOffset:{x:0,y:1}
});
var actIndicator = Titanium.UI.createActivityIndicator({
	left:20,
	bottom:20,
	width: 40,
	height: 40
});
tableHeader.add(actIndicator);
tableHeader.add(arrowImage);
tableHeader.add(statusLabel);

//create a table view
var recipesTable = Titanium.UI.createTableView({
	height: 366,
	width: 	320,
	top: 	0,
	left: 	0,
	search: searchBar,
	filterAttribute:'filter'
}); 
recipesTable.headerPullView = tableHeader;
win.add(recipesTable);

//table scrolling function
recipesTable.addEventListener('scroll', function(e){
	if(Ti.Platform.osname != 'iphone'){
		Titanium.API.info("Ti.Platform.osname != 'iPhone':"+Ti.Platform.osname);
		return;
	}
	
	var offset = e.contentOffset.y;
	if(offset < -80.0 && !pulling)
	{
		pulling = true;
		arrowImage.backgroundImage = 'img/refreshArrow_up.png';
		statusLabel.text = "Release to refresh...";
	}else{
		pulling = false;
		arrowImage.backgroundImage = 'img/refreshArrow.png';
		statusLabel.text = "Pull to refresh...";
	}
});
recipesTable.addEventListener('scroll', function(e){
	if(Ti.Platform.osname != 'iphone'){
		return;
	}
	var offset = e.contentOffset.y;
	if(pulling && !reloading && e.contentOffset.y <= -80.0)
	{
		reloading = true;
		pulling = false;
		arrowImage.hide();
		actIndicator.show();
		statusLabel.text = "Reloading recipes...";
		recipesTable.setContentInsets({top:80},{animated:true});
		
		//null out the existing recipe data
		recipesTable.data = null;
		data =[];
		
		loadRecipes();
	}
});
//tablerow selected function: create new window
recipesTable.addEventListener('click', function(e){
	
	//get the selected row index
	var selectedRow = e.rowData;
	
	// create detail window
	var detailWindow = Titanium.UI.createWindow({
		_title:selectedRow._title, 
		_description:selectedRow._description,
		_link:selectedRow._link,
		backgroundColor:'#fff',
		url: 'detail.js',
		title:selectedRow._title,
		id:0
	});
	
	Titanium.UI.currentTab.open(detailWindow);
});
// this method will process the remote data 
recipesHTTPClient.onload = function() {
	
	//create a json object using the JSON.PARSE function
	
	var jsonObject = JSON.parse(this.responseText);
	
	//get through each item 
	for(var i = 0; i < jsonObject.query.results.entry.length; i++)
	{
		var aFeed = jsonObject.query.results.entry[i];
		
		//create table row
		var row = Titanium.UI.createTableViewRow({
			_title:aFeed.title.content,
			_description: aFeed.content.content,
			_link:aFeed.link.href,
			hasChild: true,
			className: 'recipe-row',
			filter: aFeed.title.content,
			height:'auto',
			backgroundColor: '#fff'
		});
		//title label for row at index i
		var titleLabel = Titanium.UI.createLabel({
			text: aFeed.title.content,
			font : {fontSize: 14, fontWeight : ' bold' },
			left: 70,
			top: 5,
			height: 20,
			width: 210,
			color:'#232'
		});
		
		row.add(titleLabel);
		
		//description view for row at index i
		var descriptionLabel = Titanium.UI.createLabel({
				font : {fontSize: 10, fontWeight : ' normal ' },
				left: 	70,
				top: 	titleLabel.height+5,
				width: 	200,
				color:	'#9a9'
		});
		
		if(aFeed.content.content.length == 0) {
			
			row._description = 'No description is available.';
			descriptionLabel.height = 20;
				
		}else{
			descriptionLabel.height = 45;
					
		}
		
		descriptionLabel.text = row._description; 
		row.add(descriptionLabel);
		
		row.height = titleLabel.height + descriptionLabel.height +15;
		//add our little icon to the left of the row 
		var iconImage = Titanium.UI.createImageView({
			image: 'img/eggpan.png',
			width: 50,
			height: 50,
			left: 10,
			top: 10 
		});
		row.add(iconImage);
		//add the row to data array
		data.push(row);
	}
	// set the data to tableview's data
	recipesTable.data = data;
	
	if(reloading == true){
		//when done, reset the header to its original style 
		recipesTable.setContentInsets({top:0},{animated:true});
		reloading = false;
		statusLabel.text = "Pull to refresh...";
		actIndicator.hide();
		arrowImage.backgroundImage = 'img/refreshArrow.png';
		arrowImage.show();
	 }
};


//this method will fire if there's an error in accessing the //remote data
recipesHTTPClient.onerror = function() {
	// log the error to our Ti tanium Studio console
	Ti.API.error(this.status + ' - ' + this.statusText);
};

loadRecipes();



// function
function loadRecipes(){	
	//open the recipes xml feed
	recipesHTTPClient.open('GET' , 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D\'http%3A%2F%2Fwww.foodandwine.com%2Ffeeds%2Flatest_recipes%3Fformat%3Datom\'&format=json&diagnostics=true');
	//execute the call to the remote feed 
	recipesHTTPClient.send();
}



