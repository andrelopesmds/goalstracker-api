export interface Subscription {
  endpoint: string,
  expirationTime? : string,
  keys: {
    p256dh: string,
    auth: string
  },
  subscribeDate: string,
  unsubscribeDate? : string,
  teamsIds: string
}
