import Ajv from 'ajv';

const ajv = new Ajv()

export interface SubscriptionEventBody {
  subscription: {
    endpoint: string,
    expirationTime? : string,
    keys: {
      p256dh: string,
      auth: string
    }
  },
  teamsIds: string[]
}

const subscriptionEventBodySchema = {
  type: 'object',
  properties: {
    subscription: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string'
        },
        expirationTime: {
          type: 'string'
        },
        keys: {
          type: 'object',
          properties: {
            p256dh: {
              type: 'string'
            },
            auth: {
              type: 'string'
            }
          },
          required: ['p256dh', 'auth']
        }
      },
      required: ['endpoint', 'keys']
    },
    teamsIds: {
      type: 'array',
      items: {
        type: 'string'
      },
      minItems: 1,
      uniqueItems: true
    }
  },
  required: ['subscription', 'teamsIds']
}

export function validateSubscriptionEventBody(body: string): { isBodyValid: boolean, parsedBody: SubscriptionEventBody } {
  let isBodyValid = false
  let parsedBody

  try {
    parsedBody = JSON.parse(body)
  } catch (err) {
    console.log('Could not parse body: ', body)

    return {
      isBodyValid,
      parsedBody
    }
  }
  
  const validate = ajv.compile<SubscriptionEventBody>(subscriptionEventBodySchema)
  
  isBodyValid = validate(parsedBody)

  if(!isBodyValid) {
    console.log('validate errors', validate.errors)
  }

  return {
    isBodyValid,
    parsedBody
  }
}
