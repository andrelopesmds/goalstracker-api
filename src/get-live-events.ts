import { SPORTS_LIVE_SCORES_API_KEY } from './constants'

import axios from 'axios'
import { SportsLiveScoresMatch } from './interfaces/sports-live-score-match.interface';

export const getLiveEvents = async (): Promise<SportsLiveScoresMatch[]> => {
  const options = {
    method: 'GET',
    url: 'https://sports-live-scores.p.rapidapi.com/football/live',
    headers: {
      'X-RapidAPI-Key': SPORTS_LIVE_SCORES_API_KEY,
      'X-RapidAPI-Host': 'sports-live-scores.p.rapidapi.com'
    }
  };

  const { data, status } = await axios.request(options)

  if(status < 200 || status > 299) {
    throw new Error(`Failed to get live events from api. Status code: ${ status }`)
  }

  return data.matches as SportsLiveScoresMatch[]
}
