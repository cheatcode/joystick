import { jest } from '@jest/globals';

export default process.env.NODE_ENV === 'test' ? jest.requireActual('../../node_modules/dayjs') : null;