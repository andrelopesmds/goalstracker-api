import { Team } from '../src/interfaces/team.interface'
import { Environment } from '../cdk/environment'
import { getRequest, postRequest } from './requests'


async function assertGetTeams(apiUrl: string, websiteUrl: string): Promise<string> {
  console.log('assertGetTeams logs ...')

  const { statusCode, headers, body } = await getRequest(`${ apiUrl }/teams`)
  
  console.log('statusCode', statusCode)
  console.log('headers', headers)
  console.log('body', body)

  if(statusCode !== 200) {
    throw new Error(`Get teams failed with non 200 status code: ${ statusCode }`)
  }

  if(headers['content-type'] !== 'application/json') {
    throw new Error('Missing header \'Content-type\':\'application/json\'')
  }

  if(headers['access-control-allow-origin'] !== websiteUrl) {
    throw new Error(`Missing header \'access-control-allow-origin\': '${ websiteUrl }'`)
  }

  if(!body.teams) {
    throw new Error('Missing teams')
  }

  const { teams } = body

  if(!(Array.isArray(teams) && teams.length)) {
    throw new Error('Teams is not a non-empty array')
  }

  teams.forEach((team: Team) => {
    const requiredAttributes = ['id', 'name', 'country'] as (keyof Team)[]

    requiredAttributes.forEach((attribute) => {
     if(!team[attribute]) {
       throw new Error(`Team ${ attribute } is missing`)
     }
    })
  });

  return teams[0].id
}

async function assertPostSubscription(apiUrl: string, websiteUrl: string, teamId: string): Promise<void> {
  console.log('assertPostSubscription logs ...')

  const { statusCode, headers, body } = await postRequest(apiUrl, '/subscriptions', teamId)
  console.log('statusCode', statusCode)
  console.log('headers', headers)
  console.log('body', body)

  if(statusCode !== 200) {
    throw new Error(`Post subscription failed with non 200 status code: ${ statusCode }`)
  }

  if(headers['content-type'] !== 'application/json') {
    throw new Error('Missing header \'Content-type\':\'application/json\'')
  }

  if(headers['access-control-allow-origin'] !== websiteUrl) {
    throw new Error(`Missing header \'access-control-allow-origin\': '${ websiteUrl }'`)
  }

  if(body.message !== 'User subscribed!') {
    throw new Error(`Unexpected body response ${ body }`)
  }
}


async function main() {
  try {
    const env = process.env.ENVIRONMENT ?? Environment.DEV

    const apiSubdomain = env === Environment.PROD ? 'api' : 'apidev'
    const siteSubdomain = env === Environment.PROD ? '' : 'dev.'

    const apiUrl = `${ apiSubdomain }.goalstracker.info`
    const websiteUrl = `https://${ siteSubdomain }goalstracker.info`

    const teamId = await assertGetTeams(`https://${ apiUrl }`, websiteUrl)

    await assertPostSubscription(apiUrl, websiteUrl, teamId)

    console.log('Smoke tests completed')
  } catch (err) {
    console.log('Smoke tests failed: ', err)
    process.exit(1)
  }
}

main()
