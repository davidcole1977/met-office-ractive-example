var module = require('../../lib/simple-get-post'),
    fixtures = {
      contact: require('../fixture-data/contact.js'),
      contactJohn: require('../fixture-data/john-contact.js'),
      contactJane: require('../fixture-data/jane-contact.js')
    };

describe('simple-get-post', function() {
  'use strict';

  describe('makeQueryString()', function () {
    var makeQueryString = module.TEST.makeQueryString;

    it('exists', function () {
      expect(makeQueryString).to.exist;
    });

    it('returns basic query string', function () {
      var params = {
            foo: 'woo',
            bar: 'car'
          },
          expected_result = '?foo=woo&bar=car';

      expect(makeQueryString(params)).to.equal(expected_result);
    });

    it('returns urlEncoded query string', function () {
      var params = {
            'foo boo+shoo': 'woo hoo',
            'bar har': 'car rar'
          },
          expected_result = '?foo%20boo+shoo=woo%20hoo&bar%20har=car%20rar';

      expect(makeQueryString(params)).to.equal(expected_result);
    });

  });

  describe('get()', function() {
    var get = module.get;

    it('exists', function () {
      expect(get).to.exist;
    });

    it('returns Error when request submitted to non-existent URL', function (done) {
      function callback (error, data) {
        expect(error).to.be.an.instanceof(Error);
        done();
      }

      var args = {
        url: 'http://www.non-existent-url-i-promise/foobarilicious/',
        callback: callback
      };

      get(args);
    });

    it('returns error object when URL request returns 400 (bad request) status', function (done) {
      function callback (error, data) {
        expect(error).to.be.an.instanceof(Error);
        done();
      }

      var args = {
        url: 'http://localhost:3000/contact/?responseStatus=400',
        callback: callback
      };

      get(args);
    });

    it('returns parsed json object when URL request submitted with no query string params', function (done) {
      function callback (error, data) {
        expect(error).to.be.null;
        expect(data).to.deep.equal(fixtures.contact);
        done();
      }

      var args = {
        url: 'http://localhost:3000/contact',
        callback: callback
      };

      get(args);
    });

    it('returns parsed json object when URL request submitted with query string params', function (done) {
      function callback (error, data) {
        expect(error).to.be.null;
        expect(data).to.deep.equal(fixtures.contactJane);
        done();
      }

      var args = {
        url: 'http://localhost:3000/contact/',
        params: {
          user: 'jane'
        },
        callback: callback
      };

      get(args);
    });

  });

});
