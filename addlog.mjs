import { TABLE, LOG_TABLE, PRESERVE_LOGS_DAYS, AUTH_ENABLE, AUTH_REGION, AUTH_API, AUTH_STAGE, ddbClient, ScanCommand, PutItemCommand, GetItemCommand, UpdateItemCommand } from "./globals.mjs";
import { processClearLog } from './clearlog.mjs'

export const processAddLog = async (userId, op, req, resp, httpCode) => {
    
    const now = new Date().getTime();
    
    var setParams = {
        TableName: LOG_TABLE,
        Item: {
            'userId' : {"S": userId},
            'timestamp' : {"N": (now + "")},
            'httpCode' : {"S": (httpCode + "")},
            'operation' : {"S": op + ""},
            'response' : {"S": JSON.stringify(resp)},
            'request' : {"S": JSON.stringify(req)}
            
        }
    };
    
    const ddbPut = async () => {
        try {
          const data = await ddbClient.send(new PutItemCommand(setParams));
          return data;
        } catch (err) {
          return err;
        }
    };
    
    const resultPut = await ddbPut();
    
    // console.log('adding log', resultPut);
    
    processClearLog();
    
    return {statusCode: 200, body: {result: true}};

}