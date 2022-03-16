jest.mock('ioredis', () => {
  class MockedRedis {
    constructor() {
      this.on = this.on.bind(this);
      this.quit = this.quit.bind(this);
    }

    // eslint-disable-next-line class-methods-use-this
    on() {
      return jest.fn();
    }

    // eslint-disable-next-line class-methods-use-this
    quit() {
      return jest.fn();
    }
  }
  return MockedRedis;
});

const contractsHandler = require('./contracts.handler');

const mockedStatus = jest.fn();
const mockedJson = jest.fn();
const next = jest.fn();
const spyOnContractFindOne = jest.spyOn(contractsHandler.models.Contract, 'findOne');
const spyOnContractFindAll = jest.spyOn(contractsHandler.models.Contract, 'findAll');

const res = {
  status: mockedStatus,
  json: mockedJson,
};

describe('Contracts router handler methods', () => {
  const mockedEnd = jest.fn();
  const existingContractId = 1;
  const clientIdBelongsToContract = 100;
  const clientExistingProfile = {
    id: clientIdBelongsToContract,
    firstName: 'Harry',
    lastName: 'Potter',
    profession: 'Wizard',
    balance: 1150,
    type: 'client',
  };
  const existingContract = {
    id: existingContractId,
    terms: 'some terms',
    status: 'in_progress',
    createdAt: '2022-03-09T20:14:40.409Z',
    updatedAt: '2022-03-09T20:14:40.409Z',
    ContractorId: 7,
    ClientId: clientIdBelongsToContract,
  };
  const raisedError = new Error('Error happened while executing findOne method');
  let req;

  describe('getById', () => {
    const notExistingContractId = 2;
    const otherClient = 200;
    let getByIdResult;

    describe('when contract with given id exists', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      describe('and it belongs to the profile calling', () => {
        beforeAll(async () => {
          req = {
            params: { id: existingContractId },
            profile: clientExistingProfile,
          };
          // TODO: replace with real db interaction, e.g. in memory?
          spyOnContractFindOne.mockResolvedValue(existingContract);
          mockedJson.mockImplementationOnce((data) => data);
          getByIdResult = await contractsHandler.getById(req, res, next);
        });
        it('Should call once Contract findAll with correct query', () => {
          expect(spyOnContractFindOne).toBeCalledTimes(1);
          expect(spyOnContractFindOne.mock.calls[0]).toMatchSnapshot();
        });
        it('Should not call next', () => {
          expect(next).not.toBeCalled();
        });
        it('Should return contract', () => {
          expect(getByIdResult).toMatchObject(existingContract);
        });
      });
      describe('and it does not belong to the profile calling', () => {
        beforeAll(async () => {
          req = {
            params: { id: existingContractId },
            profile: {
              ...clientExistingProfile,
              id: otherClient,
            },
          };
          mockedJson.mockResolvedValue(existingContract);
          spyOnContractFindOne.mockResolvedValue(null);
          getByIdResult = await contractsHandler.getById(req, res, next);
        });
        it('Should reply with 404 status', () => {
          expect(mockedStatus).toBeCalledTimes(1);
          expect(mockedStatus).toBeCalledWith(404);
        });
        it('Should not call json method', () => {
          expect(mockedJson).toBeCalledTimes(0);
        });
        it('Should not call next', () => {
          expect(next).not.toBeCalled();
        });
      });
    });
    describe('when contract with given id does not exists', () => {
      beforeAll(async () => {
        req = {
          params: { id: notExistingContractId },
          profile: clientExistingProfile,
        };
        spyOnContractFindOne.mockResolvedValue(null);
        mockedStatus.mockImplementation(() => ({ end: mockedEnd }));
        getByIdResult = await contractsHandler.getById(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('Should not call json method', () => {
        expect(mockedJson).not.toBeCalled();
      });
      it('Should not call next', () => {
        expect(next).not.toBeCalled();
      });
      it('Should reply with 404 status', () => {
        expect(mockedStatus).toBeCalledTimes(1);
        expect(mockedStatus).toBeCalledWith(404);
        expect(mockedEnd).toBeCalledTimes(1);
      });
    });
    describe('when findOne throws an error', () => {
      beforeAll(async () => {
        req = {
          params: { id: notExistingContractId },
          profile: clientExistingProfile,
        };
        spyOnContractFindOne.mockRejectedValue(raisedError);
        getByIdResult = await contractsHandler.getById(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('Should not call json method', () => {
        expect(mockedJson).not.toBeCalled();
      });
      it('Should call next with error', () => {
        expect(next).toBeCalled();
        expect(next).toBeCalledWith(raisedError);
      });
    });
  });
  describe('list', () => {
    let listResult;

    describe('having 2 contracts belong to the profile calling', () => {
      const listOfTwoContracts = [
        {
          ...existingContract,
          id: 300,
          ClientId: clientIdBelongsToContract,
        },
        {
          ...existingContract,
          id: 301,
          ContractorId: clientIdBelongsToContract,
        },
      ];
      beforeAll(async () => {
        req = {
          profile: clientExistingProfile,
        };
        spyOnContractFindAll.mockResolvedValue(listOfTwoContracts);
        mockedStatus.mockImplementation(() => ({ end: mockedEnd }));
        mockedJson.mockResolvedValue(listOfTwoContracts);
        listResult = await contractsHandler.list(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('Should call once Contract findAll with correct query', () => {
        expect(spyOnContractFindAll.mock.calls[0]).toMatchSnapshot();
      });
      it('Should not call json method', () => {
        expect(mockedJson).toBeCalledTimes(1);
      });
      it('Should not call next', () => {
        expect(next).not.toBeCalled();
      });
      it('Should not call end', () => {
        expect(mockedStatus).not.toBeCalled();
        expect(mockedEnd).not.toBeCalled();
      });
      it('Should reply with list of 2 contracts', () => {
        expect(listResult).toMatchObject(listOfTwoContracts);
      });
    });
    describe('having no contracts belong to the profile calling', () => {
      const listOfTwoContracts = [];
      beforeAll(async () => {
        req = {
          profile: clientExistingProfile,
        };
        spyOnContractFindAll.mockResolvedValue(listOfTwoContracts);
        mockedStatus.mockImplementation(() => ({ end: mockedEnd }));
        mockedJson.mockResolvedValue(listOfTwoContracts);
        listResult = await contractsHandler.list(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('Should not call json method', () => {
        expect(mockedJson).not.toBeCalled();
      });
      it('Should not call next', () => {
        expect(next).not.toBeCalled();
      });
      it('Should reply with 404 status', () => {
        expect(listResult).toBeUndefined();
        expect(mockedStatus).toBeCalledWith(404);
        expect(mockedEnd).toBeCalledTimes(1);
      });
    });
    describe('when findAll throws and error', () => {
      beforeAll(async () => {
        req = {
          profile: clientExistingProfile,
        };
        spyOnContractFindAll.mockRejectedValue(raisedError);
        listResult = await contractsHandler.list(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });

      it('Should not call json method', () => {
        expect(mockedJson).not.toBeCalled();
      });
      it('Should not call next', () => {
        expect(next).toBeCalledTimes(1);
        expect(next).toBeCalledWith(raisedError);
      });
    });
  });
});
