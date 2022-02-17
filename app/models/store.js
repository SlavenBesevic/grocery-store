const mongoose = require('mongoose');

const { Schema } = mongoose;

const storeType = ['office', 'store'];

const StoreSchema = new Schema({
  name: { type: String, trim: true, required: true },
  type: { type: String, enum: storeType, required: true },
  parent: { ref: 'Store', type: mongoose.Schema.ObjectId },
  ancestors: [{ ref: 'Store', type: mongoose.Schema.ObjectId }],
}, {
  timestamps: true,
});

StoreSchema.pre('save', async function (next) {
  if (this.parent) {
    const { ancestors } = await Store.findOne({ _id: this.parent }).lean();
    ancestors.push(this.parent)
    this.ancestors = ancestors;
  }
  next();
});

const Store = mongoose.model('Store', StoreSchema);

module.exports = {
  Store,
  storeType,
};
