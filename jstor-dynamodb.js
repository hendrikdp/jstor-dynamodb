//documentation on the dynamodb client can be found here:
//https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/index.html
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    BatchGetCommand,
    PutCommand,
    DeleteCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { get } from "lodash-es";


//options can be found here:
//https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/dynamodbclientconfig.html
//to login use the credentials attribute
//{credentials: {accessKeyId, secretAccessKey, expiration, sessionToken}}
export default function(options = {}){

    //ensure table name!
    if(!options.table) throw new Error(`jstor dynamodb: A table name is required to use the dynamodb strategy`);

    //add credentials and region if needed
    const envs = {
        region: process.env.AWS_DEFAULT_REGION || 'eu-west-1',
        id: process.env.AWS_ACCESS_KEY_ID,
        key: process.env.AWS_SECRET_ACCESS_KEY
    };
    if(!options.region) options.region = envs.region;
    if(!options.keyAttribute) options.keyAttribute = '_id';
    options.translatedKeyAttribute = options.keyAttribute.replace(/^_/, '#');
    if(!options.credentials?.accessKeyId && envs.id) options.credentials.accessKeyId = envs.id;
    if(!options.credentials?.secretAccessKey && envs.key) options.credentials.secretAccessKey = envs.key;

    //create dynamodb client
    const marshallOptions = {
        convertEmptyValues: false, // false, by default.
        removeUndefinedValues: false, // false, by default.
        convertClassInstanceToMap: false, // false, by default.
    };
    const unmarshallOptions = {
        wrapNumbers: false, // false, by default.
    };
    const translateConfig = { marshallOptions, unmarshallOptions };

    //STORE LOGIC
    return function(store){

        const defaultStoreOptions = {
            cacheOptions: {
                keys: {
                    maxAge: (15 * 60)
                },
                files: {
                    maxAge: (1 * 60)
                }
            }
        };
        store.client = new DynamoDBClient(options);
        store.docClient = new DynamoDBDocumentClient(store.client, translateConfig);
        store.setOptions(Object.assign(defaultStoreOptions, options));

        function getCmdParams(key, usingExpression){
            const params = {
                TableName: options.table
            };
            if(usingExpression && options.translatedKeyAttribute !== options.keyAttribute){
                params.ExpressionAttributeNames = {
                    [options.translatedKeyAttribute]: options.keyAttribute
                }
            }
            if(key) params.Key = {
                [options.keyAttribute]: key
            };
            return params;
        }

        return {

            async get(key){
                const getParams = getCmdParams(key);
                const cmd = new GetCommand(getParams);
                const result = await store.docClient.send(cmd);
                if(result.Item) return result.Item;
            },

            async save(key, document){
                const saveParams = getCmdParams();
                document[options.keyAttribute] = key;
                saveParams.Item = document;
                const cmd = new PutCommand(saveParams);
                return store.client.send(cmd);
            },

            async remove(key){
                const deleteParams = getCmdParams(key);
                const cmd = new DeleteCommand(deleteParams);
                return store.client.send(cmd);
            },

            async keys(){
                const queryParams = getCmdParams(null, true);
                queryParams.ProjectionExpression = options.translatedKeyAttribute;
                let cmd = new ScanCommand(queryParams);
                const result = await store.client.send(cmd);
                if(result.Items && Array.isArray(result.Items)){
                    return result.Items.map(item => item[options.keyAttribute])
                }else{
                    throw new Error(`Could not resolve keys`);
                }
            },

            async batch(ids){
                const params = {
                    RequestItems: {
                        [options.table]: {
                            Keys: ids.map(id => ({[options.keyAttribute]: id}))
                        }
                    }
                };
                const cmd = new BatchGetCommand(params);
                const result = await store.client.send(cmd);
                const returnDocs = get(result, `Responses.${options.table}`);
                if(Array.isArray(returnDocs)) return returnDocs.map(
                    document => ({key: document[options.keyAttribute], document:document})
                );
            }

        };

    }

}