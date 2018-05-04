'use strict';

var a = { id: 'a'};
var b = { id: 'b'};
var c = {id: 'c'};

var arr = [];

arr.push(a);
arr.push(b);
arr.push(c);

var index = arr.indexOf(b);

console.log('index:', index, ' - arr:', arr);