(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  // met office uk hourly site-specific observations (last 24 hours, all 150 locations)
  var restEndPoint = 'http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/',
      apiKey = '', // get your api key at http://www.metoffice.gov.uk/datapoint 
      locations = [],
      observationSets = {},
      isReady = false,
      readyCallback = null;

  function onReady (callback) {
    readyCallback = callback;

    if (isReady) {
      readyCallback();
    }
  }

  function getLocationNames () {
    return locations;
  }

  function getObservationSet (location) {
    return observationSets[location];
  }

  function reduceSetByAverages (observation1, observation2, index, observationSet) {
    return {
      temperature: observation2.temperature,
      windSpeed: observation2.windSpeed,
      airPressure: observation2.airPressure
    };
  }

  function getObservationAverages (location) {
    return getObservationSet(location).reduce(reduceSetByAverages);
  }

  function parseLocations (data) {
    var locations = [];

    data.SiteRep.DV.Location.forEach(function (location) {
      locations.push(location.name);
    });

    return locations;
  }

  function parseObservationSets (data) {
    var observationSets = {};

    data.SiteRep.DV.Location.forEach(function (location) {
      observationSets[location.name] = [];

      location.Period.forEach(function (period) {
        period.Rep.forEach(function (observation) {
          observationSets[location.name].push({
            hour: parseInt(observation.$, 10) / 60, // $ == minutes after midnight
            temperature: parseInt(observation.T, 10),
            windSpeed: parseInt(observation.S, 10),
            airPressure: parseInt(observation.P, 10)
          });
        });
      });

    });

    return observationSets;
  }

  function cacheResponse (data) {
    locations = parseLocations(data);
    observationSets = parseObservationSets(data);
  }   

  function receiveResponse (data) {
    cacheResponse(data);
    isReady = true;

    if (isReady && readyCallback) {
      readyCallback();
    }

    console.log(data);
  } 

  function requestHourlySiteSpecifcObservations (location, callback) {
  // if requesting all locations, specify 'all' for location

    $.get(
      restEndPoint + location,
      {
        res: 'hourly',
        key: apiKey
      },
      callback,
      'json'
    ); 
  }

  // get the data and then parse and cache it in this function scope
  requestHourlySiteSpecifcObservations('all', receiveResponse);

  return {
    getLocationNames: getLocationNames,
    getObservationSet: getObservationSet,
    getObservationAverages: getObservationAverages,
    onReady: onReady
  };

}());


},{}],2:[function(require,module,exports){
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

},{"./datapoint-service":1}]},{},[2]);
