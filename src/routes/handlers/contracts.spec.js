const contractsHandler = require('./contracts.handler');

describe('Route handler: Contracts', () => {
  test('getById', async () => {
    const getById = await contractsHandler.getById();
    expect(getById).toMatch(43);
  });
});
