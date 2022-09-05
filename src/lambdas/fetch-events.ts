import { getEvents, saveEventsList } from '../repository/events';
import { getTeams } from '../repository/teams';
import { Team } from '../interfaces/team.interface';
import { Event } from '../interfaces/event.interface';
import { v4 as uuidv4 } from 'uuid';
import { getLiveEvents } from '../get-live-events';

const MINUTESTOTRACK = 60 * 24;

export const handler = async (): Promise<void> => {
  const teams = await getTeams();

  const allMatches = await runApi();

  const filteredMatches = filterMatchesOfSupportedTeams(allMatches, teams);
  console.log(`Filtered matches: ${JSON.stringify(filteredMatches)}`);

  if (filteredMatches.length > 0) {
    const recentlySavedEvents = await getEvents(MINUTESTOTRACK);

    const notSavedEvents = filterNotSavedEvents(filteredMatches, recentlySavedEvents);

    if (notSavedEvents && notSavedEvents.length > 0) {
      console.log(`Events list will be saved: ${JSON.stringify(notSavedEvents)}`);
      await saveEventsList(notSavedEvents);
    }
  }

  console.log('Operation concluded');
};

const filterNotSavedEvents = (fetchedEvents: Event[], recentlySavedEvents: Event[]) => {
  const notSavedEvents: Event[] = [];
  fetchedEvents.forEach((fetchedEvent: Event) => {
    let isNew = true;

    recentlySavedEvents.forEach((recentlySavedEvent: Event) => {
      if (isEqual(fetchedEvent, recentlySavedEvent)) {
        isNew = false;
      }
    });

    if (isNew) {
      notSavedEvents.push(fetchedEvent);
    }
  });

  return notSavedEvents;
};

const isEqual = (event1: Event, event2: Event) => event1.score === event2.score && event1.homeTeam === event2.homeTeam && event1.awayTeam === event2.awayTeam;

const filterMatchesOfSupportedTeams = (allMatches: Event[], teams: Team[]): Event[] => {
  return allMatches.flatMap(match => {
    teams.forEach((team) => {
      if (match.homeTeam === team.name) {
        match.homeTeamId = team.id;
      }

      if (match.awayTeam === team.name) {
        match.awayTeamId = team.id;
      }
    });

    return match.awayTeamId || match.homeTeamId ? match : [];
  });
};

const runApi = async (): Promise<Event[]> => {
  const allMatches = await getLiveEvents()

  return allMatches.map(match => ({
    homeTeam: match['Home Team'],
    awayTeam: match['Away Team'],
    score: `${ match['Home Score'] } x ${ match['Away Score'] }`,
    id: uuidv4()
  }))
};
