import { Schema, model } from 'dynamoose';
import { EVENTS_TABLE } from '../constants';
import { Document } from 'dynamoose/dist/Document';
import { Event } from '../interfaces/event.interface';

const eventsSchema = new Schema({
  id: {
    type: String,
    required: true,
    hashKey: true
  },
  homeTeam: {
    type: String,
    required: true,
  },
  homeTeamId: {
    type: String,
  },
  score: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  awayTeamId: {
    type: String,
  },
  timestamp: {
    type: String,
    required: true,
  },
  currentStatus: {
    type: String,
  },
});

interface EventDocument extends Event, Document {}

export const EventModel = model<EventDocument>(EVENTS_TABLE, eventsSchema, {
  create: false
});
