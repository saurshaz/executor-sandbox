// a simulation of tha flow from callee's point of view
const assert = require('assert');
const launcher = require('../function')
let inputs = {}

describe('test_module', function() {

  beforeEach((done) => {
    // gather inputs data
    inputs = require('../metadata')
    done()
  })

  it('test_function', function(done) {
    // call the saved function with input data
    launcher(inputs, (err, result) => {
      if (err) {
        console.log('err is ', err)
      } else if (result) {
        if (typeof result === 'object') {
          result = JSON.stringify(result)
        }
        console.log('              ')
        console.log('**************')
        console.log('result is ', result)
        assert(result === 100, true)
        done()
      }
    })
  });
});