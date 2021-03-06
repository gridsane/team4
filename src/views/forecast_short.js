var TabPaneView = require('./tab_pane');
var dateUtils = require('../utils/dateutils');
var forecastShortTemplate = require('../templates/forecast_short.hbs');

var ForecastShortView = TabPaneView.extend({

    tabName: 'short',

    initialize: function (options) {
        this.initializeTabs(options.state);
        this.collection.on('reset', this.render, this);
    },

    render: function() {
        var html = '',
            tomorrow = dateUtils.getTomorrow();

        this.collection.each(function (model) {
            var day, night,
                parts = model.get('parts_short'),
                date = model.get('date');

            if (date < tomorrow) {
                return;
            }

            for (var i = parts.length - 1; i >= 0; i--) {
                switch (parts[i].type) {
                    case 'day_short': day = parts[i]; break;
                    case 'night_short': night = parts[i]; break;
                }

                if (day && night) {
                    break;
                }
            };

            html += forecastShortTemplate({
                date: {
                    'date': date,
                    'is_tomorrow': date.getDate() === tomorrow.getDate(),
                    'is_weekstart': date.getDay() === 1,
                    'is_weekend': model.get('is_weekend')
                },
                day: day,
                night: night
            });
        });

        this.$el.html(html);
    }
});

module.exports = ForecastShortView;
