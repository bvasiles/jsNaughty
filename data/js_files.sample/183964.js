dojo.provide("dojo.uuid.Uuid");
dojo.require("dojo.lang.common");
dojo.require("dojo.lang.assert");
dojo.uuid.Uuid=function(_1){
this._uuidString=dojo.uuid.Uuid.NIL_UUID;
if(_1){
if(dojo.lang.isString(_1)){
this._uuidString=_1.toLowerCase();
dojo.lang.assert(this.isValid());
}else{
if(dojo.lang.isObject(_1)&&_1.generate){
var _2=_1;
this._uuidString=_2.generate();
dojo.lang.assert(this.isValid());
}else{
dojo.lang.assert(false,"The dojo.uuid.Uuid() constructor must be initializated with a UUID string.");
}
}
}else{
var _3=dojo.uuid.Uuid.getGenerator();
if(_3){
this._uuidString=_3.generate();
dojo.lang.assert(this.isValid());
}
}
};
dojo.uuid.Uuid.NIL_UUID="00000000-0000-0000-0000-000000000000";
dojo.uuid.Uuid.Version={UNKNOWN:0,TIME_BASED:1,DCE_SECURITY:2,NAME_BASED_MD5:3,RANDOM:4,NAME_BASED_SHA1:5};
dojo.uuid.Uuid.Variant={NCS:"0",DCE:"10",MICROSOFT:"110",UNKNOWN:"111"};
dojo.uuid.Uuid.HEX_RADIX=16;
dojo.uuid.Uuid.compare=function(_4,_5){
var _6=_4.toString();
var _7=_5.toString();
if(_6>_7){
return 1;
}
if(_6<_7){
return -1;
}
return 0;
};
dojo.uuid.Uuid.setGenerator=function(_8){
dojo.lang.assert(!_8||(dojo.lang.isObject(_8)&&_8.generate));
dojo.uuid.Uuid._ourGenerator=_8;
};
dojo.uuid.Uuid.getGenerator=function(){
return dojo.uuid.Uuid._ourGenerator;
};
dojo.uuid.Uuid.prototype.toString=function(_9){
if(_9){
switch(_9){
case "{}":
return "{"+this._uuidString+"}";
break;
case "()":
return "("+this._uuidString+")";
break;
case "\"\"":
return "\""+this._uuidString+"\"";
break;
case "''":
return "'"+this._uuidString+"'";
break;
case "urn":
return "urn:uuid:"+this._uuidString;
break;
case "!-":
return this._uuidString.split("-").join("");
break;
default:
dojo.lang.assert(false,"The toString() method of dojo.uuid.Uuid was passed a bogus format.");
}
}else{
return this._uuidString;
}
};
dojo.uuid.Uuid.prototype.compare=function(_a){
return dojo.uuid.Uuid.compare(this,_a);
};
dojo.uuid.Uuid.prototype.isEqual=function(_b){
return (this.compare(_b)==0);
};
dojo.uuid.Uuid.prototype.isValid=function(){
try{
dojo.lang.assertType(this._uuidString,String);
dojo.lang.assert(this._uuidString.length==36);
dojo.lang.assert(this._uuidString==this._uuidString.toLowerCase());
var _c=this._uuidString.split("-");
dojo.lang.assert(_c.length==5);
dojo.lang.assert(_c[0].length==8);
dojo.lang.assert(_c[1].length==4);
dojo.lang.assert(_c[2].length==4);
dojo.lang.assert(_c[3].length==4);
dojo.lang.assert(_c[4].length==12);
for(var i in _c){
var _e=_c[i];
var _f=parseInt(_e,dojo.uuid.Uuid.HEX_RADIX);
dojo.lang.assert(isFinite(_f));
}
return true;
}
catch(e){
return false;
}
};
dojo.uuid.Uuid.prototype.getVariant=function(){
var _10=this._uuidString.charAt(19);
var _11=parseInt(_10,dojo.uuid.Uuid.HEX_RADIX);
dojo.lang.assert((_11>=0)&&(_11<=16));
if(!dojo.uuid.Uuid._ourVariantLookupTable){
var _12=dojo.uuid.Uuid.Variant;
var _13=[];
_13[0]=_12.NCS;
_13[1]=_12.NCS;
_13[2]=_12.NCS;
_13[3]=_12.NCS;
_13[4]=_12.NCS;
_13[5]=_12.NCS;
_13[6]=_12.NCS;
_13[7]=_12.NCS;
_13[8]=_12.DCE;
_13[9]=_12.DCE;
_13[10]=_12.DCE;
_13[11]=_12.DCE;
_13[12]=_12.MICROSOFT;
_13[13]=_12.MICROSOFT;
_13[14]=_12.UNKNOWN;
_13[15]=_12.UNKNOWN;
dojo.uuid.Uuid._ourVariantLookupTable=_13;
}
return dojo.uuid.Uuid._ourVariantLookupTable[_11];
};
dojo.uuid.Uuid.prototype.getVersion=function(){
if(!this._versionNumber){
var _14="Called getVersion() on a dojo.uuid.Uuid that was not a DCE Variant UUID.";
dojo.lang.assert(this.getVariant()==dojo.uuid.Uuid.Variant.DCE,_14);
var _15=this._uuidString.charAt(14);
this._versionNumber=parseInt(_15,dojo.uuid.Uuid.HEX_RADIX);
}
return this._versionNumber;
};
dojo.uuid.Uuid.prototype.getNode=function(){
if(!this._nodeString){
var _16="Called getNode() on a dojo.uuid.Uuid that was not a TIME_BASED UUID.";
dojo.lang.assert(this.getVersion()==dojo.uuid.Uuid.Version.TIME_BASED,_16);
var _17=this._uuidString.split("-");
this._nodeString=_17[4];
}
return this._nodeString;
};
dojo.uuid.Uuid.prototype.getTimestamp=function(_18){
var _19="Called getTimestamp() on a dojo.uuid.Uuid that was not a TIME_BASED UUID.";
dojo.lang.assert(this.getVersion()==dojo.uuid.Uuid.Version.TIME_BASED,_19);
if(!_18){
_18=null;
}
switch(_18){
case "string":
case String:
return this.getTimestamp(Date).toUTCString();
break;
case "hex":
if(!this._timestampAsHexString){
var _1a=this._uuidString.split("-");
var _1b=_1a[0];
var _1c=_1a[1];
var _1d=_1a[2];
_1d=_1d.slice(1);
this._timestampAsHexString=_1d+_1c+_1b;
dojo.lang.assert(this._timestampAsHexString.length==15);
}
return this._timestampAsHexString;
break;
case null:
case "date":
case Date:
if(!this._timestampAsDate){
var _1e=3394248;
var _1f=this._uuidString.split("-");
var _20=parseInt(_1f[0],dojo.uuid.Uuid.HEX_RADIX);
var _21=parseInt(_1f[1],dojo.uuid.Uuid.HEX_RADIX);
var _22=parseInt(_1f[2],dojo.uuid.Uuid.HEX_RADIX);
var _23=_22&4095;
_23<<=16;
_23+=_21;
_23*=4294967296;
_23+=_20;
var _24=_23/10000;
var _25=60*60;
var _26=_1e;
var _27=_26*_25;
var _28=_27*1000;
var _29=_24-_28;
this._timestampAsDate=new Date(_29);
}
return this._timestampAsDate;
break;
default:
dojo.lang.assert(false,"The getTimestamp() method dojo.uuid.Uuid was passed a bogus returnType: "+_18);
break;
}
};
