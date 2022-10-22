import { APIGatewayProxyResult } from 'aws-lambda';
import { SubscriptionsRepository } from '../repository/subscriptions';
import { getSuccessfulResponse, getBadRequestResponse } from '../helper';
import { validateSubscriptionEventBody } from '../event-validation';
import { TeamsRepository } from '../repository/teams'


export const handler = async (event: { body: string; }): Promise<APIGatewayProxyResult> => {
  console.log('Body: ', event.body)

  const { parsedBody, isBodyValid } = validateSubscriptionEventBody(event.body)

  if(!isBodyValid) {
    return getBadRequestResponse('Invalid body')
  }
 
  const { subscription, teamsIds } = parsedBody

  if(!subscription.endpoint.includes('https')) {
    return getBadRequestResponse('Endpoint must use https')
  }

  const teamsRepository = new TeamsRepository()
  const allTeamsIds = await teamsRepository.getAllTeamsIds()

  if(!teamsIdsAreValid(allTeamsIds, teamsIds)) {
    return getBadRequestResponse('TeamsIds is not valid')
  }

  const subscriptionsRepository = new SubscriptionsRepository()
  await subscriptionsRepository.createSubscription({
    ...subscription,
    teamsIds: teamsIds.toString(), // TODO - save it as array
    subscribeDate: new Date().toISOString()
  });

  // TODO - return 201
  return getSuccessfulResponse(JSON.stringify({
    message: 'User subscribed!',
  }))
};

function teamsIdsAreValid(allTeamsIds: string[], teamsIds: string[]): boolean {
  return teamsIds.every(teamId => allTeamsIds.includes(teamId))
}
