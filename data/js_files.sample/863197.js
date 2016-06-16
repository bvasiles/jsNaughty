$(document).ready(function(){
    
    function open_resume_book_deletion_dialog() {
        var $dialog = $('<div class="dialog"></div>')
        .dialog({
            autoOpen: false,
            title:"Delete Resume Book",
            dialogClass: "resume_book_deletion_dialog",
            modal:true,
            width:410,
            resizable: false,
            close: function() {
                resume_book_deletion_dialog.remove();
            }
        });
        $dialog.dialog('open');
        return $dialog;
    };

    $('.delete_resume_book_link').click( function () {
        resume_book_deletion_dialog = open_resume_book_deletion_dialog();
        resume_book_deletion_dialog.html(DIALOG_AJAX_LOADER);

        var that = $(this);
        var resume_book_id = $(this).attr("data-resume-book-id");

        var resume_book_deletion_dialog_timeout = setTimeout(show_long_load_message_in_dialog, LOAD_WAIT_TIME);
        $.ajax({
            dataType: "html",
            url: EMPLOYER_RESUME_BOOK_DELETE_URL,
            complete: function(jqXHR, textStatus) {
                clearTimeout(resume_book_deletion_dialog_timeout);
                resume_book_deletion_dialog.dialog('option', 'position', 'center');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if(jqXHR.status==0){
                    resume_book_deletion_dialog.html(CHECK_CONNECTION_MESSAGE_DIALOG);
                }else{
                    resume_book_deletion_dialog.html(ERROR_MESSAGE_DIALOG);
                }
            },
            success: function (data) {
                resume_book_deletion_dialog.html(data);
                $("#delete_resume_book_confirmation_link").click(function(){
                    $.ajax({
                        type:"POST",
                        dataType: "json",
                        data: {'resume_book_id':resume_book_id},
                        url: EMPLOYER_RESUME_BOOK_DELETE_URL,
                        success: function (data){
                            resume_book_deletion_dialog.remove();
                            var li = that.parents("li");
                            var ul = li.parent();
                            li.slideUp(function(){
                                li.remove();
                                if ($('#resume_book_list li:visible').length==0){
                                    $("#no_resume_books").slideDown();
                                }
                                
                            });
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            if(jqXHR.status==0){
                                resume_book_deletion_dialog.html(CHECK_CONNECTION_MESSAGE_DIALOG);
                            }else{
                                resume_book_deletion_dialog.html(ERROR_MESSAGE_DIALOG);
                            }
                        }
                    });
                });
            }
        });
    });
});