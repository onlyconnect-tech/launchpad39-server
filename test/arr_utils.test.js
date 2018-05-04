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
  var arrDest = [];

  ArrayUtils.renderSame(arrSrc, arrDest, indexOfObjectConstructor());

  t.deepEqual(arrDest, [{id: 'a'}, {id: 'b'}, {id: 'c'}], 'all elements added');
  t.end();
});

test('should return -2 when the value is not present in Array', function (t) {
  
  var arrSrc = [];
  var arrDest = [{id: 'a'}, {id: 'b'}, {id: 'c'}];

  ArrayUtils.renderSame(arrSrc, arrDest, indexOfObjectConstructor());

  t.deepEqual(arrDest, [], 'all elements removed');

  t.end();
});

test('should return -2 when the value is not present in Array', function (t) {
  
  var arrSrc = [{id: 'a'}, {id: 'c'}];
  var arrDest = [{id: 'a'}, {id: 'b'}, {id: 'c'}];

  ArrayUtils.renderSame(arrSrc, arrDest, indexOfObjectConstructor());
  
  t.deepEqual(arrDest, [{id: 'a'}, {id: 'c'}], 'OK');

  t.end();
});


test('should return -2 when the value is not present in Array', function (t) {
  
  var arrSrc = [{id: 'a'}, {id: 'c'}, {id: 'd'}];
  var arrDest = [{id: 'a'}, {id: 'b'}, {id: 'c'}];

  ArrayUtils.renderSame(arrSrc, arrDest, indexOfObjectConstructor());
  
  t.deepEqual(arrDest, [{id: 'a'}, {id: 'c'}, {id: 'd'}], 'OK');

  t.end();
});

test('should return -2 when the value is not present in Array', function (t) {
  
  var arrSrc = [{id: 'a'}, {id: 'c'}, {id: 'd'}];
  var arrDest = [{id: 'a'}, {id: 'b'}, {id: 'c'}];

  var arrRem = [];
  function callbackRemoveElem(elem) {
      arrRem.push(elem);
  }

  var arrIns = [];
  function callbackInsertedElement(elem) {
      arrIns.push(elem);
  }

  ArrayUtils.renderSame(arrSrc, arrDest, indexOfObjectConstructor(), callbackRemoveElem, callbackInsertedElement);
  
  t.deepEqual(arrDest, [{id: 'a'}, {id: 'c'}, {id: 'd'}], 'OK');

  t.deepEqual(arrRem, [{id: 'b'}], 'OK');
  t.deepEqual(arrIns, [{id: 'd'}], 'OK');

  t.end();
});

