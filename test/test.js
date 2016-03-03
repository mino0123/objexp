const objexp = require('../src/index');
const assert = require('assert');

describe('objexp', () => {

  describe('simple mapping', () => {
    it('returns object', () => {
      const result = objexp(`
				1	1
				ignore rows which is less than max columns.
			`);
      assert.deepEqual(result, {1: '1'});
    });
  });

  describe('If assign data option', () => {
    it('can use variable as key', () => {
      const data = {
        array: ['a', 'b']
      };
      const result = objexp(`
				$array	1
			`, {data});
      assert.deepEqual(result, {
        a: '1',
        b: '1'
      });
    });
  });

  describe('columns option', () => {
    it('ignore row which is less than assigned columns', () => {
      const result = objexp(`
				1	2	3
				2
				3	4
			`, {columns: 2});
      assert.deepEqual(result, {
        1: '2',
        3: '4'
      });
    });
  });

  describe('delimiter option', () => {
    it('', () => {
      const result = objexp(`
        a b c
        d e f
      `, {delimiter: ' '});
      assert.deepEqual(result, {
        a: {b: 'c'},
        d: {e: 'f'}
      });
    });
  });

});

