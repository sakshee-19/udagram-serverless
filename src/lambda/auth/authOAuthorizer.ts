import {CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'
import { JwtToken } from '../../auth/jwtToken'
import { verify } from 'jsonwebtoken'
import * as AWS from 'aws-sdk'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const client = new AWS.SecretsManager()

let cachedSecret: string

export const handler: CustomAuthorizerHandler = async (authEvent: CustomAuthorizerEvent) : Promise<CustomAuthorizerResult> => {
    console.log("authorisation")
    console.log("processing authorisation", JSON.stringify(authEvent))
    try{
        const decodedToken = await processToken(authEvent.authorizationToken)
        const id = decodedToken.sub

        console.log("user is authorized");

        return {
            principalId: id,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }

    }catch(e){

        console.log("user is not authorized", e.message);
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }

    }
    

}

async function processToken(authToken: string) : Promise<JwtToken>{
    if(!authToken)
        throw new Error("authorization token is not there")
    if(!authToken.toLocaleLowerCase().startsWith("bearer "))
        throw new Error("authorization not bearer")

    const spiltToken = authToken.split(' ');

    const secretObject = await getSecret()

    const secret = secretObject[secretField]
    
    return verify(spiltToken[1], secret) as JwtToken

}

//  read secret from secret Manager
async function getSecret() {
    if(cachedSecret) return cachedSecret

    const data = await client.getSecretValue({
        SecretId: secretId
    }).promise()

    cachedSecret = data.SecretString
    return JSON.parse(cachedSecret)
}