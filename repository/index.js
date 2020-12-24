class Repository {
  constructor(monogoClient) {
    this.monogoClient = monogoClient;
  }

  async getWordCount(word) {
    try {
      const doc = await this.monogoClient.findOne({ _id: word });
      return doc === null ? 0 : doc.count;
    } catch (error) {
      throw error;  
    }
  }

  async bulkUpsert(words, callback) {
    const ops = words.map(w => ({
      updateOne: {
        filter: { _id: w },
        update: { $inc: { count: 1 }, $set: { _id: w } },
        new: true, 
        upsert: true
      },
    }));

    const isCallback = typeof callback === 'function';
    
    try {
      const resp = await this.monogoClient.bulkWrite(ops);
      return isCallback ? callback(null, resp) : resp;
      
    } catch (error) {
      if (isCallback) {
        return callback(error);
      }

      throw error;
    }
  }
}

function repositoryFactory({ mongoClient }) {
  return new Repository(mongoClient);
}

module.exports = { repositoryFactory };