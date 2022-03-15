const { allowOnlyClients } = require('./allowOnlyClients');

const mockedStatus = jest.fn();

const req = {};
const res = {
  status: mockedStatus,
};
const next = jest.fn();

describe('allowOnlyClients middleware', () => {
  let middlewareResult;
  describe('with correct params', () => {
    beforeAll(() => {
      mockedStatus.mockImplementationOnce(() => ({
        send: (data) => data,
      }));
      req.profile = { type: 'client' };
      middlewareResult = allowOnlyClients(req, res, next);
    });
    afterAll(() => {
      jest.clearAllMocks();
      Reflect.deleteProperty(req, 'profile');
    });
    it('Should call once next middleware', () => {
      expect(next).toBeCalledTimes(1);
    });
    it('Should return undefined', () => {
      expect(middlewareResult).toBeUndefined();
    });
  });
  describe('with wrong params', () => {
    beforeAll(() => {
      mockedStatus.mockImplementationOnce(() => ({
        send: (data) => data,
      }));
      req.profile = { type: 'contractor' };
      middlewareResult = allowOnlyClients(req, res, next);
    });
    afterAll(() => {
      jest.clearAllMocks();
      Reflect.deleteProperty(req, 'profile');
    });
    it('Should not call next middleware', () => {
      expect(next).not.toBeCalled();
    });
    it('Should call once status with 403 code', () => {
      expect(mockedStatus).toBeCalledTimes(1);
      expect(mockedStatus).toBeCalledWith(403);
    });
    it('Should return unsuccessful result', () => {
      expect(middlewareResult).toMatchObject({
        success: false,
        reason: 'You profile is not authorized to perform the request',
      });
    });
  });
});
