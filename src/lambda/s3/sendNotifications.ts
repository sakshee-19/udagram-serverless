import {S3Event, S3Handler} from 'aws-lambda'
import 'source-map-support'
import * as AWS from 'aws-sdk'

const apiId = process.env.API_ID
const stage = process.env.STAGE
const connectionTable = process.env.CONNECTION_TABLE

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.ap-south-1.amazonaws.com/${stage}`
}
const docClient = new AWS.DynamoDB.DocumentClient();

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

// for this to connect to lambda add func without event in serverless.yaml the add permission and notif config
export const handler: S3Handler = async(event: S3Event) => { // while upload to s3 bucket it should hit here
    //S3Event have list of records

    for(const record of event.Records) {
        const key = record.s3.object.key;
        console.log("Processing S3 item with key ",key);
    

    const connections = await docClient.scan({
        TableName: connectionTable
    }).promise()

    const payload = {
        imageId: key
    }

    for(const connection of connections.Items) {
        const connectionId = connection.id;
        await sendMessageToClient(connectionId, payload)
    }
}
}

async function sendMessageToClient(connectionId, payload) {
    try{
        console.log("sending notification to connection ",connectionId);
        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload)
        }).promise()

    } catch (e){
        console.log("Failed to send message ", JSON.stringify(e));
        if(e.statusCode == 412) {
            console.log("stale connection")

            await docClient.delete({
                TableName: connectionTable,
                Key: {
                    id: connectionId
                } 
            }).promise()
        }
    }
}