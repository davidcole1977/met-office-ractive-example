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

