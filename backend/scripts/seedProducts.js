require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');

const { connectDB } = require('../config/db');
const { Product } = require('../models/Product');
const { Category } = require('../models/Category');

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  try {
    await connectDB();

    const productsPath = path.resolve(__dirname, '..', 'products.json');
    const rawProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const categoryNames = [...new Set(rawProducts.map(product => product.category).filter(Boolean))];
    const categoryIds = new Map();

    for (const name of categoryNames) {
      const category = await Category.findOneAndUpdate(
        { name },
        { $set: { name, slug: slugify(name), isActive: true } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      categoryIds.set(name, category._id);
    }

    const operations = rawProducts.map(product => {
      const {
        id,
        reviews,
        category,
        createdAt,
        updatedAt,
        ...fields
      } = product;

      return {
        updateOne: {
          filter: { sku: product.sku },
          update: {
            $set: {
              ...fields,
              legacyId: id,
              category: categoryIds.get(category),
              reviewCount: reviews
            }
          },
          upsert: true
        }
      };
    });

    const result = await Product.bulkWrite(operations, { ordered: false });
    console.log(JSON.stringify({
      categories: categoryNames.length,
      products: rawProducts.length,
      insertedProducts: result.upsertedCount,
      updatedProducts: result.modifiedCount
    }));
  } catch (err) {
    console.error('Critical database seeding failure:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

seed();
