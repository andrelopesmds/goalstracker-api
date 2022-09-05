import * as webpush from 'web-push';
import { removeSubscription } from '../repository/subscriptions';
import { WEB_PUSH_PRIVATE_KEY, WEB_PUSH_PUBLIC_KEY} from '../constants';
import { SnsMessage } from '../interfaces/sns-message.interface';

export const handler = async (event: any) => {
  const message: SnsMessage = JSON.parse(event.Records[0].Sns.Message);
  console.log(`Message received: ${JSON.stringify(message)}`);

  const { subscription, pushNotification } = message;
  
  const payload = JSON.stringify(pushNotification);

  try {
    webpush.setVapidDetails(
      'mailto:xxx@gmail.com',
      WEB_PUSH_PUBLIC_KEY,
      WEB_PUSH_PRIVATE_KEY
    );

    const result = await webpush.sendNotification(subscription, payload);
    console.log(`Message sent: ${JSON.stringify(result)}`);
  } catch (error) {
    console.log(`Error when sending the message: ${JSON.stringify(error)}`);

    if (error && (error as { statusCode: number }).statusCode === 410) {
      await removeSubscription(subscription.endpoint);
      console.log('User unsubscribed!');
    } else {
      throw error;
    }
  }
};
