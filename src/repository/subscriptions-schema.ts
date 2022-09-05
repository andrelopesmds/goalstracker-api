import { Schema, model } from 'dynamoose';
import { SUBSCRIPTIONS_TABLE } from '../constants';
import { Subscription } from '../interfaces/subscription.interface';
import { Document } from 'dynamoose/dist/Document';

const subscriptionsSchema = new Schema({
  endpoint: {
    type: String,
    required: true,
    hashKey: true,
  },
  expirationTime: {
    type: String,
    required: false,
  },
  keys: {
    type: Object,
    schema: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
  },
  subscribeDate: {
    type: String,
    required: true,
  },
  unsubscribeDate: {
    type: String,
    required: false,
  },
  teamsIds: {
    type: String,
    required: true,
  },
});

interface SubscriptionDocument extends Subscription, Document {}

export const SubscriptionModel = model<SubscriptionDocument>(SUBSCRIPTIONS_TABLE, subscriptionsSchema, {
  create: false
});