import https from 'https';
import { CHANGE_ENDPOINT_HOST, CHANGE_ENDPOINT_PATH } from "./globals.mjs";


export const processManageChange = async (authorization, body) => {
  
  let myPromise = new Promise(function(resolve, reject) {
    
    var options = {
      host: CHANGE_ENDPOINT_HOST,
      port: 443,
      method: 'POST',
      path: CHANGE_ENDPOINT_PATH,
      headers: {
          'Authorization': authorization,
          'Content-type': 'application/json'
      }
    };
    
    console.log(options);
    
    //this is the call
    var request = https.request(options, function(response){
      let data = '';
      response.on('data', (chunk) => {
          data = data + chunk.toString();
      });
    
      response.on('end', () => {
          const body = JSON.parse(data);
          console.log('success changemanager', body);
          resolve(body)
      });
    })
    
    request.on('error', error => {
      console.log('error changemanager', error)
      resolve(error);
    })
    
    request.write(JSON.stringify(body))
    request.end();
    
    
  });
  
  return myPromise;

}