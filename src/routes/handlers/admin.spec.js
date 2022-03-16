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

const adminHandler = require('./admin.handler');

const spyOnJob = {
  findAll: jest.spyOn(adminHandler.models.Job, 'findAll'),
};
const spyOnValidateQueryParams = jest.spyOn(
  adminHandler,
  'validateQueryParams',
);
const mockedJson = jest.fn();
const mockedSend = jest.fn();
const mockedStatus = jest.fn();
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
  send: mockedSend,
  status: mockedStatus,
};

let req;

describe('Admin router handler methods', () => {
  describe('listBestClients', () => {
    describe('With correct params', () => {
      const mockedToJSON = jest.fn();
      let end;
      let start;
      let handlerResponse;

      beforeAll(async () => {
        end = '2020-10-15';
        start = '2020-01-25';
        req = {
          query: { end, start },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementationOnce(
          () => ({ send: (data) => data }),
        );
        mockedJson.mockImplementationOnce((data) => data);
        mockedToJSON.mockImplementation(() => ({
          Contract: {
            Client: {
              id: clientIdBelongsToContract,
              fullName: `${clientExistingProfile.firstName} ${clientExistingProfile.lastName}`,
            },
          },
          paid: 200,
        }));
        spyOnJob.findAll.mockResolvedValue([{ toJSON: mockedToJSON }]);
        handlerResponse = await adminHandler.listBestClients(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call validateQueryParams', () => {
        expect(spyOnValidateQueryParams).toBeCalledTimes(1);
      });
      it('Should call Job findAll with correct query', () => {
        expect(spyOnJob.findAll.mock.calls[0]).toMatchSnapshot();
      });
      it('Should call toJSON method', () => {
        expect(mockedToJSON).toBeCalledTimes(1);
      });
      it('Should return result of best profession', () => {
        expect(handlerResponse).toMatchObject(
          [{
            id: clientIdBelongsToContract,
            fullName: `${clientExistingProfile.firstName} ${clientExistingProfile.lastName}`,
            paid: 200,
          }],
        );
      });
    });
    describe('With wrong params', () => {
      let end;
      let start;
      let handlerResponse;

      beforeAll(async () => {
        end = '2020-10-15';
        start = 'wrong date';
        req = {
          query: { end, start },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementationOnce(
          () => ({ send: (data) => data }),
        );
        handlerResponse = await adminHandler.listBestClients(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call validateQueryParams', () => {
        expect(spyOnValidateQueryParams).toBeCalledTimes(1);
      });
      it('Should not call Job findAll', () => {
        expect(spyOnJob.findAll).not.toBeCalled();
      });
      it('Should send 400 status', () => {
        expect(mockedStatus).toBeCalledWith(400);
      });
      it('Should not call next middleware', () => {
        expect(next).not.toBeCalled();
      });
      it('Should return unsuccessful result', () => {
        expect(handlerResponse).toMatchObject({
          success: false,
          reason: 'Start and end params should be valid dates',
        });
      });
    });
    describe('Job findAll returns empty result', () => {
      let end;
      let start;
      let handlerResponse;

      beforeAll(() => {
        mockedStatus.mockRestore();
      });
      beforeAll(async () => {
        end = '2020-10-15';
        start = '2020-01-15';
        req = {
          query: { end, start },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementation(
          () => ({ end: jest.fn() }),
        );
        spyOnJob.findAll.mockResolvedValue(null);
        handlerResponse = await adminHandler.listBestClients(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call validateQueryParams', () => {
        expect(spyOnValidateQueryParams).toBeCalledTimes(1);
      });
      it('Should call Job findAll', () => {
        expect(spyOnJob.findAll).toBeCalledTimes(1);
      });
      it('Should send once 404 status', () => {
        expect(mockedStatus).toBeCalledTimes(1);
        expect(mockedStatus).toBeCalledWith(404);
      });
      it('Should not call next middleware', () => {
        expect(next).not.toBeCalled();
      });
      it('Should return unsuccessful result', () => {
        expect(handlerResponse).toBeUndefined();
      });
    });
    describe('Job findAll throws error', () => {
      let end;
      let start;
      let handlerResponse;

      beforeAll(async () => {
        end = '2020-10-15';
        start = '2020-01-15';
        req = {
          query: { end, start },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementationOnce(
          () => ({ send: (data) => data }),
        );
        spyOnJob.findAll.mockRejectedValue(new Error('Some db error'));
        handlerResponse = await adminHandler.listBestClients(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call validateQueryParams', () => {
        expect(spyOnValidateQueryParams).toBeCalledTimes(1);
      });
      it('Should call Job findAll', () => {
        expect(spyOnJob.findAll).toBeCalledTimes(1);
      });
      it('Should not send status', () => {
        expect(mockedStatus).not.toBeCalled();
      });
      it('Should call once next middleware', () => {
        expect(next).toBeCalledTimes(1);
      });
      it('Should return unsuccessful result', () => {
        expect(handlerResponse).toBeUndefined();
      });
    });
  });
  describe('listBestProfession', () => {
    describe('With correct params', () => {
      const mockedToJSON = jest.fn();
      let end;
      let start;
      let handlerResponse;

      beforeAll(async () => {
        end = '2020-10-15';
        start = '2020-01-25';
        req = {
          query: { end, start },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementationOnce(
          () => ({ send: (data) => data }),
        );
        mockedSend.mockImplementationOnce((data) => data);
        mockedToJSON.mockImplementation(() => ({
          Contract: { Contractor: { profession: 'QA Engineer' } },
        }));
        spyOnJob.findAll.mockResolvedValue([{ toJSON: mockedToJSON }]);
        handlerResponse = await adminHandler.listBestProfession(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call validateQueryParams', () => {
        expect(spyOnValidateQueryParams).toBeCalledTimes(1);
      });
      it('Should call Job findAll with correct query', () => {
        expect(spyOnJob.findAll.mock.calls[0]).toMatchSnapshot();
      });
      it('Should call toJSON method', () => {
        expect(mockedToJSON).toBeCalledTimes(1);
      });
      it('Should return result of best profession', () => {
        expect(handlerResponse).toMatchObject({ profession: 'QA Engineer' });
      });
    });
    describe('With wrong params', () => {
      const mockedToJSON = jest.fn();
      let end;
      let start;
      let handlerResponse;

      beforeAll(async () => {
        end = '2020-10-15';
        start = 'wrong date';
        req = {
          query: { end, start },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementationOnce(
          () => ({ send: (data) => data }),
        );
        mockedSend.mockImplementationOnce((data) => data);
        spyOnJob.findAll.mockResolvedValue([{ toJSON: mockedToJSON }]);
        handlerResponse = await adminHandler.listBestProfession(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call validateQueryParams', () => {
        expect(spyOnValidateQueryParams).toBeCalledTimes(1);
      });
      it('Should not call Job findAll', () => {
        expect(spyOnJob.findAll).not.toBeCalled();
      });
      it('Should send 400 status', () => {
        expect(mockedStatus).toBeCalledWith(400);
      });
      it('Should not call next middleware', () => {
        expect(next).not.toBeCalled();
      });
      it('Should return unsuccessful result', () => {
        expect(handlerResponse).toMatchObject({
          success: false,
          reason: 'Start and end params should be valid dates',
        });
      });
    });
    describe('Job findAll returns empty result', () => {
      let end;
      let start;
      let handlerResponse;

      beforeAll(() => {
        mockedStatus.mockRestore();
      });
      beforeAll(async () => {
        end = '2020-10-15';
        start = '2020-01-15';
        req = {
          query: { end, start },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementation(
          () => ({ end: jest.fn() }),
        );
        spyOnJob.findAll.mockResolvedValue(null);
        handlerResponse = await adminHandler.listBestProfession(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call validateQueryParams', () => {
        expect(spyOnValidateQueryParams).toBeCalledTimes(1);
      });
      it('Should call Job findAll', () => {
        expect(spyOnJob.findAll).toBeCalledTimes(1);
      });
      it('Should send once 404 status', () => {
        expect(mockedStatus).toBeCalledTimes(1);
        expect(mockedStatus).toBeCalledWith(404);
      });
      it('Should not call next middleware', () => {
        expect(next).not.toBeCalled();
      });
      it('Should return unsuccessful result', () => {
        expect(handlerResponse).toBeUndefined();
      });
    });
    describe('Job findAll throws error', () => {
      let end;
      let start;
      let handlerResponse;

      beforeAll(async () => {
        end = '2020-10-15';
        start = '2020-01-15';
        req = {
          query: { end, start },
          profile: clientExistingProfile,
        };
        mockedStatus.mockImplementationOnce(
          () => ({ send: (data) => data }),
        );
        mockedSend.mockImplementationOnce((data) => data);
        spyOnJob.findAll.mockRejectedValue(new Error('Some db error'));
        handlerResponse = await adminHandler.listBestProfession(req, res, next);
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      it('Should call validateQueryParams', () => {
        expect(spyOnValidateQueryParams).toBeCalledTimes(1);
      });
      it('Should call Job findAll', () => {
        expect(spyOnJob.findAll).toBeCalledTimes(1);
      });
      it('Should not send status', () => {
        expect(mockedStatus).not.toBeCalled();
      });
      it('Should call once next middleware', () => {
        expect(next).toBeCalledTimes(1);
      });
      it('Should return unsuccessful result', () => {
        expect(handlerResponse).toBeUndefined();
      });
    });
  });
  describe('validateQueryParams', () => {
    let validationResult;
    let raisedError;
    const correctEnd = '2020-12-20';
    const correctStart = '2020-01-20';

    describe('Correct params', () => {
      describe('Start and end only', () => {
        beforeAll(() => {
          adminHandler.queryParams = {
            end: correctEnd,
            start: correctStart,
          };
        });
        it('Should not throw error', () => {
          try {
            validationResult = adminHandler.validateQueryParams();
          } catch (err) {
            raisedError = err;
          }
          expect(raisedError).toBeUndefined();
        });
        it('Should return undefined', () => {
          expect(validationResult).toBeUndefined();
        });
      });
      describe('Start, end and limit', () => {
        beforeAll(() => {
          adminHandler.queryParams = {
            end: correctEnd,
            start: correctStart,
            limit: 10,
          };
        });
        it('Should not throw error', () => {
          try {
            validationResult = adminHandler.validateQueryParams();
          } catch (err) {
            raisedError = err;
          }
          expect(raisedError).toBeUndefined();
        });
        it('Should return undefined', () => {
          expect(validationResult).toBeUndefined();
        });
      });
    });
    describe('Wrong params', () => {
      describe('End param', () => {
        describe('is not a string', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: 1,
              start: correctStart,
            };
          });
          it('Should throw error that end must be a string', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Start and end params should be a string');
          });
        });
        describe('is not a correct date', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: 'incorrect date',
              start: correctStart,
            };
          });
          it('Should throw error that end must be a correct date', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Start and end params should be valid dates');
          });
        });
        describe('is before or equals start', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: correctStart,
              start: correctStart,
            };
          });
          it('Should throw error that end must be a correct date', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Start date should be greater end date');
          });
        });
      });
      describe('Start param', () => {
        describe('is not a string', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: correctEnd,
              start: 1,
            };
          });
          it('Should throw error that end must be a string', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError).toMatchObject({ message: 'Start and end params should be a string' });
          });
        });
        describe('is not a correct date', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: correctEnd,
              start: 'incorrect date',
            };
          });
          it('Should throw error that end must be a string', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Start and end params should be valid dates');
          });
        });
        describe('is before or equals end', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: correctEnd,
              start: correctEnd,
            };
          });
          it('Should throw error that end must be a correct date', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Start date should be greater end date');
          });
        });
      });
      describe('Limit param', () => {
        describe('Limit is NaN', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: correctEnd,
              start: correctStart,
              limit: 'NaN',
            };
          });
          it('Should throw error that end must be a string', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Limit param should be a number');
          });
        });
        describe('Limit is not a number', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: correctEnd,
              start: correctStart,
              limit: 'ten',
            };
          });
          it('Should throw error that end must be a string', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Limit param should be a number');
          });
        });
        describe('Limit is zero', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: correctEnd,
              start: correctStart,
              limit: 0,
            };
          });
          it('Should throw error that end must be a string', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Limit param should be greater 0');
          });
        });
        describe('Limit is negative', () => {
          beforeAll(() => {
            adminHandler.queryParams = {
              end: correctEnd,
              start: correctStart,
              limit: -10,
            };
          });
          it('Should throw error that end must be a string', () => {
            try {
              adminHandler.validateQueryParams();
            } catch (err) {
              raisedError = err;
            }
            expect(raisedError.toString()).toMatch('Error: Limit param should be greater 0');
          });
        });
      });
    });
  });
});
