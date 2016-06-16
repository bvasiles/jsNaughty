exports.format_number_choice = function (text_string, replace_hash, number) {
    var scf = new sfChoiceFormat();
    
    var str = scf.format(text_string, number);
    
    for(var i in replace_hash) str = str.replace(new RegExp(i), replace_hash[i]);
    
    return str;
};
