import { EventModel } from './events-schema';
import { Event } from '../interfaces/event.interface';

export const getEvents = async (minutesToTrack: number): Promise<Event[]> => {
  const timestamp = (new Date((new Date().getTime()) - minutesToTrack * 60000)).toISOString();

  const events: Event[] = await EventModel.scan().filter('timestamp').gt(timestamp).exec();
  console.log(`Events loaded: ${JSON.stringify(events)}`);

  return events;
};

export const saveEventsList = async (events: Event[]) => {
  const eventsWithDefaults = events.map(event => {
    return {
      ...event,
      timestamp: new Date().toISOString(),
      homeTeamId: event.homeTeamId ?? '',
      awayTeamId: event.awayTeamId ?? '',
      currentStatus: event.score.includes('0 x 0') ? 'Game started' : 'Goal'
    };
  });

  console.log(`Events will be saved: ${JSON.stringify(eventsWithDefaults)}`);
  await EventModel.batchPut(eventsWithDefaults);
};