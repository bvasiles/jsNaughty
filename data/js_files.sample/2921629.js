// Our basic **Story** model has `id`, `title`, `description` attributes.
var Story = Backbone.Model.extend({
    urlRoot: "api/stories",

    // Default attributes for the story.
    defaults: {
        title: "There are no story"
    }
})

var StoryList = Backbone.Collection.extend({

    model: Story,

    url: "api/stories"

});