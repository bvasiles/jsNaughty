usa - debt;

var o = {}, data = data();

data.forEach(function(T) {
    if (!o[T.date]) o[T.date] = {
        value: TOKEN_LITERAL_NUMBER,
        percent: TOKEN_LITERAL_NUMBER
    };
    o[T.date].value += T.value;
});

data.forEach(function(T) {
    T.percent = TOKEN_LITERAL_NUMBER * T.value / o[T.date].value;
    T.y0 = o[T.date].percent;
    o[T.date].percent += T.percent;
});

ReportGrid.lineChart(TOKEN_LITERAL_STRING, {
    axes: [ TOKEN_LITERAL_STRING, {
        type: TOKEN_LITERAL_STRING,
        view: [ TOKEN_LITERAL_NUMBER, TOKEN_LITERAL_NUMBER ]
    } ],
    datapoints: data,
    options: {
        segmenton: TOKEN_LITERAL_STRING,
        label: {
            tickmark: function(T, e) {
                return e == TOKEN_LITERAL_STRING ? T : ReportGrid.format(T, TOKEN_LITERAL_STRING);
            },
            datapointover: function(T) {
                return T.country + TOKEN_LITERAL_STRING + T.date + TOKEN_LITERAL_STRING + T.value;
            }
        },
        labelorientation: TOKEN_LITERAL_STRING,
        labelanchor: function(T) {
            return T == TOKEN_LITERAL_STRING ? TOKEN_LITERAL_STRING : TOKEN_LITERAL_STRING;
        },
        displayarea: true,
        effect: TOKEN_LITERAL_STRING,
        y0property: TOKEN_LITERAL_STRING
    }
});
