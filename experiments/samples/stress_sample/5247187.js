var Polarium = require('/common/polarium_api').Polarium;
var CryptoJS  = require('/common/aes').CryptoJS;

var isFirstQueryItem = true;
var queryItemCount;

// Common Global Variables
var GV  =
{
    sessionID : '',
    currentWorkItemQueryID : 1,
    currentStage : '',
    previousStage : '',
    currentProjectId : '',
    removeAllChildren : function(viewObject){
        // alert("type: " + viewObject.type);
        if (typeof viewObject !== 'undefined' && typeof viewObject.children !== 'undefined') {
            //copy array of child object references because view's "children" property is live collection of child object references
            var children = viewObject.children.slice(0);
            var i;
            for (i = 0; i < children.length; ++i) {
        
                viewObject.remove(children[i]);

                if(children[i] !== null){

                    children[i] = null;
                }
            }
        }
    },
    //this function will erease all data which is stored in the database
    wipeData : function(){
        
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        //Delete Data
        db.execute('DELETE FROM queries');
        db.execute('DELETE FROM appinfo');
        db.execute('DELETE FROM credentials');
        
        //set to default
        db.execute('INSERT INTO appinfo DEFAULT VALUES');
        db.execute('INSERT INTO queries DEFAULT VALUES');
        
        db.close();
        
        //Navigate  to Login View
        Ti.App.fireEvent('notification',{ name:'switchView', body:{'view':'login', 'type':'full', 'params':'' } });
        
        //fire polarium logout request
        GV.logout(); 
        
    },
    getTmpPin : function(argument) {
        
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        //retrieve data
        var rows = db.execute('SELECT * FROM appinfo WHERE id IS ?', 1);
        
        var appData = {};
        
        while (rows.isValidRow()){
            var id = rows.fieldByName('id');
            Ti.API.log('db pin: '+rows.fieldByName('tmpPin'));
            appData = {
                //custom : this.decrypt(rows.fieldByName('custom')),
                tmpPin : this.decrypt(rows.fieldByName('tmpPin')),
                version : rows.fieldByName('version')
            };
            rows.next();
        }
        rows.close();
        db.close();
        
        return appData.tmpPin;
    },
    setTmpPin : function(value) {
        
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        db.execute("UPDATE OR REPLACE appinfo SET tmpPin = '"+this.encrypt(value)+"' WHERE id IS 1");
        
        db.close();
        
    },
    //set tmp pin to enabled/disabled
    setIsSetPin : function(value){
        
        Ti.API.log("set IsSetPin to " + value);
        
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        db.execute("UPDATE OR REPLACE appinfo SET tmpPinIsSet = '"+this.encrypt(value)+"' WHERE id = 1");
        
        db.close();
          
    },
    //get if tmpPin is enabeld/disabled
    getIsSetPin : function(){
        
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        //retrieve data
        var rows = db.execute('SELECT * FROM appinfo WHERE id IS ?', 1);
        
        var appData = {};
        
        while (rows.isValidRow()){
            var id = rows.fieldByName('id');
            Ti.API.log('db pin: '+rows.fieldByName('tmpPin'));
            appData = {
                tmpPin : this.decrypt(rows.fieldByName('tmpPin')),
                tmpPinIsSet : this.decrypt(rows.fieldByName('tmpPinIsSet')),
                version : rows.fieldByName('version')
            };
            rows.next();
        }
        rows.close();
        db.close();
        
        if (appData.tmpPinIsSet === 'defused') {
            return false;   
        } else{
            return true;
        }
    },
    saveQueryData : function(type, value) {
        
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        Ti.API.log('start inserting: '+type+' - '+value + ' - '+this.currentWorkItemQueryID);
        
        if (type === 'Name') {
            
            db.execute("UPDATE OR REPLACE queries SET name = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);
            
        } else if (type === 'Title') {
            
            db.execute("UPDATE OR REPLACE queries SET title = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);
            
        } else if(type === 'Status'){
            
            db.execute("UPDATE OR REPLACE queries SET status = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);
                        
        } else if(type === 'Type'){
            
            db.execute("UPDATE OR REPLACE queries SET type = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);
            
        } else if(type === 'Due Date'){
            
            db.execute("UPDATE OR REPLACE queries SET duedate = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);
            
        } else if(type === 'Timepoint'){
            
            db.execute("UPDATE OR REPLACE queries SET timepoint = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);
            
        } else if(type === 'Author'){
            
            db.execute("UPDATE OR REPLACE queries SET author = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);
            
        } else if(type === 'Assignables'){
            
            db.execute("UPDATE OR REPLACE queries SET assignables = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);
            
        } else if(type === 'Custom'){
            
            db.execute("UPDATE OR REPLACE queries SET custom = '"+this.encrypt(value)+"' WHERE id IS " + this.currentWorkItemQueryID);  
        }

        db.close();

    },
    //function to delete Query by ID
    deleteQuery : function(id){
        
        Ti.API.log('start deleting query with id: ' + id + 'currentworkitemid: '+this.currentWorkItemQueryID);
        
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        if(id === this.currentWorkItemQueryID){
            this.currentWorkItemQueryID = 1;            
        }
        
        var result = db.execute('DELETE FROM queries WHERE id IS ?', id);
        
        //get count of queries
        var rows = db.execute('SELECT COUNT(*) FROM queries');
        var count = rows.field(0);
        //initialize the first querie if it doesn't exist
        if (count === 0) {
            db.execute('INSERT INTO queries DEFAULT VALUES');
        }
        
        db.close();        
    },
    //function to get all saved queries
    getQueries : function() {
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        //create a return object
        var result = [];    
        
        //retrieve data
        var rows = db.execute('SELECT * FROM queries');
        
        while (rows.isValidRow()){
            var id = rows.fieldByName('id');
            Ti.API.log('id: '+id+' - name: '+rows.fieldByName('name'));
            query = {
                custom : this.decrypt(rows.fieldByName('custom')),
                id : rows.fieldByName('id'),
                name : this.decrypt(rows.fieldByName('name')),
                title : this.decrypt(rows.fieldByName('title')),
                status : this.decrypt(rows.fieldByName('status')),
                duedate : this.decrypt(rows.fieldByName('duedate')),
                timepoint : this.decrypt(rows.fieldByName('timepoint')),
                type : this.decrypt(rows.fieldByName('type')),
                author : this.decrypt(rows.fieldByName('author')),
                assignables : this.decrypt(rows.fieldByName('assignables'))
            };
            result.push(query);
            rows.next();
        }
        rows.close();
        db.close();
        return result;
    },
    //get query object by id
    getCurrentQuery : function(){
        Ti.API.log('---start getCurrentQuery---');    
        //open database
        var db = Ti.Database.open('PolarionApp');
    
        //retrieve data
        var queryData = db.execute('SELECT * FROM queries WHERE id IS ?', this.currentWorkItemQueryID);
        
        //create result object
        var result = {};
    
        if (queryData.isValidRow()) {
            result = {
                name : this.decrypt(queryData.fieldByName('name')),
                title : this.decrypt(queryData.fieldByName('title')),
                status : this.decrypt(queryData.fieldByName('status')),
                duedate : this.decrypt(queryData.fieldByName('duedate')),
                timepoint : this.decrypt(queryData.fieldByName('timepoint')),
                type : this.decrypt(queryData.fieldByName('type')),
                author : this.decrypt(queryData.fieldByName('author')),
                assignables : this.decrypt(queryData.fieldByName('assignables')),
                custom : this.decrypt(queryData.fieldByName('custom'))
            };
            Ti.API.log('query name: '+this.decrypt(queryData.fieldByName('name'))+' query title: '+this.decrypt(queryData.fieldByName('title')));
    
            db.close();
            return result;
        
        } else{
            db.close();
            return result;
        }
    },
    //Funktion make a request with the currentWorkitemID
    getWorkitems : function() {        
        this.loginThen(function() {
            
            //get current query out of the database
            var query = getQueryStringById(GV.currentWorkItemQueryID);
            
            var ok = function(workitems) {
                Ti.API.log('we got ' + workitems.length + ' workitems :)');
                Ti.App.fireEvent('createQueryDetailTable',{ workitems:workitems});
            };
            var error = function(argument) {
                Ti.API.log("error - couldn't get workitems :()");
            };
            Polarium.trackerService.queryWorkitems(query,"id", ["id", "title", "status", "created", "description"], ok, error);
        });
    },
    login : function(argument){
        this.loginThen(argument);       
    },
    logout : function(argument) {
        var ok = function(workitems) {
            Ti.API.debug("Logout done");
        };
        var error = function(argument) {
          alert("error - couldn't logout");
        };
        Polarium.sessionService.logout(ok,error);
    },
    getprojects : function(argument) {
        
        this.loginThen(function() {
            Ti.API.log('global getprojects');
            var ok = function(projects) {
                Ti.API.log('start');
                Ti.API.log(projects);
                Ti.API.log("length of projects: "+projects.length);
                
                Ti.App.fireEvent('popoverProjects',{ projects:projects});
            };
            var error = function(argument){
                Ti.API.log("error - couldn't get projects");
            };
            Polarium.projectService.getProjects(ok, error);
        });
    },
    getAssignables : function(){
        this.loginThen(function(){
            var ok = function(assignables) {
                Ti.API.log(assignables);
            };
            var error = function(argument) {
                Ti.API.log("error - couldn't get projects");
            };
            Polarium.trackerService.getAssignables(ok, error);
        });
    },
    getAllTimepoints : function(){
        this.loginThen(function() {
            var ok = function(timepoints) {
                
                var key; 
                var typeList = [];
                for (key in timepoints) {
                   var objItem = timepoints[key];
                   typeList.push(objItem.id);
                }
                
                
                Ti.App.fireEvent('setTimepointList', {name:'Timepoint',value:typeList});
            };
            var error = function(argument) {
              alert('error');
            };
            Polarium.trackerService.getTimepoints(GV.currentProjectId, ok, error);
        });
    },
    getAllEnumOptionsForId : function(argument) {
        this.loginThen(function() {
            var ok = function(enumoptions) {
                Ti.API.log("OK getAllEnumOptionsForId");
                // alert(enumoptions);
                Ti.App.fireEvent('setTypeList', {name:'Type',value:enumoptions});
            };
            var error = function(argument) {
              alert('error');
            };
            Polarium.trackerService.getAllEnumOptionsForId(GV.currentProjectId, "type", ok, error);
        });
    },
    loginThen : function(then) {
        credentials = this.getCredentials();
        
        //set host
        Polarium.connection.setHost(credentials.serverURL);
        
        Polarium.sessionService.login(
            credentials.username,
            credentials.pwd,
            function(arg) { then(arg); }, 
            function(err) { alert(err); });
    },
    encrypt : function(str){

    //encrypt string with passphrase
    var encrypted = CryptoJS.AES.encrypt(str, "Ich bin die Telekom - auf mich ist Verlass"+Ti.Platform.id);
    return encrypted;
    
    },
    decrypt : function(enc){
        var result = '';
        if(enc !== null){
           Ti.API.log("----start decrypting ----"+enc);
            //decrypt string with passphrase
            var decrypted = CryptoJS.AES.decrypt(enc, "Ich bin die Telekom - auf mich ist Verlass"+Ti.Platform.id);
            //set encoding
            result = decrypted.toString(CryptoJS.enc.Utf8);
            Ti.API.log("----done decrypting: "+result);
        }
        return result;
    },
    saveCredentials : function(login){
        //open database
        var db = Ti.Database.open('PolarionApp');
        
        var encUsername = this.encrypt(login.username);
        var encPwd = this.encrypt(login.pwd);
        var encServerUrl = this.encrypt(login.serverURL);
        Ti.API.log(encUsername + ' - ' + this.decrypt(encUsername));
     
        db.execute("INSERT OR REPLACE INTO credentials (id,username,pwd,serverURL) VALUES (1,'"+encUsername+"','"+encPwd+"','"+encServerUrl+"')");
        db.close();
    },
    // function to retrieve values form the database
    // returns an object containing username, pwd, serverURL and projectID
    getCredentials : function(){
    
        //open database
        var db = Ti.Database.open('PolarionApp');
    
        //retrieve data
        var credentials = db.execute('SELECT * FROM credentials');
    
        //create result object
        var result;
    
        if (credentials.isValidRow()) {
        
            result = {
                pwd : GV.decrypt(credentials.fieldByName('pwd')),
                username : GV.decrypt(credentials.fieldByName('username')),
                serverURL : GV.decrypt(credentials.fieldByName('serverURL'))
            };
        
        } else{
            result = null;
        }
    
        db.close();
    
        return result;
    }
};

// function to retrieve query data form the database
var getQueryStringById = function(id){
    
    //open database
    var db = Ti.Database.open('PolarionApp');

    //retrieve data
    var queryData = db.execute('SELECT * FROM queries WHERE id IS ?', id);

    //create result object
    var query;

    if (queryData.isValidRow()) {
    
        var result = {
            name : GV.decrypt(queryData.fieldByName('name')),
            title : GV.decrypt(queryData.fieldByName('title')),
            status : GV.decrypt(queryData.fieldByName('status')),
            duedate : GV.decrypt(queryData.fieldByName('duedate')),
            timepoint : GV.decrypt(queryData.fieldByName('timepoint')),
            type : GV.decrypt(queryData.fieldByName('type')),
            author : GV.decrypt(queryData.fieldByName('author')),
            assignables : GV.decrypt(queryData.fieldByName('assignables')),
            custom : GV.decrypt(queryData.fieldByName('custom'))
        };
        
        
        isFirstQueryItem = true;
        //queryItemCount is a helper variable to indicate the first queryitem. we need this for the and connection
        queryItemCount = 0;
        query = queryHelper('title',result.title) + queryHelper('type',result.type) + queryHelper('status',result.status) + queryHelper('custom',result.custom) + queryHelper('assignee.id',result.assignables) + queryHelper('author.id',result.author) + queryHelper('project.id',GV.currentProjectId) + queryHelper('timePoint.id',result.timepoint) + queryHelper('dueDate',result.duedate);
        isFirstQueryItem = false;
        Ti.API.log('query: '+query);
            
    } else{
        query = null;
    }
    db.close();
    return query;
};

function queryHelper(title, value){

    Ti.API.log("queryItemCount "+queryItemCount);
    var result = '';
    var and = '';
    
    if (queryItemCount === 0) {
        and = '';
    } else{
        and = ' AND '; 
    }
    
    //expert mode ;)
    if (title === 'custom') {
        if (value === '' || value === null || value === 'all') {
            //return nothing
            //result += 'NOT '+title+':######NULL';
        } else{
            result += and;
            result += value;
            queryItemCount++;
        }
    }else{
        //is the value empty or null then set value to search ALL
        if (value === '' || value === null || value === 'all') {
            //return nothing
            //result += 'NOT '+title+':######NULL';
        } else{
            result += and;
            result += title+':'+value;
            queryItemCount++;
        }    
    }
    
    return result;
}

exports.GVUpdate  = function( globalVarName, globalVarValue )
{
    this.GV[globalVarName]    =   globalVarValue;
};

exports.GV = GV;