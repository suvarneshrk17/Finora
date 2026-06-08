import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  await dropObsoleteCustomerEmailIndex();
  console.log(`MongoDB connected: ${connection.connection.host}`);
}

export async function disconnectDB() {
  await mongoose.connection.close();
}

async function dropObsoleteCustomerEmailIndex() {
  const { default: Customer } = await import('../models/Customer.js');
  const indexes = await Customer.collection.indexes();
  const obsoleteEmailIndex = indexes.find((index) => index.name === 'email_1');

  if (obsoleteEmailIndex) {
    await Customer.collection.dropIndex('email_1');
    console.log('Dropped obsolete customer email unique index');
  }
}
