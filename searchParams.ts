/**
 * Function to call when iterating with forEach in the SearchParams.
 */
export type ForEachPredicate = (
  v: string,
  k: string,
  context: SearchParams,
) => void;

/**
 * Decode a URI component.
 */
const decode = (s: string) => {
  // Treat plus signs as spaces, unlike the default implementation.
  return decodeURIComponent(s.replace(/\+/g, ' '));
};

/**
 * Encode a URI component.
 */
const encode = (s: string) => {
  // Spaces will be encoded as %20, not plus signs.
  return encodeURIComponent(s);
};

/**
 * Fill for URLSearchParams, which is not available on all React Native
 * JavaScript environments (like iOS).
 *
 * Behavior should be identical to what's described here:
 * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 */
export class SearchParams {
  private params: Map<string, string | string[]>;

  private original: string;

  constructor(query: string) {
    this.original = query;
    this.params = new Map();
    this.parse(query);
  }

  /**
   * Iterate over the parsed params. If there are multiple params with the
   * same key, the predicate will be called once per value.
   */
  public forEach(f: ForEachPredicate, context?: any) {
    if (typeof context === 'undefined') {
      context = this;
    }

    for (const [k, v] of this.entries()) {
      f.call(context, v, k, context);
    }
  }

  /**
   * Add a new value to the params.
   *
   * Note that this doesn't do any URL encoding parsing.
   */
  public append(key: string, value: any) {
    this.addValue(key, String(value));
  }

  /**
   * Delete the given key from the map if it exists.
   *
   * If there are multiple values, delete them all.
   */
  public delete(key: string) {
    return this.params.delete(key);
  }

  /**
   * Get all entries in the params list. If there are multiple parameters for
   * a single key, they will each be returned individually in sequence.
   */
  public *entries() {
    for (const [k, v] of this.params) {
      if (Array.isArray(v)) {
        for (const inner of v) {
          yield [k, inner];
        }
      } else {
        yield [k, v];
      }
    }
  }

  /**
   * Iterating over the class is the same as iterating over entries.
   */
  [Symbol.iterator]() {
    return this.entries();
  }

  /**
   * Return an iterator of all the keys.
   */
  public *keys() {
    for (const [k] of this.entries()) {
      yield k;
    }
  }

  /**
   * Return an iterator of all the values.
   */
  public *values() {
    for (const [_, v] of this.entries()) {
      yield v;
    }
  }

  /**
   * Test if key was set.
   */
  public has(key: string) {
    return this.params.has(key);
  }

  /**
   * Set the given key to the given value, replacing any existing value(s).
   */
  public set(key: string, value: any) {
    this.params.set(key, String(value));
  }

  /**
   * Return a URL-encoded string with the values.
   */
  public toString() {
    const parts: string[] = [];
    for (const [k, v] of this.entries()) {
      parts.push(`${encode(k)}=${encode(v)}`);
    }
    return parts.join('&');
  }

  /**
   * Get the value set for the given key. If there were multiple values, only
   * return the first parsed one.
   *
   * If no value was set, returns null.
   */
  public get(key: string) {
    const value = this.params.get(key);
    if (!value) {
      return null;
    }

    if (Array.isArray(value)) {
      return value[0] || '';
    }

    return value;
  }

  /**
   * Get all values set for the given key. Always returns an array, even if no
   * values were parsed (then array has 0 values).
   */
  public getAll(key: string) {
    const value = this.params.get(key);
    if (!value) {
      return [];
    }

    if (!Array.isArray(value)) {
      return [value];
    }

    return value.slice();
  }

  /**
   * Sort the current values by key.
   */
  public sort() {
    // Since the JS Map remembers insertion order, just create a new map in
    // the right order.
    const sorted = new Map<string, string | string[]>();
    const keys = Array.from(this.params.keys());
    keys.sort();
    for (const k of keys) {
      sorted.set(k, this.params.get(k)!);
    }

    this.params = sorted;
  }

  /**
   * Parse the given query into the param map.
   */
  private parse(query: string) {
    // Trim initial query string.
    if (query.startsWith('?')) {
      query = query.substring(1);
    }

    if (!query.length) {
      return;
    }

    const vars = query.split('&');
    for (const v of vars) {
      const [key, value] = v.split('=', 2);
      if (value === undefined) {
        // This is consistent with the URLSearchParams behavior, even though
        // this scenario is usually interpretted as a boolean instead of the
        // empty string.
        this.addValue(key, '');
        continue;
      }

      const cleanKey = decode(key);
      const cleanValue = decode(value);
      this.addValue(cleanKey, cleanValue);
    }
  }

  /**
   * Add a new value to the parsed params.
   */
  private addValue(key: string, value: string) {
    const existing = this.params.get(key);

    if (existing !== undefined) {
      // If the existing key is already an array, just append. Otherwise
      // convert it to an array and append.
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        this.params.set(key, [existing, value]);
      }
    } else {
      // If no key exists yet, set it.
      this.params.set(key, value);
    }
  }
}
