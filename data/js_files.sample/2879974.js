function KmLabelInfo(db) {
    this.mDb = db;
    this.mLabelList = null;
}
KmLabelInfo.prototype.load = function(loadCallback) {
    this.mDb.selectQuery("select id, name from km_label_info");
    this.mLabelList = this.mDb.getRecords();
    loadCallback(this.mLabelList);
};

KmLabelInfo.prototype.insert = function(params, insertCallback) {
    var sql = "insert into km_label_info ("
      + "name "
      + ") values ( "
      + ":name)";

    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    insertCallback(this.mDb.getLastInsertRowId());
};
KmLabelInfo.prototype.update = function(id, params, updateCallback) {
    var sql = "update km_bank_info "
      + "set "
      + "name = :name, "
      + "where id = :id";

    params["id"] = id;
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    updateCallback();
};
KmLabelInfo.prototype.delete = function(id, deleteCallback) {
    var sql = "delete from km_bank_info where id = :id";
    var params = {
        "id": id
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    deleteCallback();
};

