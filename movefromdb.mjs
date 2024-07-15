import { TABLE, AUTH_ENABLE, ddbClient, ScanCommand, PutItemCommand, GetObjectCommand, S3_BUCKET_NAME, s3Client, S3_DB_FILE_KEY, PutObjectCommand } from "./globals.mjs";
export const processMoveFromDb = async () => {
    var jsonData = {};
    
    var scanParams = {
        TableName: TABLE,
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
            console.log(err);
            return err;
        }
    };
    
    const resultQ = await ddbQuery();
    console.log('result items', resultItems);
    
    for(var i = 0; i < resultItems.length; i++) {
        
        jsonData[resultItems[i].id.S] = {
            'name' : resultItems[i].name.S
        }
    }
    
    console.log(jsonData, JSON.stringify(jsonData))
    
    let command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: S3_DB_FILE_KEY,
        Body: JSON.stringify(jsonData),
        ContentType: 'application/json'
    });
    
    try {
        console.log(command)
        await s3Client.send(command);
    } catch (err) {
        console.log("movetodb error",err);
    }
}