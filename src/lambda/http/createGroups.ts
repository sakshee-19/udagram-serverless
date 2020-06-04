import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid';
import { getUserId } from '../../auth/utils';

const docClient = new AWS.DynamoDB.DocumentClient();

const table = process.env.GROUPS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    console.log("processing event ", event);
    const id = uuid.v4();

    const authorisation = event.headers.Authorisation
    const split = authorisation.split(" ")
    const jwtToken = split[1]

    const item = {
        id: id,
        userId: getUserId(jwtToken),
        ...JSON.parse(event.body)
    }

    await docClient.put({
        TableName: table,
        Item: item
    }).promise();

    // const items = results.Items;

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item
        })
    }
}