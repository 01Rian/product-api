const db = {
  connect: jest.fn().mockResolvedValue({}),
  one: jest.fn(),
  any: jest.fn(),
  result: jest.fn(),
  tx: jest.fn(),
  none: jest.fn(),
  oneOrNone: jest.fn()
};

module.exports = db;