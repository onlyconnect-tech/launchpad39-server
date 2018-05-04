'use strict';

const ArrayUtils = require('../util/array_utils');

const test = require('tape'); // assign the tape library to the variable "test"

function xtest() {}

function indexOfObjectConstructor() {

  function comparator(elemA, elemB){

    if(elemA.id === elemB.id){
      return true;
    }
    return false;
  }

  return ArrayUtils.buildIndexOf(comparator);

}

test('should return -1 when the value is not present in Array', function (t) {
  
  var arrSrc = [{id: 'a'}, {id: 'b'}, {id: 'c'}];

  Array.prototype.indexOfObject = indexOfObjectConstructor();

  var index = arrSrc.indexOfObject({id: 'a'});

  t.deepEqual(index, 0, 'all elements added');

  index = arrSrc.indexOfObject({id: 'b'});

  t.deepEqual(index, 1, 'all elements added');

  index = arrSrc.indexOfObject({id: 'c'});

  t.deepEqual(index, 2, 'all elements added');

  t.end();
});

test('should return -1 when the value is not present in Array', function (t) {
  
  var arrSrc = [{id: 'a'}, {id: 'b'}, {id: 'c'}];

  Array.prototype.indexOfObject = indexOfObjectConstructor();

  var index = arrSrc.indexOfObject({id: 'aA'});

  t.deepEqual(index, -1, 'all elements added');
  t.end();
});



