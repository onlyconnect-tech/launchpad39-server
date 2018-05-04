'use strict';

/** utility class on arrays */

class ArrUtils {

  /**
   * This callback type is called `callbackOnRemoveElem` and is displayed as a global symbol.
   *
   * @callback ArrUtils~callbackOnRemoveElem
   * @param {string} elem - element removed
   */

  /**
   * This callback type is called `callbackOnNewElem` and is displayed as a global symbol.
   *
   * @callback ArrUtils~callbackOnNewElem
   * @param {string} elem - element inserted
   */

  /**
   * Function to propagate modifications from soure array to actual array.
   * <br>
   * <br>
   * Based on elements in source array, insert or delete elements in actual array for became with some 
   * elements.
   * 
   * @param  {array} sourceArr - array with actual modifications
   * @param  {array} actualArr - array to be modified to contain the same element of sourceArr
   * @param  {function} indexOfObject - function used as indexOf
   * @param  {ArrUtils~callbackOnRemoveElem=} callbackOnRemoveElem - function called when a element is removed from actualArray
   * @param  {ArrUtils~callbackOnNewElem=} callbackOnNewElem - function called new a new element inserted in actualArray
   *
   * @example <caption>Example usage of renderSame(arrSrc, arrDest)</caption>
   * 
   * var arrSrc = ['a', 'b', 'c'];
   * var arrDest = [];
   * 
   * --> arrDest = ['a', 'b', 'c']
   * 
   * @example
   * 
   * var arrSrc = [];
   * var arrDest = ['a', 'b', 'c'];
   * 
   * --> arrDest = []
   * 
   * @example
   * 
   * var arrSrc = ['a', 'c'];
   * var arrDest = ['a', 'b', 'c'];
   * 
   * --> arrDest = ['a', 'c']
   * 
   * @example
   * 
   * var arrSrc = ['a', 'c', 'd'];
   * var arrDest = ['a', 'b', 'c'];
   * 
   * --> arrDest = ['a', 'c', 'd']
   * 
   * @example
   * 
   * var arrSrc = ['a', 'c', 'd'];
   * var arrDest = ['a', 'b', 'c'];
   * 
   * --> arrDest = ['a', 'c', 'd']
   * 
   * @return {void}   
   */

    static renderSame(sourceArr, actualArr, indexOfObject, callbackOnRemoveElem, callbackOnNewElem) {

        if (!indexOfObject) {
          Array.prototype.indexOfObject = Array.prototype.indexOf;
      } else {
          Array.prototype.indexOfObject = indexOfObject;
      }

    // first remove elements from actualArr not more in srcArr
        var index = 0;
        while (index < actualArr.length) {
          let elem = actualArr[index];

          if (sourceArr.indexOfObject(elem) === -1) {
        // elemento da togliere
            actualArr.splice(index, 1);

            if (callbackOnRemoveElem && (typeof callbackOnRemoveElem === 'function')) {
              callbackOnRemoveElem(elem);
          }

        } else {
            index++;
        }
      }

    // add element to actualArr that are new in srcArr
        sourceArr.forEach(function (currentValue, index, arr) {

      // prima controllare se non presente
          if (actualArr.indexOfObject(currentValue) === -1) {
            actualArr.push(currentValue);

            if (callbackOnNewElem && (typeof callbackOnNewElem === 'function')) {
              callbackOnNewElem(currentValue);
          }
        }

      });
    }

    static buildIndexOf(comparator) {

        return function (elem) {
          for (var index = 0; index < this.length; index++) {
            if (comparator(this[index], elem)) {
              return index;
          }
        }
      // not found
          return -1;
      };
    }



}



module.exports = ArrUtils;