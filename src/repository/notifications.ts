import { PublishCommand, PublishCommandOutput } from '@aws-sdk/client-sns';
import { NOTIFICATIONS_TOPIC_ARN } from "../constants"
import { SnsMessage } from "../interfaces/sns-message.interface";
import { PushNotification } from "../interfaces/push-notification.interface";
import { SNS } from './sns';

interface PublishMessageInterface {
  endpoint: string,
  keys: {
    auth: string, 
    p256dh: string
  }
}

export class NotificationsRepository extends SNS {
  topicArn: string
  
  constructor() {
    super()

    this.topicArn = NOTIFICATIONS_TOPIC_ARN
  }

  async publishMessage (pushNotification: PushNotification, subscription: PublishMessageInterface): Promise<PublishCommandOutput> {
    const message: SnsMessage = {
      pushNotification,
      subscription
    };
  
    const response = await this.snsClient.send(new PublishCommand({
      Message: JSON.stringify(message),
      TopicArn: this.topicArn,
    }));
  
    console.log(`Message sent: ${JSON.stringify(message)}`);
  
    console.log(response);
    return response;
  }
}
