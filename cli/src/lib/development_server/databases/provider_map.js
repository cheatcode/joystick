import connect_mongodb from './mongodb/connect.js';
import connect_postgresql from './postgresql/connect.js';
import connect_redis from './redis/connect.js';

const provider_map = {
  mongodb: {
    name: 'MongoDB',
    connect: connect_mongodb,
  },
  postgresql: {
    name: 'PostgreSQL',
    connect: connect_postgresql,
  },
  redis: {
    name: 'Redis',
    connect: connect_redis,
  },
};

export default provider_map;
