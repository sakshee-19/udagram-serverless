import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'
import { JwtToken } from '../../auth/jwtToken'
import { verify } from 'jsonwebtoken'
import * as middy from 'middy'
//  will read cache from secretsManager
import { secretsManager } from 'middy/middlewares'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

// now middy stores secret in its context
export const handler = middy( async (authEvent: CustomAuthorizerEvent, context) : Promise<CustomAuthorizerResult> => {
    console.log("authorisation")
    console.log("processing authorisation", JSON.stringify(authEvent))
    try{
        console.log("context ",context)
        const decodedToken =  processToken(
            authEvent.authorizationToken,
            context.AUTH0_SECRET[secretField]
            )
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
    

})

function processToken(authToken: string, secret: string) : JwtToken{
    console.log("secret passed ",secret)
    if(!authToken)
        throw new Error("authorization token is not there")
    if(!authToken.toLocaleLowerCase().startsWith("bearer "))
        throw new Error("authorization not bearer")

    const spiltToken = authToken.split(' ');
    
    return verify(spiltToken[1], secret) as JwtToken

}

handler.use(
    secretsManager({
        cache: true,
        cacheExpiryInMillis: 6000,
        throwOnFailedCall: true,
        secrets: {
            AUTH0_SECRET: secretId
        } 

    })
)