var util = require('util');


var getEnvelope = function(header, body) {

    var msg = new Array();
    msg.push('<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:itk="urn:nhs-itk:ns:201005">');
    msg.push('<soap:Header>');
    for(var i = 0; i < header.length; i++) {
        msg.push(util.format("<%s xmlns='%s'>%s</%s>", header[i].name, header[i].namespace, header[i].data, header[i].name));
    }
    msg.push('</soap:Header>');
    msg.push('<soap:Body>');
    msg.push(body);
    msg.push('</soap:Body>');
    msg.push('</soap:Envelope>');

    return msg.join('');
}

var itkError = function(err) {
    var msg = new Array();
    msg.push('<soap:Fault>');
    msg.push('<faultcode>soap:Client</faultcode>');
    msg.push('<faultstring>A client related error has occurred, see detail element for further information</faultstring>');
    msg.push('<faultactor>' + err.faultactor + '</faultactor>');
    msg.push('<detail>');
    msg.push('<itk:ToolkitErrorInfo>');
    msg.push('<itk:ErrorID>' + err.id + '</itk:ErrorID>');
    msg.push('<itk:ErrorCode>' + err.code + '</itk:ErrorCode>');
    msg.push('<itk:ErrorText>' + err.text + '</itk:ErrorText>');
    msg.push('<itk:ErrorDiagnosticText>' + err.diagnostictext + '</itk:ErrorDiagnosticText>');
    msg.push('</itk:ToolkitErrorInfo>');
    msg.push('</detail>');
    msg.push('</soap:Fault>');
    return msg.join('');
}

exports.simpleResponse = function(result){
   return  '<itk:SimpleMessageResponse>' + result + '</itk:SimpleMessageResponse>'; 
}

exports.error = function(error) {
    return getEnvelope(itkError(error));
}

exports.response = function(header, msg){
   return getEnvelope(header, msg);
}