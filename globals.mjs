const REGION = "AWS_REGION"; //e.g. "us-east-1"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CloudSearchDomainClient, UploadDocumentsCommand, SearchCommand } from "@aws-sdk/client-cloudsearch-domain";
import { ScanCommand, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: REGION });

const TABLE = "DB_TABLE_NAME";
const LOG_TABLE = "DB_LOG_TABLE_NAME";

const AUTH_ENABLE = AWS_ENABLE_AUTH;

const ENTITY_NAME = "ENTITY_NAME_VALUE";

const CHANGE_ENDPOINT_HOST = "AWS_CHANGE_ENDPOINT.execute-api.us-east-1.amazonaws.com";
const CHANGE_ENDPOINT_PATH = "/test/startjob";

const SEARCH_ENDPOINT_HOST = "AWS_SEARCH_ENDPOINT.execute-api.us-east-1.amazonaws.com";
const SEARCH_ENDPOINT_PATH = "/test";

const PRESERVE_LOGS_DAYS = 3;

export { 
    REGION,
    ScanCommand, 
    GetItemCommand, 
    PutItemCommand, 
    UpdateItemCommand,
    DeleteItemCommand,
    ddbClient,
    TABLE, 
    LOG_TABLE,
    AUTH_ENABLE, 
    PRESERVE_LOGS_DAYS,
    CloudSearchDomainClient,
    UploadDocumentsCommand,
    SearchCommand,
    SEARCH_ENDPOINT_HOST,
    SEARCH_ENDPOINT_PATH,
    CHANGE_ENDPOINT_HOST,
    CHANGE_ENDPOINT_PATH,
    ENTITY_NAME
};