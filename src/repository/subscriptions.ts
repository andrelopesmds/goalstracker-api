import { SubscriptionModel } from './subscriptions-schema';
import { Subscription } from '../interfaces/subscription.interface';

export const getSubscription = async (endpoint: string): Promise<Subscription> => {
  const subscription: Subscription = await SubscriptionModel.get({ endpoint });
  console.log(`Subscription loaded: ${JSON.stringify(subscription)}`);
  return subscription;
};

export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  const unsubscribedUsersAttribute = 'unsubscribeDate';

  const subscriptions: Subscription[] = await SubscriptionModel.scan().not().contains(unsubscribedUsersAttribute).exec();
  console.log(`Active subscriptions: ${JSON.stringify(subscriptions)}`);

  return subscriptions;
};

export const createSubscription = async (subscription: Subscription): Promise<void> => {
  const subscriptionEntity: Subscription = {
    ...subscription,
    expirationTime: '',
    subscribeDate: new Date().toISOString(),
    unsubscribeDate: '',
  };
  
  await SubscriptionModel.create(subscriptionEntity);
  console.log(`Subscription saved: ${JSON.stringify(subscriptionEntity)}`);
};

export const removeSubscription = async (endpoint: Subscription['endpoint']): Promise<void> => {
  await SubscriptionModel.update(endpoint, {
    unsubscribeDate: new Date().toISOString()
  });

  console.log(`Subscription removed: '${endpoint}`);
};