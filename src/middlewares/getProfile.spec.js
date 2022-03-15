const { getProfile } = require('./getProfile');

const mockedReqAppGet = jest.fn();
const mockedReqGet = jest.fn();
const mockedFindOne = jest.fn();
const mockedStatus = jest.fn();

const contractorIdBelongsContract = 100;

const req = {
  app: {
    get: mockedReqAppGet,
  },
  get: mockedReqGet,
};

const res = {
  status: mockedStatus,
};
const next = jest.fn();

const contractorProfile = {
  id: contractorIdBelongsContract,
  firstName: 'Jobs',
  lastName: 'Spec',
  profession: 'Manual QA',
  balance: 0,
  type: 'contractor',
};

describe('getProfile middleware', () => {
  let getProfileResult;
  describe('with correct params', () => {
    beforeAll(() => {
      mockedReqGet.mockReturnValue(contractorIdBelongsContract);
      mockedReqAppGet.mockReturnValue({ Profile: { findOne: mockedFindOne } });
      mockedFindOne.mockResolvedValue(contractorProfile);
    });
    beforeAll(async () => {
      getProfileResult = await getProfile(req, res, next);
    });
    afterAll(() => {
      Reflect.deleteProperty(req, 'profile');
      jest.clearAllMocks();
    });
    it('Should call once next middleware', () => {
      expect(next).toBeCalledTimes(1);
    });
    it('Should attach profile to req', () => {
      expect(req).toHaveProperty('profile');
      expect(req.profile).toMatchObject(contractorProfile);
    });
    it('Should return undefined', () => {
      expect(getProfileResult).toBeUndefined();
    });
  });
  describe('with wrong profile_id params', () => {
    beforeAll(() => {
      mockedReqGet.mockReturnValue(null);
      mockedReqAppGet.mockReturnValue({ Profile: { findOne: mockedFindOne } });
      mockedFindOne.mockResolvedValue(null);
      mockedStatus.mockReturnValue({ end: jest.fn() });
    });
    beforeAll(async () => {
      getProfileResult = await getProfile(req, res, next);
    });
    afterAll(() => {
      Reflect.deleteProperty(req, 'profile');
      jest.clearAllMocks();
    });
    it('Should not call next middleware', () => {
      expect(next).not.toBeCalled();
    });
    it('Should call once status with 401 code', () => {
      expect(mockedStatus).toBeCalledTimes(1);
      expect(mockedStatus).toBeCalledWith(401);
    });
    it('Should return undefined', () => {
      expect(getProfileResult).toBeUndefined();
    });
  });
  describe('when Profile findOne throws error', () => {
    const dbError = new Error('Some db error');
    beforeAll(() => {
      mockedReqGet.mockReturnValue(contractorIdBelongsContract);
      mockedReqAppGet.mockReturnValue({ Profile: { findOne: mockedFindOne } });
      mockedFindOne.mockRejectedValue(dbError);
    });
    beforeAll(async () => {
      getProfileResult = await getProfile(req, res, next);
    });
    afterAll(() => {
      Reflect.deleteProperty(req, 'profile');
      jest.clearAllMocks();
    });
    it('Should call once next middleware', () => {
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(dbError);
    });
    it('Should not attache profile to req', () => {
      expect(req).not.toHaveProperty('profile');
    });
  });
});
