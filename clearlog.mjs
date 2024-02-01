import { TABLE, LOG_TABLE, PRESERVE_LOGS_DAYS, AUTH_ENABLE, ddbClient, ScanCommand, DeleteItemCommand, PutItemCommand, GetItemCommand, UpdateItemCommand } from "./globals.mjs";

export const processClearLog = async () => {
    
    const now = new Date().getTime();
    
    // scan records
  
    var scanParams = {
        TableName: LOG_TABLE,
    }
    
    var resultItems = []
  
    async function ddbQuery () {
        try {
            const data = await ddbClient.send (new ScanCommand(scanParams));
            resultItems = resultItems.concat((data.Items))
            if(data.LastEvaluatedKey != null) {
                scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
                await ddbQuery();
            }
        } catch (err) {
            return err;
        }
    };
    
    await ddbQuery();
    
    const ddbDelete = async (deleteParams) => {
        try {
            const data = await ddbClient.send(new DeleteItemCommand(deleteParams));
            return data;
        } catch (err) {
            console.log(err)
            return err;
        }
    };
    
    for(var i = 0; i < resultItems.length; i++) {
        const userId = resultItems[i].userId.S;
        const timestamp = resultItems[i].timestamp.N;
        if((parseInt(now) - parseInt(timestamp)) > PRESERVE_LOGS_DAYS*24*60*60*1000) {
            var deleteParams = {
                TableName: LOG_TABLE,
                Key: {
                    userId: { S: userId },
                    timestamp: {N: timestamp + ""}
                }
            };
            var resultDelete = await ddbDelete(deleteParams);
            
        }
    }
    
    return {statusCode: 200, body: {result: true}};

}