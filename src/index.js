'use strict';

const product = require('cartesian-product');
const get = require('lodash.get');
const setWith = require('lodash.setwith');


module.exports = objexp;

/**
 * @typedef Options
 * @property {object} data
 * @property {string} delimiter
 * @property {number} columns
 */

/**
 * Config default options.
 * @param {Options} config
 */
objexp.configure = function objexp_configure(config) {
  return (data, exp, options) => objexp(data, exp, Object.assign({}, config, options));
};

/**
 * @param {string} exp
 * @param {Options} options
 * @returns {Object}
 * @example
const objexp = require('objexp');
objexp(`
	Rows are ignored if less than maximum columns.
	1	2	3
	4	5	6
	7	8	9
`);
// => {
//   1: {2: 3: {}},
//   4: {5: 6: {}},
//   7: {8: 9: {}}
// }

   @example
const objexp = require('objexp');
objexp(`
	$array	1				2
	3				$array	4
	5				6				$array
`, {data: {array: ['1', '2', '3']}});
// => {
//   1: {2: 3: {}},
//   2: {2: 3: {}},
//   3: {
//     1: {2: {}, 4: {}},
//     2: {4: {}},
//     3: {4: {}}
//   },
//   5: {6: {
//     1: {},
//     2: {},
//     3: {}
//   }}
// }

**/
function objexp(exp, options) {
  options = options || {};
  const data = options.data || {};
  const delimiter = options.delimiter || '\t';
  let rows = exp.split('\n')
    .map((line) => line.split(delimiter).filter((col) => !!col));
  let columns = options.columns;
  if (!columns) {
    const rowLengths = rows.map((cols) => cols.length);
    columns = rowLengths.reduce((max, i) => Math.max(max, i), 0);
  }
  return rows
    .filter((cols) => cols.length >= columns)
    .reduce((map, cols) => {
      cols = cols.slice(0, columns);// remove trailing columns
      const head = cols.slice(0, cols.length - 1);
      const props = head.map((c) => toArray( evalColExp(c, data) ));
      const valueExp = cols.slice(cols.length - 1)[0];
      const value = evalColExp(valueExp, data);
      product(props).forEach((args) => {
        setWith(map, args, value, Object);
      });
      return map;
    }, {});
};

function toArray(v) {
  return Array.isArray(v) ? v : [v];
}

function evalColExp(exp, data) {
  if (exp[0] !== '$') {
    return exp;
  } else {
    return get(data, exp.substring(1));
  }
}
