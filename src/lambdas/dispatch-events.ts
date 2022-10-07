import { SubscriptionsRepository } from '../repository/subscriptions';
import { Subscription } from '../interfaces/subscription.interface';
import { PushNotification } from '../interfaces/push-notification.interface';
import { NotificationsRepository } from '../repository/notifications';

export const handler = async (event: any): Promise<void> => {
  if (event.Records[0].eventName !== 'INSERT') {
    console.log(`Event was ignored as it is not a new game event in db. Event: ${JSON.stringify(event)}`);
    return;
  }

  const imageOfEvent = event.Records[0].dynamodb.NewImage;

  const pushNotification = createPushNotification(imageOfEvent);
  const teamsIds = getTeamsIds(imageOfEvent);

  console.log(`TeamsIds: ${JSON.stringify(teamsIds)}`);
  console.log(`Notification that will be sent: ${JSON.stringify(pushNotification)}`);

  const subscriptionsRepository = new SubscriptionsRepository()
  const subscriptions = await subscriptionsRepository.getActiveSubscriptions();

  const filteredSubscriptions = filterSubscriptionsByTeamsIds(subscriptions, teamsIds);

  const results = await sendMessages(pushNotification, filteredSubscriptions);

  console.log(`Job done. Results: ${JSON.stringify(results)}`);
};

const sendMessages = async (pushNotification: PushNotification, filteredSubscriptions: Subscription[]) => {
  const notificationsRepository = new NotificationsRepository()
  return await Promise.all(
    filteredSubscriptions.map(async (subscription) => notificationsRepository.publishMessage(pushNotification, subscription))
  );
};

const createPushNotification = (imageOfEvent: { homeTeam: { S: string; }; awayTeam: { S: string; }; score: { S: string; }; }): PushNotification => {
  const homeTeam = imageOfEvent.homeTeam.S;
  const awayTeam = imageOfEvent.awayTeam.S;
  const score = imageOfEvent.score.S;

  const title = score.includes('0 x 0') ? 'The match has just started' : 'Goal';

  return {
    title,
    body: `${homeTeam} ${score} ${awayTeam}`,
  };
};

const getTeamsIds = (imageOfEvent: { homeTeamId: { S: any; }; awayTeamId: { S: any; }; }): string[] => {
  const idsList: string[] = [];

  if (imageOfEvent.homeTeamId) {
    idsList.push(imageOfEvent.homeTeamId.S);
  }
  if (imageOfEvent.awayTeamId) {
    idsList.push(imageOfEvent.awayTeamId.S);
  }

  return idsList;
};

const filterSubscriptionsByTeamsIds = (subscriptions: Subscription[], idsList: string[]): Subscription[] => {
  const filteredSubscriptions: Subscription[] = [];

  subscriptions.forEach((subscription) => {
    let containId = false;
    const subscriptionIdsList = subscription.teamsIds.split(',');

    subscriptionIdsList.forEach((subscriptionId) => {
      idsList.forEach((id) => {
        if (subscriptionId === id) {
          containId = true;
        }
      });
    });

    if (containId) {
      filteredSubscriptions.push(subscription);
    }
  });

  return filteredSubscriptions;
};