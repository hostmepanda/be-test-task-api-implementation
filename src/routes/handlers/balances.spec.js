const balancesHandler = require('./balances.handler');

const spyOnProfile = {
  update: jest.spyOn(balancesHandler.models.Profile, 'update'),
};
const spyOnJob = {
  sum: jest.spyOn(balancesHandler.models.Job, 'sum'),
};
const mockedStatus = jest.fn();
const mockedJson = jest.fn();
const next = jest.fn();

const clientIdBelongsToContract = 100;
const clientExistingProfile = {
  id: clientIdBelongsToContract,
  firstName: 'Harry',
  lastName: 'Potter',
  profession: 'Wizard',
  balance: 1150,
  type: 'client',
};

const res = {
  json: mockedJson,
  status: mockedStatus,
};

let req;

describe('Balances router handler methods', () => {
  describe('depositByUserId', () => {
    describe('With correct params', () => {
      const deposit = 50;
      let depositResult;
      beforeAll(async () => {
        req = {
          body: { deposit },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementationOnce(
          () => ({ send: (data) => data }),
        );
        spyOnJob.sum.mockResolvedValue(deposit * 4);
        spyOnProfile.update.mockResolvedValue(undefined);
        depositResult = await balancesHandler.depositByUserId(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call Job sum aggregation with correct query', () => {
        expect(spyOnJob.sum.mock.calls[0][1]).toMatchSnapshot();
      });
      it('Should call Profile update once with correct params', () => {
        expect(spyOnProfile.update).toBeCalledTimes(1);
        expect(spyOnProfile.update.mock.calls[0]).toMatchSnapshot();
      });
      it('Should return result of deposit operation', () => {
        expect(depositResult).toMatchObject({
          success: true,
          balance: clientExistingProfile.balance + deposit,
        });
      });
    });
    describe('With wrong params', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      describe('deposit is a string', () => {
        const deposit = '50';
        let depositResult;
        beforeAll(async () => {
          req = {
            body: { deposit },
            profile: clientExistingProfile,
          };
          mockedStatus.mockImplementationOnce(
            () => ({ send: (data) => data }),
          );
          depositResult = await balancesHandler.depositByUserId(req, res, next);
        });
        it('should call once status with 400 code', () => {
          expect(mockedStatus).toBeCalledTimes(1);
          expect(mockedStatus).toBeCalledWith(400);
        });
        it('should response with unsuccessful result', () => {
          expect(depositResult).toMatchObject({
            success: false,
            reason: 'Deposit must be a number',
          });
        });
      });
      describe('deposit is a negative number', () => {
        const deposit = -50;
        let depositResult;
        beforeAll(async () => {
          req = {
            body: { deposit },
            profile: clientExistingProfile,
          };
          mockedStatus.mockImplementationOnce(
            () => ({ send: (data) => data }),
          );
          depositResult = await balancesHandler.depositByUserId(req, res, next);
        });
        it('should call once status with 400 code', () => {
          expect(mockedStatus).toBeCalledTimes(1);
          expect(mockedStatus).toBeCalledWith(400);
        });
        it('should response with unsuccessful result', () => {
          expect(depositResult).toMatchObject({
            success: false,
            reason: 'Deposit must be positive',
          });
        });
      });
      describe('deposit is greater than 25% of the sum of jobs to pay', () => {
        const deposit = 50;
        let depositResult;
        beforeAll(async () => {
          req = {
            body: { deposit },
            profile: clientExistingProfile,
          };
          spyOnJob.sum.mockResolvedValue(100);
          mockedStatus.mockImplementationOnce(
            () => ({ send: (data) => data }),
          );
          depositResult = await balancesHandler.depositByUserId(req, res, next);
        });
        it('should call once status with 400 code', () => {
          expect(mockedStatus).toBeCalledTimes(1);
          expect(mockedStatus).toBeCalledWith(403);
        });
        it('should response with unsuccessful result', () => {
          expect(depositResult).toMatchObject({
            success: false,
            reason: 'Max allowed deposit is 25',
          });
        });
      });
      describe('no jobs to pay for', () => {
        const deposit = 50;
        let depositResult;
        beforeAll(async () => {
          req = {
            body: { deposit },
            profile: clientExistingProfile,
          };
          spyOnJob.sum.mockResolvedValue(null);
          mockedStatus.mockImplementationOnce(
            () => ({ send: (data) => data }),
          );
          depositResult = await balancesHandler.depositByUserId(req, res, next);
        });
        it('should call once status with 400 code', () => {
          expect(mockedStatus).toBeCalledTimes(1);
          expect(mockedStatus).toBeCalledWith(403);
        });
        it('should response with unsuccessful result', () => {
          expect(depositResult).toMatchObject({
            success: false,
            reason: 'Max allowed deposit is 0',
          });
        });
      });
    });
    describe('Errors while executing the request', () => {
      describe('Job sum aggregation throws error', () => {
        const deposit = 50;
        let depositResult;
        beforeAll(async () => {
          req = {
            body: { deposit },
            profile: clientExistingProfile,
          };
          mockedStatus.mockImplementationOnce(
            () => ({ send: (data) => data }),
          );
          spyOnJob.sum.mockRejectedValue(new Error('Some db error'));
          depositResult = await balancesHandler.depositByUserId(req, res, next);
        });
        afterAll(() => {
          jest.clearAllMocks();
        });
        it('Should not call Profile', () => {
          expect(spyOnProfile.update).not.toBeCalled();
        });
        it('Should call next', () => {
          expect(next).toBeCalledTimes(1);
        });
        it('Result should be undefined', () => {
          expect(depositResult).toBeUndefined();
        });
      });
      describe('Profile update throws error', () => {
        const deposit = 50;
        let depositResult;
        beforeAll(async () => {
          req = {
            body: { deposit },
            profile: clientExistingProfile,
          };
          mockedStatus.mockImplementationOnce(
            () => ({ send: (data) => data }),
          );
          spyOnJob.sum.mockResolvedValue(deposit * 4);
          spyOnProfile.update.mockRejectedValue(new Error('Some db error'));
          depositResult = await balancesHandler.depositByUserId(req, res, next);
        });
        afterAll(() => {
          jest.clearAllMocks();
        });
        it('Should call status once with 400', () => {
          expect(mockedStatus).toBeCalledTimes(1);
          expect(mockedStatus).toBeCalledWith(400);
        });
        it('Should not call next', () => {
          expect(next).not.toBeCalled();
        });
        it('Result should be unsuccessful', () => {
          expect(depositResult).toMatchObject({
            success: false,
            reason: 'Internal error',
          });
        });
      });
    });
  });
});
