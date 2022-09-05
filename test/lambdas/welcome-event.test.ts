import { mocked } from 'jest-mock';

import { handler } from '../../src/lambdas/welcome-event';
import * as callPushHandler from '../../src/helper';
import { DynamoDBRecordEventName } from '../../src/enums/dynamoDBRecordEventName';
import { DynamoDBStreamEvent } from 'aws-lambda';

jest.mock('../../src/helper');
const helperMocked = mocked(callPushHandler, true);

const getMockedNewSubscriptionEvent = (eventName: DynamoDBRecordEventName | undefined): DynamoDBStreamEvent => {
  return {
    Records: [{
      eventName,
      dynamodb: {
        NewImage: {
          endpoint: {
            S: 'endpoint mock'
          },
          keys: {
            M: {
              auth: {
                S: 'auth mock'
              },
              p256dh: {
                S: 'p256dh mock'
              }
            }
          }
        }
      }
    }]
  };
};

describe('Welcome event', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should publish to sns topic in case it is an \'INSERT\' event', async () => {
    const event = getMockedNewSubscriptionEvent(DynamoDBRecordEventName.INSERT);

    const expectedPushNotification = {
      title: 'Welcome to Goalstracker!',
      body: 'You are now following your favorite team(s)!'
    };

    const expectedSubscription = {
      endpoint: 'endpoint mock',
      keys: {
        auth: 'auth mock',
        p256dh: 'p256dh mock'
      }
    };

    await handler(event);

    expect(helperMocked.callPushHandler).toHaveBeenCalledWith(
      expectedPushNotification,
      expectedSubscription
    );
  });

  test.each([
    DynamoDBRecordEventName.MODIFY,
    DynamoDBRecordEventName.REMOVE,
    undefined
  ])('Should not publish to sns topic in case it is a %p event', async (eventName) => {
    const event = getMockedNewSubscriptionEvent(eventName);

    await handler(event);

    expect(helperMocked.callPushHandler).not.toHaveBeenCalled();
  });
});
