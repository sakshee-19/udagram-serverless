import {DynamoDBStreamEvent, DynamoDBStreamHandler} from 'aws-lambda'
import 'source-map-support/register'


export const handler:DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    console.log("processing elasticsearc even" ,event);
    for(const record of event.Records) {
        console.log('Processing Record '+JSON.stringify(record))
    }
}
