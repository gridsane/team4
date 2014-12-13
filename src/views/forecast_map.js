var TabPaneView = require('./tab_pane');

var ForecastMapView = TabPaneView.extend({

    tabName: 'map',

    initialize: function (options) {
        this.initializeTabs(options.state);
        this.state = options.state;
        this.state.on('change:locality', this.render, this);
    },

    render: function() {
        var self = this;
        var locality = this.state.get('locality');

        if (!this.map) {
            ymaps.ready(function () {
                self.map = new ymaps.Map(self.el, {
                    center: [locality.lat, locality.lon],
                    zoom: 10
                });
            });
        } else {
            this.map.setCenter([locality.lat, locality.lon]);
        }
    }
});

module.exports = ForecastMapView;
