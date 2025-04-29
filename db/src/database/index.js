import crypto from 'crypto';

class Database {
  constructor() {}

  _generate_id() {
    return crypto.randomBytes(8).toString('hex');
  }

  _load_data() {}
  _write_data() {}

  collection(collection_name = '') {
    return {
      create: (documents = []) => {
        return this.create(documents, collection_name);
      },
      create_one: (document = {}) => {
        return this.create_one(document, collection_name);
      },
      update: (updates = []) => {
        return this.update(updates, collection_name);
      },
      update_one: (query = {}, update = {}) => {
        return this.create_one(query, update, collection_name);
      },
    };
  }

  create() {}
  create_one() {}

  read() {}
  read_one() {}

  update() {}
  update_one() {}

  delete() {}
  delete_one() {}

  backup() {}
  restore() {}
}

const database = new Database();

const post_id = await database.collection('posts').create({
  title: 'My title',
});

database.collection('posts').create({
  title: 'My title',
});
