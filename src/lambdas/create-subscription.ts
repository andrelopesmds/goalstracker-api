import { APIGatewayProxyResult } from 'aws-lambda';
import { SubscriptionsRepository } from '../repository/subscriptions';
import { ORIGIN } from '../constants';
import { Subscription } from '../interfaces/subscription.interface';

interface SubscriptionEventBody {
  subscription: Subscription,
  teamsIds: string[]
}

export const handler = async (event: { body: string; }): Promise<APIGatewayProxyResult> => {
  const body: SubscriptionEventBody = JSON.parse(event.body);

  const { subscription, teamsIds } = body;
  
  validateInput(subscription, teamsIds);

  subscription.teamsIds = teamsIds.toString();

  const subscriptionsRepository = new SubscriptionsRepository()
  await subscriptionsRepository.createSubscription(subscription);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': ORIGIN,
    },
    body: JSON.stringify({
      message: 'User subscribed!',
    })
  };
};

const validateInput = (subscription: Subscription, teamsIds: string[]): void => {
  // todo - do type checking
  if (!isSubscriptionValid(subscription)) {
    throw new Error('Subscription is not valid');
  }

  if (!teamsIds || !(teamsIds.length > 0)) { // todo - get available ids from db and compare
    throw new Error('TeamsIds is not valid');
  }
};

const isSubscriptionValid = (subscription: Subscription) => {
  if (!hasProperties(subscription, ['endpoint', 'keys']) || !hasProperties(subscription.keys, ['p256dh', 'auth'])) {
    return false;
  }

  if (!subscription.endpoint.includes('https')) {
    return false;
  }

  return true;
};

const hasProperties = (obj: any, propertiesList: string[]) => propertiesList.every((property) => Object.prototype.hasOwnProperty.call(obj, property));
