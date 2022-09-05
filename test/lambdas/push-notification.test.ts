import { mocked } from 'jest-mock';

import { handler } from '../../src/lambdas/push-notification'
import * as webpush from 'web-push';
import { PushNotification } from '../../src/interfaces/push-notification.interface';

jest.mock('web-push')
const webPushMock = mocked(webpush, true)

const activeSubscriptionsMock = {
  endpoint: 'endpoint mock',
  expirationTime: 'mock',
  keys: {
    p256dh: 'mock',
    auth: 'mock'
  },
  subscribeDate: 'mock',
  unsubscribeDate: 'mock',
  teamsIds: '13'
}

const pushNotificationMock: PushNotification = {
  title: 'mock title',
  body: 'mock body'
}


describe('Push notification lambda', () => {
  it('Should send a push notification', async () => {
    webPushMock.setVapidDetails.mockImplementationOnce(() => Promise.resolve())

    await handler({
      Records: [
        {
          Sns: {
            Message: JSON.stringify({
              subscription: activeSubscriptionsMock,
              pushNotification: pushNotificationMock
            })
          }
        }
      ]
    })

    expect(webpush.sendNotification).toHaveBeenCalledWith(activeSubscriptionsMock, JSON.stringify(pushNotificationMock))
  });
});
