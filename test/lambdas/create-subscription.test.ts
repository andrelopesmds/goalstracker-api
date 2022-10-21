import { mocked } from 'jest-mock';

import { handler } from '../../src/lambdas/create-subscription';
import { SubscriptionsRepository } from '../../src/repository/subscriptions';
import { APIGatewayProxyResult } from 'aws-lambda';
import { TeamsRepository } from '../../src/repository/teams';

jest.mock('../../src/repository/teams')
const getAllTeamsIdsMock = mocked(TeamsRepository.prototype.getAllTeamsIds)

jest.mock('../../src/repository/subscriptions');
const createSubscriptionMock = mocked(SubscriptionsRepository.prototype.createSubscription);

const validTeamId = '13'

const validBody = {
  teamsIds: [ validTeamId ],
  subscription: {
    endpoint: 'https://mock',
    keys: {
      p256dh: 'mock',
      auth: 'mock'
    }
  }
}

const invalidBodyError = 'Invalid body'

describe('Create subscription successfully', () => {
  let response: APIGatewayProxyResult

  beforeAll(async () => {
    getAllTeamsIdsMock.mockResolvedValue([ validTeamId ])
    createSubscriptionMock.mockResolvedValue()

    const event = {
      body: JSON.stringify(validBody)
    }

    response = await handler(event);
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it.only('Should return 200 status code', () => {
    expect(response.statusCode).toBe(200)
  })

  it('Should return a \'User Subscribed\' message', () => {
    const parsedBody = JSON.parse(response.body)

    expect(parsedBody).toStrictEqual({ message: 'User subscribed!' });
  })

  it('Should save the subscription in DB', () => {
    const expectedDBItem = {
      ...validBody.subscription,
      teamsIds: validBody.teamsIds.toString()
    }

    expect(createSubscriptionMock).toHaveBeenCalledWith(expect.objectContaining(expectedDBItem))
  })
})

describe('Create subscriptions error cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getAllTeamsIdsMock.mockResolvedValue([ validTeamId, '10' ])
  })

  it('Should return a bad request if subscription endpoint is not https', async () => {
    const event = {
      body: JSON.stringify({
        ...validBody,
        subscription: {
          ...validBody.subscription,
          endpoint: 'http://mock'
        }
      })
    }

    const { statusCode, body } = await handler(event)

    expect(statusCode).toBe(400)
    expect(body).toBe('Endpoint must use https')
  });

  it.each([
    null,
    undefined,
    '',
    { test: 'test' }
  ])('Should return a bad request if body is malformed', async (invalidBodyObj: any) => {
    const event = {
      body: JSON.stringify(invalidBodyObj)
    }

    const { statusCode, body } = await handler(event)

    expect(statusCode).toBe(400)
    expect(body).toBe(invalidBodyError)
  });

  it('Should return a bad request if teamsIds is empty', async () => {
    const event = {
      body: JSON.stringify({
        ...validBody,
        teamsIds: [],
    })}

    const { statusCode, body } = await handler(event)

    expect(statusCode).toBe(400)
    expect(body).toBe(invalidBodyError)
  });

  it('Should return a bad request if teamsIds are duplicated', async () => {
    const event = {
      body: JSON.stringify({
        ...validBody,
        teamsIds: ['7', '7'],
    })}

    const { statusCode, body } = await handler(event)

    expect(statusCode).toBe(400)
    expect(body).toBe(invalidBodyError)
  });

  it.each([
    ['invalid'],
    ['99999'],
    [''],
    ['1', '999999'],
    ['1', 'invalid']
  ])('Should return bad request if any of teamsIds is invalid', async (...teamsIds: string[]) => {
    const event = {
      body: JSON.stringify({
        ...validBody,
        teamsIds,
    })}

    const { statusCode, body } = await handler(event)

    expect(statusCode).toBe(400)
    expect(body).toBe(`TeamsIds is not valid`)
  })
});
