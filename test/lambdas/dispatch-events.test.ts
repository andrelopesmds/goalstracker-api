import { mocked } from 'jest-mock';

import { handler } from '../../src/lambdas/dispatch-events';
import { getActiveSubscriptions } from '../../src/repository/subscriptions';
import { Subscription } from '../../src/interfaces/subscription.interface';
import { DynamoDBRecordEventName } from '../../src/enums/dynamoDBRecordEventName';
import { DynamoDBStreamEvent } from 'aws-lambda';
import * as callPushHandler from '../../src/helper'
import { PublishCommandOutput } from '@aws-sdk/client-sns';

jest.mock('../../src/helper');
const helperMocked = mocked(callPushHandler, true);

jest.mock('../../src/repository/subscriptions');
const getActiveSubscriptionsMock = mocked(getActiveSubscriptions, true);

const getMockedNewEvent = (eventName: DynamoDBRecordEventName | undefined): DynamoDBStreamEvent => {
  return {
    Records: [{
      eventName,
      dynamodb: {
        NewImage: {
          homeTeam: {
            S: 'homeTeam mock'
          },
          homeTeamId: {
            S: '13'
          },
          awayTeam: {
            S: 'awayTeam mock'
          },
          score: {
            S: 'score mock'
          }
        }
      }
    }]
  };
};

const activeSubscriptionsMock: Subscription = {
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

const publishCommandOutputMock: PublishCommandOutput = {
  '$metadata': {},
  MessageId: '4f99e489-93df-554b-b967-bedf07f16127',
  SequenceNumber: undefined
}

describe('Dispatch events lambda', () => {
  test.each([
    DynamoDBRecordEventName.MODIFY,
    DynamoDBRecordEventName.REMOVE,
    undefined
  ])('Should not publish to sns topic in case it is a %p event', async (eventName) => {
    const event = getMockedNewEvent(eventName);

    await handler(event);

    expect(helperMocked.callPushHandler).not.toHaveBeenCalled();
  });

  it('Should publish to sns topic', async () => {
    getActiveSubscriptionsMock.mockImplementationOnce(async () => [ activeSubscriptionsMock ]);
    helperMocked.callPushHandler.mockImplementation(async () => publishCommandOutputMock)

    const event = getMockedNewEvent(DynamoDBRecordEventName.INSERT)

    await handler(event);

    expect(helperMocked.callPushHandler).toHaveBeenCalledWith(
      {
        body: 'homeTeam mock score mock awayTeam mock',
        title: 'Goal'
      },
      activeSubscriptionsMock
    )
  });
});
