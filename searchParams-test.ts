import {SearchParams} from '../modules/searchParams';

const testSearchParams = (qs: string, expected: Array<[string, string]>) => {
  const u = new SearchParams(qs);
  expect(Array.from(u)).toEqual(expected);
};

describe('SearchParams', () => {
  it('parses encoded strings', () => {
    testSearchParams('', []);
    testSearchParams('?', []);
    testSearchParams('=', [['', '']]);
    testSearchParams('?=', [['', '']]);
    testSearchParams('a', [['a', '']]);
    testSearchParams('a=', [['a', '']]);
    testSearchParams('a=1', [['a', '1']]);
    testSearchParams('a=1&b=2', [
      ['a', '1'],
      ['b', '2'],
    ]);
    testSearchParams('a=1%200&b=2', [
      ['a', '1 0'],
      ['b', '2'],
    ]);
    testSearchParams('a=1&a=2', [
      ['a', '1'],
      ['a', '2'],
    ]);
    testSearchParams('hi%20there=both%3Bencoded', [
      ['hi there', 'both;encoded'],
    ]);
    testSearchParams('plus+signs+too=should+be+spaces', [
      ['plus signs too', 'should be spaces'],
    ]);
  });

  it('gets values', () => {
    const u = new SearchParams('mult=1&mult=2&sing=1');
    expect(u.has('mult')).toBe(true);
    expect(u.get('mult')).toEqual('1');
    expect(u.getAll('mult')).toEqual(['1', '2']);

    expect(u.has('sing')).toBe(true);
    expect(u.get('sing')).toEqual('1');
    expect(u.getAll('sing')).toEqual(['1']);

    expect(u.has('not')).toBe(false);
    expect(u.get('not')).toBeNull();
    expect(u.getAll('not')).toEqual([]);
  });

  it('sorts values', () => {
    const u = new SearchParams('b=2&b=1&c=3&a=4');
    expect(Array.from(u)).toEqual([
      ['b', '2'],
      ['b', '1'],
      ['c', '3'],
      ['a', '4'],
    ]);

    u.sort();
    expect(Array.from(u)).toEqual([
      ['a', '4'],
      ['b', '2'],
      ['b', '1'],
      ['c', '3'],
    ]);
  });

  it('can manipulate values', () => {
    const u = new SearchParams('b=2&b=1&c=3&a=4');

    u.delete('b');
    expect(Array.from(u)).toEqual([
      ['c', '3'],
      ['a', '4'],
    ]);

    u.append('a', '5');
    expect(Array.from(u)).toEqual([
      ['c', '3'],
      ['a', '4'],
      ['a', '5'],
    ]);

    u.set('a', '10');
    expect(Array.from(u)).toEqual([
      ['c', '3'],
      ['a', '10'],
    ]);

    u.set('a', 11);
    expect(Array.from(u)).toEqual([
      ['c', '3'],
      ['a', '11'],
    ]);

    u.append('a', ['some', 'other', 'value']);
    expect(Array.from(u)).toEqual([
      ['c', '3'],
      ['a', '11'],
      ['a', 'some,other,value'],
    ]);
  });

  it('implements iterators', () => {
    const u = new SearchParams('b=2&b=1&c=3&a=4');

    expect(Array.from(u)).toEqual([
      ['b', '2'],
      ['b', '1'],
      ['c', '3'],
      ['a', '4'],
    ]);

    expect(Array.from(u.entries())).toEqual([
      ['b', '2'],
      ['b', '1'],
      ['c', '3'],
      ['a', '4'],
    ]);

    expect(Array.from(u.values())).toEqual(['2', '1', '3', '4']);

    expect(Array.from(u.keys())).toEqual(['b', 'b', 'c', 'a']);
  });

  it('implements forEach', () => {
    const u = new SearchParams('b=2&b=1&c=3&a=4');

    // Default context
    const calls: any[] = [];
    u.forEach((...args) => calls.push(args));
    expect(calls).toEqual([
      ['2', 'b', u],
      ['1', 'b', u],
      ['3', 'c', u],
      ['4', 'a', u],
    ]);

    // Custom context
    const calls2: any[] = [];
    const ctx = {};
    u.forEach((...args) => calls2.push(args), ctx);
    expect(calls2).toEqual([
      ['2', 'b', ctx],
      ['1', 'b', ctx],
      ['3', 'c', ctx],
      ['4', 'a', ctx],
    ]);
  });

  it('implements toString', () => {
    expect(new SearchParams('').toString()).toEqual('');
    expect(new SearchParams('?').toString()).toEqual('');
    expect(new SearchParams('=').toString()).toEqual('=');
    expect(new SearchParams('a=1').toString()).toEqual('a=1');
    expect(new SearchParams('a=1&b=1').toString()).toEqual('a=1&b=1');
    expect(new SearchParams('a=1&a=2&b=1').toString()).toEqual('a=1&a=2&b=1');
    expect(new SearchParams('a=%20hi&a=2&b=1').toString()).toEqual(
      'a=%20hi&a=2&b=1',
    );
    expect(new SearchParams('hi%20hi=%20hi').toString()).toEqual(
      'hi%20hi=%20hi',
    );
  });
});
