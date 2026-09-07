const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  legacyId: Number,
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  brand: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: String,
  description: String,
  price: { type: Number, min: 0, required: true },
  discountPrice: { type: Number, min: 0 },
  stock: { type: Number, min: 0, required: true },
  sku: { type: String, required: true, unique: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  images: [String],
  thumbnail: String,
  colors: [String],
  sizes: [String],
  material: String,
  capacity: String,
  weight: String,
  isBestSeller: Boolean,
  isFeatured: Boolean,
  isNewArrival: Boolean,
  isTrending: Boolean,
  freeDelivery: Boolean,
  cashOnDelivery: Boolean,
  returnDays: Number,
  warranty: String,
  tags: [String],
  vendor: String,
  origin: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound text index for advanced full-text search capabilities
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

// Named export at the end to match architectural pattern
module.exports = { Product };
