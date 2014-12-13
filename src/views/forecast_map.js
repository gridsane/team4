var TabPaneView = require('./tab_pane');
var balloonTemplate = require('../templates/forecast_map_balloon.hbs');
var iconTemplate = require('../templates/forecast_map_icon.hbs');

var ForecastMapView = TabPaneView.extend({

    tabName: 'map',
    placemarks: [],

    initialize: function (options) {
        this.initializeTabs(options.state);
        this.state = options.state;
        this.state.on('change:locality', this.render, this);
    },

    createPlacemark: function (locality, fact) {
        var p = new ymaps.Placemark([locality.lat, locality.lon], {
            balloonContent: fact ? balloonTemplate({
                locality: locality,
                fact: fact.toJSON()
            }) : "loading...",
            iconContent: iconTemplate({
                temp: locality.temp,
                weather_icon: locality.weather_icon
            }),
        }, {
            iconLayout: 'default#imageWithContent',
            iconImageHref: '/assets/images/map_placemark.png',
            iconImageSize: [68, 42],
            iconImageOffset: [-20, -42],
        });

        return p;
    },

    boundsChange: function (event) {
        var self = this;
        var bounds = this.map.getBounds();

        $.get('http://ekb.shri14.ru/api/map-data', {
            lt: [bounds[0][1], bounds[1][0]].join(','),
            rb: [bounds[1][1], bounds[0][0]].join(','),
            zoom: this.map.getZoom()
        }).done(function (localities) {
            var prevGeoids = [];
            var nextPlacemarks = [];
            var nextGeoids = [];

            for (var i = localities.length - 1; i >= 0; i--) {
                var placemark = self.createPlacemark(localities[i]);
                nextGeoids.push(localities[i].geoid);
                nextPlacemarks.push({
                    geoid: localities[i].geoid,
                    placemark: placemark
                });
            };

            for (var i = self.placemarks.length - 1; i >= 0; i--) {
                if (-1 === nextGeoids.indexOf(self.placemarks[i].geoid)) {
                    self.map.geoObjects.remove(self.placemarks[i].placemark);
                } else {
                    prevGeoids.push(self.placemarks[i].geoid);
                }
            };

            for (var i = nextPlacemarks.length - 1; i >= 0; i--) {
                if (-1 === prevGeoids.indexOf(nextPlacemarks[i].geoid)) {
                    self.map.geoObjects.add(nextPlacemarks[i].placemark);
                }
            };

            self.placemarks = nextPlacemarks;
        });
    },

    render: function() {
        var self = this;
        var locality = this.state.toJSON().locality;

        if (!this.map) {
            ymaps.ready(function () {
                self.map = new ymaps.Map(self.el, {
                    center: [locality.lat, locality.lon],
                    zoom: locality.zoom
                });

                self.map.events.add('boundschange', function (event) {
                    self.boundsChange(event);
                });

                locality.temp = self.model.get('temp');
                locality.weather_icon = self.model.get('weather_icon');

                var placemark = self.createPlacemark(locality, self.model);
                self.placemarks.push({
                    geoid: locality.geoid,
                    placemark: placemark
                });

                self.map.geoObjects.add(placemark);

                self.boundsChange();
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
