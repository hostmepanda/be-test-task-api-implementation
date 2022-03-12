const contractsHandler = require('./contracts.handler');

const mockedStatus = jest.fn();
const mockedJson = jest.fn();
const next = jest.fn();
const spyOnContractFindOne = jest.spyOn(contractsHandler.models.Contract, 'findOne');

const res = {
  status: mockedStatus,
  json: mockedJson,
};

describe('Contracts router handler methods', () => {
  describe('getById', () => {
    const existingContractId = 1;
    const notExistingContractId = 2;
    const clientIdBelongsToContract = 100;
    const otherClient = 200;

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
    let getByIdResult;
    let req;

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
          mockedJson.mockResolvedValue(existingContract);
          spyOnContractFindOne.mockResolvedValue(existingContract);
          getByIdResult = await contractsHandler.getById(req, res, next);
        });
        it('Should call json method', () => {
          expect(mockedJson).toBeCalledTimes(1);
          expect(mockedJson).toBeCalledWith(existingContract);
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
      const mockedEnd = jest.fn();
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
      const raisedError = new Error('Error happened while executing findOne method');
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
});
