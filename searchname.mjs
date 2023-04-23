import { SEARCH_ENDPOINT, REGION, TABLE, CloudSearchDomainClient, SearchCommand } from "./globals.mjs";

export const processSearchName = async (searchString) => {
  
  const client = new CloudSearchDomainClient({ 
        endpoint: SEARCH_ENDPOINT,
        region: REGION
    });
    
    console.log('searchString', searchString);
    
    var query = "";
    
    query += "(and ";
      
    const arrSearch = Array.isArray(searchString) ? searchString : searchString.split("&");
    
    for(var i = 0; i < arrSearch.length; i++) {
    if(arrSearch[i] != "Select" && arrSearch[i].length > 0) {
        query += "(or (prefix field=data '"+arrSearch[i]+"') (phrase field=data '"+arrSearch[i]+"')) "
    }
    }
    
    query += ")";
    
    const params = {
      query: query,
      queryParser: "structured"
    };
    
    console.log(params);
    
    const command = new SearchCommand(params);
    
    //console.log('command', command)
    
    var data;
    
    // async/await.
    try {
      data = await client.send(command);
      // process data.
    } catch (error) {
      // error handling.
      console.log(error);
    } finally {
      // finally. 
    }
    
    return data;
    
  
}