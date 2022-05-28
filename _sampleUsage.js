import Store from 'jstor';
import StrategyDynamoDB from './jstor-dynamodb.js';

//set credentials through the credentials parameters
//OR use the environment variables
//AWS_ACCESS_KEY_ID
//AWS_SECRET_ACCESS_KEY
//Region can be set through environment variables as well
//AWS_DEFAULT_REGION
const credentials = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_KEY_SECRET
}

export const store = new Store({
    strategy: StrategyDynamoDB({
        table: 'jstor-dynamodb-test',
        region: 'eu-west-1',
        credentials,
        cacheOptions: {
            files: {
                maxAge: 1 //only store documents 1 second in memory
            }
        }
    })
});