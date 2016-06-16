Aria.tplScriptDefinition({
    $classpath : "samples.widgets.autocomplete.wai.WaiAutoCompleteScript",
    $dependencies : ["samples.common.autocomplete.AutoCompleteResourceHandler"],
    $constructor : function () {
        this.nationsHandler = samples.common.autocomplete.AutoCompleteResourceHandler.getNationsHandler(1);
        this.citiesHandler = samples.common.autocomplete.AutoCompleteResourceHandler.getCitiesHandler(1);
    },
    $destructor : function () {
        this.nationsHandler.$dispose();
        this.citiesHandler.$dispose();
    },
    $prototype : {
        waiSuggestionsStatusGetter : function (number) {
            if (number === 0) {
                return "There is no suggestion.";
            } else {
                return (number == 1 ? "There is one suggestion" : "There are " + number + " suggestions") + ", use up and down arrow keys to navigate and enter to validate.";
            }
        },

        waiSuggestionAriaLabelGetter : function (object) {
            return object.value.label + " " + (object.index + 1) + " of " + object.total;
        }
    }
});
