import { SNSClient, PublishCommand, PublishCommandOutput } from '@aws-sdk/client-sns';
import { NOTIFICATIONS_TOPIC_ARN } from './constants';
import { PushNotification } from './interfaces/push-notification.interface';
import { SnsMessage } from './interfaces/sns-message.interface';

const sns = new SNSClient({});

export const callPushHandler = async (pushNotification: PushNotification, subscription: { endpoint: string, keys: { auth: string, p256dh: string }}): Promise<PublishCommandOutput> => {
  const message: SnsMessage = {
    pushNotification,
    subscription
  };

  const res = await sns.send(new PublishCommand({
    Message: JSON.stringify(message),
    TopicArn: NOTIFICATIONS_TOPIC_ARN,
  }));

  console.log(`Message sent: ${JSON.stringify(message)}`);

  console.log(res);
  return res;
};