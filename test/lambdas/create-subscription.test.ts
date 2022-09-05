import { mocked } from 'jest-mock';

import { handler } from '../../src/lambdas/create-subscription';
import { createSubscription } from '../../src/repository/subscriptions';

jest.mock('../../src/repository/subscriptions');
const createSubscriptionMock = mocked(createSubscription, true);

describe('Create subscriptions lambda', () => {
  it('Should create a subscription successfully', async () => {
    createSubscriptionMock.mockImplementationOnce(() => Promise.resolve())

    const event = {
      body: JSON.stringify({
        teamsIds: [13],
        subscription: {
          endpoint: 'https://mock',
          keys: {
            p256dh: 'mock',
            auth: 'mock'
          }
        }
      })
    }
    const expectedResponseBody = { message: 'User subscribed!' }

    const { statusCode, body } = await handler(event);
    const parsedBody = JSON.parse(body)

    expect(statusCode).toBe(200);
    expect(parsedBody).toStrictEqual(expectedResponseBody);
  });

  it('Should throw an error if subscription is not valid', async () => {
    const expectedErrorMessage = 'Subscription is not valid'

    const event = {
      body: JSON.stringify({
        teamsIds: [13],
        subscription: {
          endpoint: 'mock',
          keys: {
            p256dh: 'mock',
            auth: 'mock'
          }
        }
      })
    }

    await expect(handler(event)).rejects.toThrow(expectedErrorMessage)
  });

  it('Should throw an error if teamsIds are not valid', async () => {
    const expectedErrorMessage = 'TeamsIds is not valid'

    const event = {
      body: JSON.stringify({
        teamsIds: [],
        subscription: {
          endpoint: 'https://mock',
          keys: {
            p256dh: 'mock',
            auth: 'mock'
          }
        }
      })
    }

    await expect(handler(event)).rejects.toThrow(expectedErrorMessage)
  });

});
