import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda';
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient();

const groupTable = process.env.GROUPS_TABLE;
const imageTable = process.env.IMAGES_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    console.log("processing event ", event);

    const groupId = event.pathParameters.groupId;

    const validGroupId = await groupExist(groupId)
    console.log("valid group id", validGroupId)

    if(!validGroupId) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'group id does not exists.'
            })
        }
    }

    const images = await getImages(groupId)

    return {
        statusCode: 200,
        body: JSON.stringify({
            images
        })
    }
}

async function groupExist(groupId){
    const result = await docClient.get({
        TableName: groupTable,
        Key: {
            id: groupId
        }
    }).promise()
    // if(!result.Item){
    //     return false

    // } else {
    //     return true
    // }
    return !!result.Item
}

async function getImages(groupId) {
    const result = await docClient.query({
        TableName: imageTable,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
            ':groupId': groupId
        },
        ScanIndexForward: false
    }).promise()
    return result.Items
}