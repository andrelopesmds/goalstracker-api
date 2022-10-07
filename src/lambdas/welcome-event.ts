import { PushNotification } from '../interfaces/push-notification.interface';
import { DynamoDBRecordEventName } from '../enums/dynamoDBRecordEventName';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { NotificationsRepository } from '../repository/notifications';

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  if (event.Records[0].eventName !== DynamoDBRecordEventName.INSERT) {
    console.log(`Event was ignored as it is not a new subscription in db. Event: ${JSON.stringify(event)}`);
    return;
  }

  const subscription = createSubscriptionsObject(event);

  const welcomePushNotification = createWelcomePushNotification();

  const notificationsRepository = new NotificationsRepository()
  await notificationsRepository.publishMessage(welcomePushNotification, subscription);
};

const createSubscriptionsObject = (event: any): { endpoint: string, keys: { auth: string, p256dh: string }} => {
  try {
    const imageOfEvent = event.Records[0].dynamodb.NewImage;
    return {
      endpoint: imageOfEvent.endpoint.S,
      keys: {
        auth: imageOfEvent.keys.M.auth.S,
        p256dh: imageOfEvent.keys.M.p256dh.S,
      },
    };

  } catch (error) {
    throw new Error(`Error processing dynamodb event: ${JSON.stringify(event)}. Error: ${JSON.stringify(error)}`);
  }
};

const createWelcomePushNotification = (): PushNotification => {
  return {
    title: 'Welcome to Goalstracker!',
    body: 'You are now following your favorite team(s)!',
  };
};