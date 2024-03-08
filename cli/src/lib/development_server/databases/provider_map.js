import connect_mongodb from './mongodb/connect.js';
import connect_postgresql from './postgresql/connect.js';

const provider_map = {
  mongodb: {
    name: 'MongoDB',
    connect: connect_mongodb,
  },
  postgresql: {
    name: 'PostgreSQL',
    connect: connect_postgresql,
  },
};

export default provider_map;
