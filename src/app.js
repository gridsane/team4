var Backbone = require('backbone');
var Router = require('./router');
var StateModel = require('./models/state');
var fetchHelper = require('./utils/fetch_helper');
var Suggest = require('./views/suggest');
var FactModel = require('./models/fact');
var ForecastCollection = require('./collections/forecast');
var CitySelectView = require('./views/city_select');
var ForecastTabsView = require('./views/forecast_tabs');
var ForecastShortView = require('./views/forecast_short');
var ForecastFullView = require('./views/forecast_full');
var ForecastHoursView = require('./views/forecast_hours');
var ForecastMapView = require('./views/forecast_map');
var NowView = require('./views/now');
var TitleView = require('./views/title');

require('./utils/template_helper');

var initialize = function () {
    var $overlay = $('.overlay').show();

    Backbone.$ = $;
    var state = new StateModel(),
        models = {
            today: new FactModel(),
            yesterday: new FactModel(),
            forecast: new ForecastCollection()
        },
        views = {
            now: new NowView({
                el: $('.current-weather'),
                collection: models.forecast,
                yesterday: models.yesterday,
                state: state,
            }),
            forecastFull: new ForecastFullView({
                el: $('.forecast_full'),
                collection: models.forecast,
                state: state,
            }),
            forecastShort: new ForecastShortView({
                el: $('.forecast_short'),
                collection: models.forecast,
                state: state,
            }),
            forecastHours: new ForecastHoursView({
                el: $('.forecast_hours'),
                collection: models.forecast,
                state: state,
            }),
            forecastMap: new ForecastMapView({
                el: $('.forecast_map'),
                model: models.today,
                state: state,
            })
        };

    new Suggest({
        el: $('.header__search'),
        state: state
    });

    views.forecastFull.on('rendered', function(){
        $overlay.hide();
        $('.middle__wrapper').css('visibility', 'visible');
    });

    state.on('change:geoid', function () {
        $overlay.show();
        fetchHelper(state.get('geoid')).then(function (data) {
            state.set('locality', data.locality);
            models.today.set(data.today);
            models.yesterday.set(data.yesterday);
            models.forecast.reset(data.forecast);
        });
    });

    new Router({state: state});

    new ForecastTabsView({
        el: $('.tabs'),
        state: state
    });

    new CitySelectView({
        el: $('.city-select'),
        model: state
    });

    new TitleView({
        el: $('title'),
        model: state
    });

    Backbone.history.start({pushState: true});

}

if (window) {
    window.onload = initialize;
} else {
    initialize();
}
