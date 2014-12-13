var TabPaneView = require('./tab_pane');
var balloonTemplate = require('../templates/forecast_map_balloon.hbs');
var iconTemplate = require('../templates/forecast_map_icon.hbs');

var ForecastMapView = TabPaneView.extend({

    tabName: 'map',

    initialize: function (options) {
        this.initializeTabs(options.state);
        this.state = options.state;
        this.state.on('change:locality', this.render, this);
    },

    createPlacemark: function (locality, fact) {
        return new ymaps.Placemark([locality.lat, locality.lon], {
            balloonContent: balloonTemplate({
                locality: locality,
                fact: fact.toJSON()
            }),
            iconContent: iconTemplate(fact.toJSON()),
        }, {
            iconLayout: 'default#imageWithContent',
            iconImageHref: '/assets/images/map_placemark.png',
            iconImageSize: [68, 42],
            iconImageOffset: [-20, -42],
        })
    },

    render: function() {
        var self = this;
        var locality = this.state.get('locality');

        if (!this.map) {
            ymaps.ready(function () {
                self.map = new ymaps.Map(self.el, {
                    center: [locality.lat, locality.lon],
                    zoom: locality.zoom
                });

                self.map.geoObjects.add(self.createPlacemark(locality, self.model));
            });
        } else {
            this.map.geoObjects.removeAll();
            this.map.geoObjects.add(self.createPlacemark(locality, self.model));
            this.map.setCenter([locality.lat, locality.lon]);
            this.map.setZoom(locality.zoom);
        }
    }
});

module.exports = ForecastMapView;
