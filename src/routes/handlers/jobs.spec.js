process.env.SEQUELIZE_STORAGE_PATH = `${process.cwd()}/test-db.sqlite3`;

const jobsHandler = require('./jobs.handler');

const mockedEnd = jest.fn();
const mockedJson = jest.fn();
const mockedStatus = jest.fn()
  .mockImplementation(
    () => ({ end: mockedEnd }),
  );
const spyOnJob = {
  findAll: jest.spyOn(jobsHandler.models.Job, 'findAll'),
  findOne: jest.spyOn(jobsHandler.models.Job, 'findOne'),
  update: jest.spyOn(jobsHandler.models.Job, 'update'),
};

const spyOnProfile = {
  findOne: jest.spyOn(jobsHandler.models.Profile, 'findOne'),
  update: jest.spyOn(jobsHandler.models.Profile, 'update'),
};

const activeContractId = 100;
const clientIdBelongsContract = 200;
const contractorIdBelongsContract = 300;

// TODO: switch to using test db
// eslint-disable-next-line no-unused-vars
const activeContract = {
  id: activeContractId,
  terms: 'Some terms of a contract',
  status: 'in_progress',
  ClientId: clientIdBelongsContract,
  ContractorId: contractorIdBelongsContract,
};

// TODO: switch to using test db
// eslint-disable-next-line no-unused-vars
const contractorProfile = {
  id: contractorIdBelongsContract,
  firstName: 'Jobs',
  lastName: 'Spec',
  profession: 'Manual QA',
  balance: 0,
  type: 'contractor',
};

const jobOne = {
  ContractId: activeContractId,
  createdAt: '2022-03-13T16:04:36.993Z',
  description: 'work of job one',
  id: 1,
  paymentDate: null,
  price: 100,
  updatedAt: '2022-03-13T16:04:36.993Z',
};
const jobTwo = {
  ContractId: activeContractId,
  createdAt: '2022-03-13T16:04:36.993Z',
  id: 2,
  description: 'work of job two',
  price: 200,
  updatedAt: '2022-03-13T16:04:36.993Z',
};

const req = {
  profile: {
    id: contractorIdBelongsContract,
  },
};

const res = {
  status: mockedStatus,
  json: mockedJson,
};

const next = jest.fn();

describe('Jobs router handler methods', () => {
  describe('listUnpaid', () => {
    describe('There are two unpaid jobs', () => {
      describe('belong to one active contract', () => {
        let listUnpaidResult;
        beforeAll(async () => {
          spyOnJob.findAll.mockResolvedValue([jobOne, jobTwo]);
          mockedJson.mockImplementationOnce((json) => json);
        });
        beforeAll(async () => {
          listUnpaidResult = await jobsHandler.listUnpaid(req, res, next);
        });
        afterAll(() => {
          jest.clearAllMocks();
        });

        it('Should call once Job findAll with correct query', () => {
          expect(spyOnJob.findAll).toBeCalledTimes(1);
          expect(spyOnJob.findAll.mock.calls[0]).toMatchSnapshot();
        });
        it('Should return two jobs', () => {
          expect(listUnpaidResult).toMatchObject([jobOne, jobTwo]);
        });
        it('Should call json method once', () => {
          expect(mockedJson).toBeCalledTimes(1);
        });
        it('Should not call res status', () => {
          expect(mockedStatus).not.toBeCalled();
        });
        it('Should not call next', () => {
          expect(next).not.toBeCalled();
        });
      });
    });
    describe('There are no unpaid jobs', () => {
      let listUnpaidResult;
      beforeAll(async () => {
        mockedStatus.mockImplementationOnce(
          () => ({ end: jest.fn() }),
        );
        spyOnJob.findAll.mockResolvedValue(null);
        mockedJson.mockImplementationOnce((json) => json);
      });
      beforeAll(async () => {
        listUnpaidResult = await jobsHandler.listUnpaid(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call once Job findAll with correct query', () => {
        expect(spyOnJob.findAll).toBeCalledTimes(1);
        expect(spyOnJob.findAll.mock.calls[0]).toMatchSnapshot();
      });
      it('Should not call json method once', () => {
        expect(mockedJson).not.toBeCalled();
      });
      it('Should call once status with 404 code', () => {
        expect(mockedStatus).toBeCalledTimes(1);
        expect(mockedStatus).toBeCalledWith(404);
      });
      it('Should not call next', () => {
        expect(next).not.toBeCalled();
      });
      it('Should return undefined', () => {
        expect(listUnpaidResult).toBeUndefined();
      });
    });
    describe('Job findAll throws error', () => {
      let listUnpaidResult;
      beforeAll(async () => {
        spyOnJob.findAll.mockRejectedValue(new Error('Some db error'));
      });
      beforeAll(async () => {
        listUnpaidResult = await jobsHandler.listUnpaid(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call once Job findAll with correct query', () => {
        expect(spyOnJob.findAll).toBeCalledTimes(1);
        expect(spyOnJob.findAll.mock.calls[0]).toMatchSnapshot();
      });
      it('Should not call json method once', () => {
        expect(mockedJson).not.toBeCalled();
      });
      it('Should not call status', () => {
        expect(mockedStatus).not.toBeCalled();
      });
      it('Should call once next middleware', () => {
        expect(next).toBeCalledTimes(1);
      });
      it('Should return undefined', () => {
        expect(listUnpaidResult).toBeUndefined();
      });
    });
  });
  describe('payById', () => {
    describe('Happy path', () => {
      let payByIdResult;
      beforeAll(async () => {
        spyOnJob.findOne.mockResolvedValue({
          ...jobOne,
          Contract: { ContractorId: contractorIdBelongsContract },
        });
        spyOnProfile.findOne.mockResolvedValue(contractorProfile);

        spyOnJob.update.mockResolvedValue(undefined);
        spyOnProfile.update.mockResolvedValue(undefined);

        mockedJson.mockImplementationOnce((json) => json);
      });
      beforeAll(async () => {
        payByIdResult = await jobsHandler.payById(
          {
            ...req,
            params: { job_id: jobOne.id },
            profile: { ...req.profile, balance: 100 },
          },
          res,
          next,
        );
      });
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('Should call once Job findOne once with correct query', () => {
        expect(spyOnJob.findOne).toBeCalledTimes(1);
        expect(spyOnJob.findOne.mock.calls[0]).toMatchSnapshot();
      });
      it('Should call once Profile findOne once with correct query', () => {
        expect(spyOnProfile.findOne).toBeCalledTimes(1);
        expect(spyOnProfile.findOne.mock.calls[0]).toMatchSnapshot();
      });
      it('Should call twice Profile update once with correct query', () => {
        expect(spyOnProfile.update).toBeCalledTimes(2);
        expect(spyOnProfile.update.mock.calls[0]).toMatchSnapshot();
        expect(spyOnProfile.update.mock.calls[1]).toMatchSnapshot();
      });
      it('Should call json method once', () => {
        expect(mockedJson).toBeCalledTimes(1);
      });
      it('Should not call res status', () => {
        expect(mockedStatus).not.toBeCalled();
      });
      it('Should not call next middleware', () => {
        expect(next).not.toBeCalled();
      });
      it('Should return updated job', () => {
        expect(payByIdResult).toMatchObject({
          ...jobOne,
          paid: true,
        });
      });
    });
  });
});
