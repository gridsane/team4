var Backbone = require('backbone');
var tabsTemplate = require('../templates/forecast_tabs.hbs');

var tabs = [
    {
        title: 'кратко',
        link: 'short'
    },
    {
        title: 'подробно',
        link: 'full'
    },
    {
        title: 'наглядно',
        link: 'hours'
    },
    {
        title: 'на карте',
        link: 'map'
    }
];

var ForecastTabView = Backbone.View.extend({
    events: {
        'click a': 'transition'
    },

    initialize: function(options) {
        this.state = options.state;
        this.state.on('change', this.render, this);
        this.render();
    },

    transition: function(e) {
        this.state.set('tab', $(e.currentTarget).data('tab'));
        e.preventDefault();
    },

    render: function(){
        if (tabs.length > 0) {
            this.$el.html(tabsTemplate({
                state: this.state.toJSON(),
                tabs: tabs
            }));
        }
    }
});

module.exports = ForecastTabView;
