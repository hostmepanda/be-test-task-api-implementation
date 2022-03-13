process.env.SEQUELIZE_STORAGE_PATH = `${process.cwd()}/test-db.sqlite3`;

const jobsHandler = require('./jobs.handler');

const mockedEnd = jest.fn();
const mockedJson = jest.fn();
const mockedStatus = jest.fn()
  .mockImplementation(
    () => ({ end: mockedEnd }),
  );
const spyOnJobFindAll = jest.spyOn(jobsHandler.models.Job, 'findAll');

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
  balance: 3000,
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
          spyOnJobFindAll.mockResolvedValue([jobOne, jobTwo]);
          mockedJson.mockImplementationOnce((json) => json);
        });
        beforeAll(async () => {
          listUnpaidResult = await jobsHandler.listUnpaid(req, res, next);
        });
        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should return two jobs', () => {
          expect(listUnpaidResult).toMatchObject([jobOne, jobTwo]);
        });
        it('should call json method once', () => {
          expect(mockedJson).toBeCalledTimes(1);
        });
        it('should not call res status', () => {
          expect(mockedStatus).not.toBeCalled();
        });
        it('should not call next', () => {
          expect(next).not.toBeCalled();
        });
      });
    });
  });
});
