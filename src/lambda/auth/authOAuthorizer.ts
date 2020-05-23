import {CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'

export const handler: CustomAuthorizerHandler = async (authEvent: CustomAuthorizerEvent) : Promise<CustomAuthorizerResult> => {
    console.log("authorisation")
    console.log("processing authorisation", JSON.stringify(authEvent))
    try{
        const authToken = authEvent.authorizationToken

        processToken(authToken)

        console.log("user is authorized");

        return {
            principalId: 'user',
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

function processToken(authToken) {
    if(!authToken)
        throw new Error("authorization token is not there")
    if(!authToken.toLocaleLowerCase().startsWith("bearer "))
        throw new Error("authorization not bearer")

    const spiltToken = authToken.split(' ');
    
    if(spiltToken[1]!=="123")
        throw new Error("Not a Valid Token")

}