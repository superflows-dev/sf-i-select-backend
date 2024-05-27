import { SEARCH_ENDPOINT_HOST, SEARCH_ENDPOINT_PATH, REGION, TABLE, CloudSearchDomainClient, SearchCommand } from "./globals.mjs";

import https from 'https';

export const processSearchNameApi = async (searchString) => { 
  
  let myPromise = new Promise(function(resolve, reject) {
    
    var options = {
       host: SEARCH_ENDPOINT_HOST,
       port: 443,
       method: 'GET',
       path: SEARCH_ENDPOINT_PATH + '?q=' + encodeURIComponent(searchString),
    };
    
    console.log(options);
    
    //this is the call
    var request = https.get(options, function(response){
      let data = '';
      response.on('data', (chunk) => {
          data = data + chunk.toString();
      });
    
      response.on('end', () => {
          const body = JSON.parse(data);
          console.log('success', body);
          resolve(body)
      });
    })
    
    request.on('error', error => {
      console.log('error', error)
      resolve(error);
    })
    
    request.end()
    
  });
  
  return myPromise;

} 