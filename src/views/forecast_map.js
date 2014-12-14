var _ = require('underscore');
var TabPaneView = require('./tab_pane');
var fetchHelper = require('../utils/fetch_helper');
var balloonTemplate = require('../templates/forecast_map_balloon.hbs');
var iconTemplate = require('../templates/forecast_map_icon.hbs');

var ForecastMapView = TabPaneView.extend({

    tabName: 'map',
    placemarks: [],
    map: null,
    clasterer: null,
    loading: false,

    initialize: function (options) {
        this.initializeTabs(options.state);
        this.state = options.state;
        this.state.on('change:locality', this.render, this);
    },

    createPlacemark: function (locality, model) {
        var placemark = new ymaps.Placemark([locality.lat, locality.lon], {
            balloonContent: model ? balloonTemplate({
                locality: locality,
                today: model.toJSON()
            }) : '<img src="/assets/images/ajax-loader.gif"/>',
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

        if (!model) {
            placemark.events.once('balloonopen', function () {
                fetchHelper(locality.geoid).then(function (data) {
                    placemark.balloon.getData().properties.set('balloonContent', balloonTemplate({
                        locality: locality,
                        today: data.today
                    }));
                });
            });
        }

        return placemark;
    },

    boundsChange: function (event) {

        if (this.loading) {
            return;
        }

        var self = this;
        var bounds = this.map.getBounds();
        var currentGeoid = self.state.get('locality').geoid;

        this.loading = true;

        $.get('http://ekb.shri14.ru/api/map-data', {
            lt: [bounds[0][1], bounds[1][0]].join(','),
            rb: [bounds[1][1], bounds[0][0]].join(','),
            zoom: this.map.getZoom()
        }).done(function (localities) {

            var prevGeoids = _.keys(self.placemarks);
            var nextGeoids = [];

            _.each(localities, function (locality) {
                var geoid = locality.geoid;
                nextGeoids.push(geoid.toString());
                if (!this.placemarks[geoid]) {
                    var model = (geoid === this.state.get('locality').geoid)
                        ? this.model
                        : null;
                    var placemark = this.createPlacemark(locality, model);
                    this.placemarks[geoid] = placemark;
                    this.clasterer.add(placemark)
                }
            }, self);

            var toDelete = _.difference(prevGeoids, nextGeoids);
            _.each(toDelete, function (geoid) {
                this.clasterer.remove(this.placemarks[geoid]);
                delete this.placemarks[geoid];
            }, self);

            self.loading = false;
        });
    },

    render: function() {
        var self = this;
        var locality = this.state.toJSON().locality;

        if (!this.map) {
            ymaps.ready(function () {
                self.map = new ymaps.Map(self.el, {
                    controls: ['zoomControl'],
                    center: [locality.lat, locality.lon],
                    zoom: locality.zoom
                });

                self.map.events.add('boundschange', function (event) {
                    self.boundsChange(event);
                });

                self.clasterer = new ymaps.Clusterer();
                self.map.geoObjects.add(self.clasterer);

                self.boundsChange();
            });

        } else {
            this.map.setCenter([locality.lat, locality.lon]);
            this.map.setZoom(locality.zoom);
        }

    }
});

module.exports = ForecastMapView;
