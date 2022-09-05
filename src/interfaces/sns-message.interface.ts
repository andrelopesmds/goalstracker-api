import { PushNotification } from './push-notification.interface';

export interface SnsMessage {
  pushNotification: PushNotification,
  subscription: {
    endpoint: string,
    keys: {
      auth: string,
      p256dh: string
    }
  }
}
