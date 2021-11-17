import getValueFromObject from "./getValueFromObject";

describe('validation/lib/getValueFromObject.js', () => {
  test('returns undefined if object is not passed', () => {
    const value = getValueFromObject();
    expect(value).toBe(undefined);
  });
});