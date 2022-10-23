import { APIGatewayProxyResult } from 'aws-lambda'
import { ORIGIN } from './constants'

const getResponse = (statusCode: number, body: string): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': ORIGIN,
    },
    body
  }
}

export const getSuccessfulResponse = (body: string) => {
  return getResponse(200, body)
}

export const getCreatedResponse = (body: string) => {
  return getResponse(201, body)
}

export const getBadRequestResponse = (body: string) => {
  return getResponse(400, body)
}
