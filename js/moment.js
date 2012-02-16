var Moment = {
  $el: 'test',
  id: 0,
  popover: '', // only being accessed directly through $(el).popover()
  inputId: '', // can't get the element directly since bootstrap creates and destroys on the fly
  monthId: '', // yyyymm format
  month: '',
  momentText: '',
  bbox: [],
  isPopupVisible: false,
  isHoverVisible: false,

  createHandle: function() {
    // build the html for the circle icon
    var html = '<div><a href="#">' + (this.id + 1) + '</a></div>';

    this.$el = $(html).insertBefore($('#new-moment').parent());
    this.inputId = 'moment-text-' + this.id;

    // tooltip and popover will load values from the data attributes
    this.$el.data({
      'title': this.month,
      content: '<input id="' + this.inputId + '"  type="text" value="" placeholder="What happened here?">'
    });

    // attach the bootstrap plugins to the handle
    this.$el.popover({
      placement:'left',
      trigger: "manual"
    });

    this.$el.tooltip({
      placement:'left',
      title: this.momentText || this.month,
      trigger: 'manual'
    });
  },
  attachEvents: function() {
    var self = this;

    // interactions for the circle handle
    this.$el.click(function(e) {
      if (!self.isPopupVisible) {
        self.show();
      } else {
        self.hide();
      }
    })
    .hover(
      // on hover handler
      function(e) {
      if (!self.isPopupVisible) {
        self.$el.tooltip('show');
      }
    },
      // off hover handler
      function(e) {
        self.$el.tooltip('hide');
      }
    );

    // save values as they're typed
    // attach to document to dodge boostrap
    // .on(event, selector, callback)
    $(document).on('keypress', '#' + this.inputId, function(e) {
        self.momentText = $(this).val();
      // close on enter key
      if (e.which == 13) {
        self.hide();
      }
    });
  },
  // displays the popover and loads previous values
  show: function() {
    this.isPopupVisible = true;
    this.$el.addClass('open');
    this.$el.tooltip('hide');
    this.$el.popover('show');
    if (this.momentText !== '') {
      $('#' + this.inputId).val(this.momentText);
    }
    $('#' + this.inputId).focus();

    // trigger the custom show event
    this.$el.trigger('show', this);

  },
  hide: function() {
    this.isPopupVisible = false;
    this.$el.removeClass('open');
    this.$el.popover('hide');
  },
  setGeo: function(bbox) {
    this.bbox = bbox;
  },

  init: function(index, monthId, month) {
    this.id = index;
    this.monthId = monthId;
    this.month = month;

    this.createHandle();
    this.attachEvents();
  }
};
