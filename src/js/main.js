(function () {
  'use strict';

  var dpService = require('./datapoint-service'),
      dpRactive,
      filters;

  filters = {
    formatHour: function (value) {
      return value.toString() + ':00';
    },

    formatTemp: function (value) {
      return value.toString() + '°C';
    },

    formatSpeed: function (value) {
      return value.toString() + 'mph';
    },

    formatPressure: function (value) {
      return value.toString() + 'hpa';
    },

    sortObservationAverages: function (observationSets, sortValue) {
      return observationSets.slice().sort(function (set1, set2) {
        if (sortValue === 'location') {
          return set1.location > set2.location ? 1 : -1;
        } else {
          return set1.averages[sortValue] - set2.averages[sortValue];
        }
      });
    },
    
    hasMoreThanOneEntry: function (array) {
      return array.length > 1;
    }
  };

  function connectDataService () {
    dpService.onReady(populateData);
  }

  function populateData () {
    dpRactive.set('locationNames', dpService.getLocationNames());
    dpRactive.set('isReady', true);
  }

  dpRactive = new Ractive({
    el: '#dp-view-container',
    template: '#dp-view-template',
    data: {
      isReady: false,
      locationToAdd: '',
      locationNames: [],
      selectedLocations: [],
      observationSets: [],
      sortValue: 'location',
      filters: filters
    },
    oncomplete: connectDataService
  });

  dpRactive.on('addLocation', function (event, locationToAdd) {
    var selectedLocations = this.get('selectedLocations'),
        locationNames = this.get('locationNames'),
        observationSets = this.get('observationSets'),
        observationAverages = this.get('observationAverages');

    if (selectedLocations.indexOf(locationToAdd) === -1 && locationNames.indexOf(locationToAdd) !== -1) {
      selectedLocations.push(locationToAdd);
      observationSets.push({
        location: locationToAdd,
        observations: dpService.getObservationSet(locationToAdd),
        averages: dpService.getObservationAverages(locationToAdd)
      });
      this.set('locationToAdd', '');
    }
  });

})();
