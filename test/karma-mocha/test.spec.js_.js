var libDir = process.env.LIB_DIR || '../../src/js/',
    module = require('../../src/js/module');

describe('Arithmetic', function() {

  it('exists', function () {
    expect(typeof module.Arithmetic).to.equal('function');
  });

  describe('Arithmetic.sum', function() {
    var arithmetic = new module.Arithmetic(),
        sum = arithmetic.sum;

    it('exists', function () {
      expect(sum).to.exist;
    });

    it('correctly adds two numbers together', function () {
      expect(sum(4, 5)).to.equal(9);
    });

  });

});
