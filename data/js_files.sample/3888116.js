IWitness.FilterPopoverView = Ember.View.extend({
  templateName: 'filter_popover_template',
  isVisibleBinding: 'parentView.showingFilters',

  didInsertElement: function() {
    var self = this;
    $(document).click(function(e) {
      var clicked = $(e.target);
      if (!clicked.closest('#show-filters-button, #filter-popover .content').length) {
        self.hide();
      }
    });
  },

  hide: function() {
    this.setPath('isVisible', false);
  },

  toggleServiceFilters: function() {
    this.$(".service_toggle_button").toggleClass('open');
    this.$("#available_services").toggle();
  }
});
