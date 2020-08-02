const run = require('../server/calculator/removeTaxes.js')


test('It should return value minus taxes', () => {
    expect(run.removeTaxes(100, 10)).toBe(90)
})