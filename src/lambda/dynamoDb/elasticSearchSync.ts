import {DynamoDBStreamEvent, DynamoDBStreamHandler} from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAWSEs from 'http-aws-es'

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAWSEs
})


export const handler:DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    console.log("processing elasticsearch even" ,event);
    for(const record of event.Records) {
        console.log('Processing Record '+JSON.stringify(record))
        if(record.eventName !== "INSERT"){
            continue
        }

        const newItem = record.dynamodb.NewImage

        const imageId = newItem.imageId.S
        const body = {
            imageId: newItem.imageId.S,
            groupId: newItem.groupId.S,
            imageUrl: newItem.imageUrl.S,
            title: newItem.title.S,
            timestamp: newItem.timestamp.S
        }

        await es.index({    //to upload the document to elastic search
            index: 'images-index',
            type: 'images',
            id: imageId,
            body
        })
    }
}
