// This ought to be set with the widget builder.

var baseWidgetUrl = (baseWidgetUrl === undefined) ? "//localhost:8080/widget/hisco.htm" : baseWidgetUrl;

var settings = {
    "query":{
        "version":"1.1",
        "operation":"searchRetrieve",
        "maximumRecords":10,
        "recordSchema":"info:srw/schema/1/hisco",
        "recordPacking":"string"
    },
    "configInfo":{
        "containerlayoutratio":{search:2,result:3},
        "resultslayoutratio":{dt:1,dd:6},
        "interfieldoperator":"and",
        "relation":"all",
        "embedQuery":{"index":"iisg.identifier", "relation":"exact"},
        "allQuery":{"index":"iisg.collectionName", "relation":"exact","actualTerm":"hisco"},
        "baseUrl":"//api.socialhistoryservices.org/solr/hisco/srw",
        "widgetId":"iish_widget_hisco_v1_1",
        "formSearch":"search",
        "formResult":"result",
        "formNavigate":"navigate",
        "maxPagingLinks":8,
        "waitingMessage":[{"$":"Searching...","@lang":"en-US"},{"$":"Zoeken...","@lang":"nl-NL"}],
        "timeout":5000,
        "http.status":{
            "0":"You seem to have no connection to the internet.",
            "404":"URL of SRU server not found (HTTP 404). Please check your configuration or contact administrator.",
            "500":"Internal Server Error (HTTP 500). Please contact administrator",
            "parsererror":"Parsing the server's response failed.",
            "timeout":"Request Time out."
        },
"embedparameters":{"url":"widget/js/widget.js"},
        "noSearchAndRetrieveResponse":"There was no result... remove some or all of your selections and try again.",
        "title":[{"$":"Find an occupation","@lang":"en-US"},{"$":"Vind een beroep","@lang":"nl-NL"}],
        "user_selections":[{"$":"Your selections","@lang":"en-US"},{"$":"Resultaat","@lang":"nl-NL"}],
        "clear_all":[{"$":"Clear all","@lang":"en-US"},{"$":"Verwijderen","@lang":"nl-NL"}],
        "separator":";",
        "searchbutton":"Search",
        //"searchEmptyOption":"-- No preference --",
        "shortlist":"shortlist",
        /*"languages":[{"$":"English","@lang":"en-US"},{"$":"Dutch","@lang":"nl-NL"}],*/
        "lang_default":"en-US",
        "fadeIn":2000,
        "timeoutInputText":1000,
        "showAllRecordsInFirstView":true,
	"cssStylesheets":["widget/css/ui-lightness/jquery-ui-1.8rc1.custom.css","widget/css/ui-lightness/widget.css", "widget/css/skins/tango/skin.css"],
        "cssClasses":{
            "search":"search ui-widget ui-widget-content ui-corner-all",
            "images":"search ui-widget ui-widget-content ui-corner-all",
            "navigate":"navigate ui-widget ui-widget-content ui-corner-all",
            "pager":"pager ui-widget ui-widget-content ui-corner-all",
            "resultset":"resultset ui-widget ui-widget-content ui-corner-all",
            "embededresultset":"embededresultset ui-widget ui-widget-content ui-corner-all",
            "shortlist":"shortlist",
            "fulllist":"fulllist",
            "embed":"ui-state-default ui-corner-all"}
    },
    "index":[
    {"type":"text","title":[
        {"@lang":"nl-NL","$":"Zoek naar"},
        {"@lang":"en-US","$":"Search all"}
    ],"map":{"name":{"@set":"cql","$":"serverChoice"}}},
            {"type":"select","title":[
        {"@lang":"nl-NL","$":"Land"},
        {"@lang":"en-US","$":"Country"}
    ],"map":{"name":{"@set":"hisco","$":"country_code_label"}}},
            {"type":"select","title":[
        {"@lang":"nl-NL","$":"Taal"},
        {"@lang":"en-US","$":"Language"}
    ],"map":{"name":{"@set":"hisco","$":"language_code_label"}}},
        {"type":"select","title":[
        {"@lang":"nl-NL","$":"Status"},
        {"@lang":"en-US","$":"Status"}
    ],"map":{"name":{"@set":"hisco","$":"status_label"}}},
            {"type":"select","title":[
        {"@lang":"nl-NL","$":"Relatie"},
        {"@lang":"en-US","$":"Relation"}
    ],"map":{"name":{"@set":"hisco","$":"relation_label"}}},
            {"type":"select","title":[
        {"@lang":"nl-NL","$":"Product"},
        {"@lang":"en-US","$":"Products"}
    ],"map":{"name":{"@set":"hisco","$":"product_label"}}},
            {"type":"select","title":[
        {"@lang":"nl-NL","$":"Bron"},
        {"@lang":"en-US","$":"Provenance"}
    ],"map":{"name":{"@set":"hisco","$":"provenance_label"}}},
            {"type":"select","title":[
        {"@lang":"nl-NL","$":"Met afbeeldingen"},
        {"@lang":"en-US","$":"With images"}
    ],"map":{"name":{"@set":"hisco","$":"images"}}},
        {"type":"text","title":[
                {"@lang":"nl-NL","$":"Hisco code"},
                {"@lang":"en-US","$":"Hisco code"}
            ],"map":{"name":{"@set":"hisco","$":"group_ids"}}}
]}
