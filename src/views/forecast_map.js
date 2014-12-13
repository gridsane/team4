var TabPaneView = require('./tab_pane');

var ForecastMapView = TabPaneView.extend({

    tabName: 'map',

    initialize: function (options) {
        this.initializeTabs(options.state);
        this.model.on('change', this.render, this);
    },

    render: function() {
        this.$el.html("map!");
    }
});

module.exports = ForecastMapView;
