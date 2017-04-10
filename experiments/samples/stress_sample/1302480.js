$(document).ready(function () {

    var successUrl = $('#SuccessUrl').attr('value');

    var failureUrl = $('#FailureUrl').attr('value');

    var window = $("#MessageBox").data("tWindow");

    window.center();

    $('form').submit(function (e) {

        e.preventDefault();

        window.center();

        window.open();

        $.post($(this).attr("action"), $(this).serialize(), function (json) {
            // handle response
            if (json) {

                window.ajaxRequest(successUrl);

            }
            else {

                window.ajaxRequest(failureUrl);

            }

            window.center();

        }, "json");
    });

    $(".confirm").click(function (evt) {
        // Capture link
        var href = $(evt.target).attr("href");

        evt.preventDefault();

        $(this).fastConfirm({
            position: 'left',
            questionText: "Are you sure you want to delete this fish?",
            onProceed: function (trigger) {
                window.location = href;
            }
        });
    });
});