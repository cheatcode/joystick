import connectMongoDB from './mongodb/connect.js';
import connectPostgreSQL from './postgresql/connect.js';

export default {
  mongodb: {
    name: 'MongoDB',
    connect: connectMongoDB,
  },
  postgresql: {
    name: 'PostgreSQL',
    connect: connectPostgreSQL,
  },
};