import {CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult} from 'aws-lambda'
import {verify } from 'jsonwebtoken'
import { readFileSync } from 'fs';
import { JwtToken } from '../../auth/jwtToken';

export const handler:CustomAuthorizerHandler = async(event : CustomAuthorizerEvent) : Promise<CustomAuthorizerResult> => {
    console.log("processing rsa event ", event);
    try {
        const token = getToken(event)
        const res = await verfiyToken(token)
        return {
            principalId: res.sub,
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

    } catch (e){
        console.log("auth not varified ", e.message)
        return  {
            principalId: 'undefined',
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
return    

}

async function verfiyToken(token: string): Promise<JwtToken> {
    var cert = readFileSync('public.pem');  // get public key
    const res = await verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
    return res
}

function getToken( event:CustomAuthorizerEvent) {
    const authorization = event.authorizationToken
    if(!authorization.startsWith('Bearer'))
        throw new Error("auth token is not valid")
    const splits = authorization.split(" ")
    if(splits.length != 2)
        throw new Error("auth token is not valid")
    const token = splits[1]
    return token
}