const Role = require('./Role');
const User = require('./User');
const Sale = require('./Sale');

class ModelManager {
  constructor() {
    this.models = {
      Role: null,
      User: null,
      Sale: null
    };
  }

  async initialize() {
    // Initialize all models
    this.models.Role = await Role.initialize();
    this.models.User = await User.initialize();
    this.models.Sale = await Sale.initialize();

    // Setup associations
    User.associate(this.models);
    Sale.associate(this.models);

    console.log('✓ All models initialized successfully');
    return this.models;
  }

  getModels() {
    return this.models;
  }

  getModel(modelName) {
    return this.models[modelName];
  }
}

const modelManager = new ModelManager();

module.exports = modelManager;