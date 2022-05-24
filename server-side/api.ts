import TodosService from './todos.service'
import { Client, Request } from '@pepperi-addons/debug-server'
import { AddonData, PapiClient } from '@pepperi-addons/papi-sdk';

// add functions here
// this function will run on the 'api/foo' endpoint
// the real function is runnning on another typescript file

export async function todos(client: Client, request: Request){
    const service = new TodosService(client);
    const res: Promise<AddonData>[] = [];
    if (request.method === 'POST'){
        if(!Array.isArray(request.body)){
            request.body = [request.body];
        }
        
        //check if key exists. if so, update. else, crate new.
        for (let index = 0; index < request.body.length; index++) {
            const element = request.body[index];
            if(!element.Key){
                res.push(service.createTodo(element));
            }
            else{
                res.push(service.updateTodo(element));
            }
        }
        return res.length == 1 ? res[0] : Promise.all(res);
    }
    else if (request.method === 'GET'){
        console.log(`api.ts got GET request with query ${request.query}`)
        return service.getTodos(request.query);
    }
    else{
        throw new Error('Method ${request.method} not supported')
    }
}

export async function testAudit(client:Client, request:Request){
    const service = new TodosService(client);
    return service.testAudit(request.body);
}

/*
request.body format:
{DIMXObjects:
    [
        {
            Status:"InProgress",
            Details:"...",
            Object:{...}
        },
        {...},...
    ]
}
*/
export async function importRelation(client:Client, request:Request){
    try{
        console.log(`@@@@@@@@@ Training importRelation - input is ${request.body}`);
        if (request.body && request.body.DIMXObjects){
            for (let index = 0; index < request.body.DIMXObjects.length; index++) {
                const element = request.body.DIMXObjects[index];
                console.log("********* Training - importRelation");
                element.Key = index.toString;
                if (index % 5 === 0){
                    element.Status = "Error";
                    element.Details = "key divides by 5";
                }
            }
        }
        return request.body;
    }
    catch (err){
        console.log(`in importRelation of todo: ${err}`);
        throw new Error("training error");
        //return request.body;
    }
}
export async function mappingRelation(client:Client, request:Request){
    const output:{"Mapping":{[key:string]:{"Action":string, "NewKey":string}}} = {"Mapping":{}}
    try{
        console.log(`@@@@@@@@@ Training mappingRelation - input is ${request.body}`);
        if (request.body && request.body.Objects){
            for (let index = 0; index < request.body.Objects.length; index++) {
                const element = request.body.Objects[index];
                if (index % 5 === 0){
                    output.Mapping[`${element.Key}`]={Action:"Ask", NewKey:`AskingFor_${element.Key}`};
                }
                else{
                    output.Mapping[`${element.Key}`]={Action:"Replace", NewKey:`ReplacingFor_${element.Key}`};
                }
            }
        }
        return output;
    }
    catch (err){
        console.log(`in importRelation of todo: ${err}`);
        throw new Error("training error");
        //return request.body;
    }
}

export async function exportRelation(client:Client, request:Request){
    try{
        console.log(`@@@@@@@@@ Training importRelation - input is ${request.body}`);
        if (request.body && request.body.DIMXObjects){
            for (let index = 0; index < request.body.DIMXObjects.length; index++) {
                const element = request.body.DIMXObjects[index];
                console.log("********* Training - exportRelation");
                element.Object.newProp = "abc";
            }
        }
        return request.body;
    }
    catch (err){
        console.log(`in exportRelation of todo: ${err}`);
        throw new Error("training error");
        //return request.body;
    }
}

export function RecursiveImportTestHost_ImportRelativeURL(client:Client, request:Request){
    const mappingObject:{[addonUUID_resource:string]:{
        [original_key:string]:{Action:"Replace", NewKey:string}
    }} = request.body["Mapping"];
    const addonUUID = 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec';
    const name= 'RecursiveImportTestHost';
    const refName = 'RecursiveImportTestReference'
    const myMapping = mappingObject[`${addonUUID}_${name}`];
    const refMapping = mappingObject[`${addonUUID}_${refName}`];
    if (request.body && request.body.DIMXObjects){
        for (let index = 0; index < request.body.DIMXObjects.length; index++) {
            const element = request.body.DIMXObjects[index];
            if (myMapping[element.Object.Key]){
                element.Object.Key = myMapping[element.Object.Key].NewKey;
            }
            if (refMapping[element.Object.Prop2]){
                element.Object.Prop2 = refMapping[element.Object.Prop2].NewKey;
            }
        }
    }
    return request.body;
}

export function RecursiveImportTestReference_ImportRelativeURL(client:Client, request:Request){
    const mappingObject:{[addonUUID_resource:string]:{
        [original_key:string]:{Action:"Replace", NewKey:string}
    }} = request.body["Mapping"];
    const addonUUID = 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec';
    const name= 'RecursiveImportTestReference';
    const myMapping = mappingObject[`${addonUUID}_${name}`];
    if (request.body && request.body.DIMXObjects){
        for (let index = 0; index < request.body.DIMXObjects.length; index++) {
            const element = request.body.DIMXObjects[index];
            if(myMapping[element.Object.Key]){
                element.Object.Key = myMapping[element.Object.Key].NewKey;
            }
        }
    }
    return request.body;
}

export function RecursiveImportTestHost_MappingRelativeURL(client:Client, request:Request){
    const mappingArray:{[original_key:string]:{Action:"Replace", NewKey:string}} = {};
    const objects:any[] = request.body.Objects;
    objects.forEach(el => {
        mappingArray[el.Key]= {Action:"Replace", NewKey:`Mapped ${el.Key}`}
    })
    return {Mapping:mappingArray};
}

export function RecursiveImportTestReference_MappingRelativeURL(client:Client, request:Request){
    const mappingArray:{[original_key:string]:{Action:"Replace", NewKey:string}} = {};
    const objects:any[] = request.body.Objects;
    objects.forEach(el => {
        mappingArray[el.Key]= {Action:"Replace", NewKey:`Mapped ${el.Key}`}
    })
    return {Mapping:mappingArray};
}

export function RecursiveImportTestContained_FixRelativeURL(client:Client, request:Request){
    const obj = request.body["Object"];
    obj["Prop1"] = `Fixed ${obj["Prop1"]}`;
    return obj|
}
export function fixHost(clien                                                                                                           t:Client, request:Request){
    const obj = request.body["Object"];
    obj["NewPropertyInFix"]=`New value for key ${obj.Key}`;
    return obj;
}

export function fixContained(client:Client, request:Request){
    const obj = request.body["Object"];
    obj["ContainedInnerStringData"]=`fixed ${obj["ContainedInnerStringData"]}`;
    obj["ContainedInnerIntegerData"]=obj["ContainedInnerIntegerData"] + 100;
    return obj;
}

export function fixDynamicContained(client:Client, request:Request){
    const obj = request.body["Object"];
    obj["DynamicContainedInnerStringData"]=`fixed ${obj["DynamicContainedInnerStringData"]}`;
    obj["DynamicContainedInnerIntegerData"]=obj["DynamicContainedInnerIntegerData"] + 100;
    return obj;
}

export async function test_papi_sdk(client: Client, request: Request){
    const service = new TodosService(client);
    const addonUUID= "b78f61f0-e9f0-4650-9ab1-d8b0906505ec";
    const tableName = "recursiveC";
    //const results = await service.papiClient.addons.data.export.file.uuid(addonUUID).table(tableName).upsert(request.body);
    //const results = await service.papiClient.addons.data.import.uuid(addonUUID).table(tableName).upsert(request.body);
    const results = await service.papiClient.addons.data.import.file.uuid(addonUUID).table(tableName).upsert(request.body);
    return results;
}

export async function todos_delete(client: Client, request: Request){
    const service = new TodosService(client);
    const res: Promise<AddonData>[] = [];
    if (request.method === 'POST'){
        if(!Array.isArray(request.body)){
            request.body = [request.body];
        }
        return service.deleteTodos(request.body);
    }
    else{
        throw new Error('Method ${request.method} not supported')
    }
}

export async function testExportFunction(client: Client, request: Request){
    const service = new TodosService(client);
    const addonUUID = "b78f61f0-e9f0-4650-9ab1-d8b0906505ec";
    const table = "items";
    const key = request.body.Key;
    try{
    const result = await service.papiClient.get(`/addons/data/${addonUUID}/${table}/${key}`);
    return result;
    }
    catch(ex){
        console.log(`testExportFunction: ${ex}`);
        throw new Error((ex as {message:string}).message);
    }
}

export async function todos_complete(client: Client, request: Request){
    const service = new TodosService(client);
    const res: Promise<AddonData>[] = [];
    if (request.method === 'POST'){
        if(!Array.isArray(request.body)){
            request.body = [request.body];
        }
        return service.completeTodos(request.body);
    }
    else{
        throw new Error('Method ${request.method} not supported')
    }
}

export function my_scheme(client:Client, request:Request){
    const scheme = {
        "type": "object",
        "properties": {
           "StringVal": { "type": "string" },
           "NumberVal": { "type": "number" },
           "IntegerVal": { "type": "integer" },
           "BooleanVal": { "type": "boolean" },
           "StringArray": { "type": "array", "items": { "type": "string" } },
           "NumberArray": { "type": "array", "items": { "type": "number" } },
           "IntegerArray": { "type": "array", "items": { "type": "integer" } },
           "BooleanArray": { "type": "array", "items": { "type": "boolean" } },
           "ObjectVal": {
              "type": "object",
              "properties": {
                 "StringVal2": { "type": "string" },
                 "NumberVal2": { "type": "number" },
                 "ObjectVal2": {
                    "type": "object",
                    "properties": {
                       "StringVal3": { "type": "string" },
                       "NumberVal3": { "type": "number" }
                    }
                 }
              }
           }
        }
     }
     return scheme;
}
