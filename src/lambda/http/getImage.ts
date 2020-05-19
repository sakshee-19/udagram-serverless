import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();

const imageIndex = process.env.IMAGES_INDEX;
const imageTable = process.env.IMAGES_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    console.log("processing event ", event);

    const imageId = event.pathParameters.imageId;

    const results = await getImages(imageId)

    if(results.Count <= 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'immge id does not exists.'
            })
        }
    }
    console.log(results)


    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(results.Items[0])
    }
}

async function getImages(imageId) {
    const result = await docClient.query({
        TableName: imageTable,
        IndexName: imageIndex,
        KeyConditionExpression: 'imageId = :imageId',
        ExpressionAttributeValues: {
            ':imageId': imageId
        }
    }).promise()
    return result
}