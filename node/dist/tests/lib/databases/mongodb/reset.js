var reset_default = async (db = null) => {
  try {
    const collections = db && await db.listCollections().toArray();
    for (let i = 0; i < collections.length; i += 1) {
      const collectionFromList = collections[i];
      const collectionName = collectionFromList && collectionFromList.name;
      const collection = collectionName && db.collection(collectionName);
      if (collection) {
        await collection.deleteMany();
      }
    }
    return true;
  } catch (exception) {
    console.warn(exception);
  }
};
export {
  reset_default as default
};
