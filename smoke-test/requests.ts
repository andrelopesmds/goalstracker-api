import https = require('https')

import { SubscriptionEventBody } from '../src/event-validation';

interface Response {
  statusCode: number,
  headers: any,
  body: any
}

export async function getRequest(url: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    https.get(url, (res: any) => {
      let data: any = []
    
      res.on('data', (chunk: any) => {
        data.push(chunk)
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(Buffer.concat(data).toString())
        })
      })
    
    }).on('error', (error: any) => {
      reject(error)
    });
  })
}

export async function postRequest(hostname: string, path: string, teamId: string): Promise<Response> {
  const bodyObj: SubscriptionEventBody = {
    subscription: {
      endpoint: 'https://mocked',
      keys: {
        p256dh: 'mocked',
        auth: 'mocked'
      }
    },
    teamsIds: [ teamId ]
  }
  const body = JSON.stringify(bodyObj)
  const options = {
    hostname,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    },
    body
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res: any) => {
      let data: any = []
    
      res.on('data', (chunk: any) => {
        data.push(chunk)
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(Buffer.concat(data).toString())
        })
      })
    
    }).on('error', (error: any) => {
      console.log('error', error)
      reject(error)
    });

    req.write(body)
    req.end()
  })
}
