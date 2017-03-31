EasyDBImage.justCreated = function () {
    this.execute();
}

EasyDBImage.execute = function () {

    var that = this;

    var pageOneContent = $('' +
        '<div id="easydb-dialog">' +
        '<input id="search-title" class="maxWidth" placeholder="Titel">' +
        '<input id="search-artist" class="maxWidth" placeholder="Künstler">' +
        '<input id="search-location" class="maxWidth" placeholder="Standort">' +
        '<input id="search-presented-location" class="maxWidth" placeholder="Dargestellter Ort">' +
        '<input id="search-reference" class="maxWidth" placeholder="Abbildungsnachweis">' +
        '</div>'
    );

    var setAndConfigureImage = function(){
        
        var newUrl   = arguments[0]['url']
        var easyDbId = arguments[0]['easyDbID']

        that.setAttribute('remote_url', newUrl);
        that.setAttribute('easydb_id', easyDbId);

        var newImg = new Image();
        newImg.src = newUrl;
        $(newImg).one("load", function(){
            var orgHeight = newImg.height;
            var orgWidth = newImg.width;
            var maxBounds = 480;

            var ratio = orgWidth / orgHeight;
            var newheight, newwidth;

            if(ratio < 1){
                newheight = maxBounds;
                newwidth = maxBounds * ratio;
            } else {
                newheight = maxBounds / ratio;
                newwidth = maxBounds;
            }

            that.setAttribute("width", newwidth);
            that.setAttribute("height", newheight);
        });

    }

    var createPageTwo = function () {
        var searchParams = {
            title:$(pageOneContent).find("#search-title").val(),
            artist:$(pageOneContent).find("#search-artist").val(),
            location:$(pageOneContent).find("#search-location").val(),
            presentedLocation:$(pageOneContent).find("#search-presented-location").val(),
            reference:$(pageOneContent).find("#search-reference").val(),

        };


        var pageTwoButtons = {
            "Zurück" : function(){

                createPageOne();

            },
            "Abbrechen":function () {
                return false;
            },

            "OK":function () {
                var pictureUrl = $('.selected-row').attr('easydbdownloadurl');
                var easyDbId = $('.selected-row').attr('easydbimageid');
                var easydbkuenstler = $('.selected-row').attr('easydbkuenstler');
                var easydbstandort = $('.selected-row').attr('easydbstandort');
                var easydbdargestellter_ort = $('.selected-row').attr('easydbdargestellter_ort');
                var easydbtitel = $('.selected-row').attr('easydbtitel');
                var easydbdatierung = $('.selected-row').attr('easydbdatierung');

                if(easydbkuenstler) that.setAttribute('easydbkuenstler', easydbkuenstler);
                if(easydbstandort) that.setAttribute('easydbstandort', easydbstandort);
                if(easydbdargestellter_ort) that.setAttribute('easydbdargestellter_ort', easydbdargestellter_ort);
                if(easydbtitel) that.setAttribute('easydbtitel', easydbtitel);
                if(easydbdatierung) that.setAttribute('easydbdatierung', easydbdatierung);

                setAndConfigureImage({
                    url: pictureUrl,
                    easyDbID : easyDbId
                });
            }

        };

        var dialog_pass_through = {
            create:function () {
                var finishedSearchCallback = function (searchResults) {
                    that.searchParams = searchParams;
                    if(Object.keys(searchResults).length === 0){
                        $('.easy-load-wrapper').html("<h2>Es wurden keine Ergbnisse gefunden</h2>");
                    } else {
                        that.renderResultPage(searchResults, ".ui-dialog-content");
                    }
                }

                that.serverCall("search", searchParams, 0, 10 , finishedSearchCallback);
            },
            height:600
        }

        return GUI.dialog(
            that.translate("EASYDB_IMAGE_SELECTION"),
            that.renderLoadScreen('.ui-dialog-content'),
            pageTwoButtons,
            500,
            dialog_pass_through
        )
    };

    var createPageOne = function(){
        var pageOneButtons = {
            "Abbrechen":function () {
                return false;
            },
            "OK":function () {
                createPageTwo().on("dblclick", ".result-row", function () {
                    $(':button:contains("OK")').click();
                });
            }

        }

        var dialog = GUI.dialog(
            "easydb-Suche",
            pageOneContent, pageOneButtons, 500, {height:500}
        )

        dialog.keyup(function (e) {
            if (e.keyCode == 13) {
                $(':button:contains("OK")').click();
            }
        });
    }

    createPageOne();

    


    
}