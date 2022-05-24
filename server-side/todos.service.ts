import { PapiClient, InstalledAddon, AddonData } from '@pepperi-addons/papi-sdk';
import { Client } from '@pepperi-addons/debug-server';
import { v4 as uuid } from 'uuid';

const TABLE_NAME = 'Todos'

class TodosService {

    papiClient: PapiClient
    addonUUID: string

    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey,
            actionUUID: client['ActionUUID']
        });
        this.addonUUID = client.AddonUUID;
    }

    getTodos(options){
        return this.papiClient.addons.data.uuid(this.addonUUID).table(TABLE_NAME).find(options)
    }

    createTodo(body){
        if(!body.Name || !body.Description){
            throw new Error('A todo must have a name and a description! (and yours is lacking at least one of them)')
        }
        body.Completed = false;
        body.Key = uuid();
        if(body.DueDate === ''){
            body.DueDate = undefined
        }

        return this.papiClient.addons.data.uuid(this.addonUUID).table(TABLE_NAME).upsert(body)
    }

    testAudit(body){
        if (!body.Key){
            body.Key = 'key1';
        }
        if(!body.IsChanged){
            body.IsChanged = false;
        }
        return this.papiClient.addons.data.uuid(this.addonUUID).table("AuditTest2").upsert(body)
    }

    // only called via the todos_delete which gives an array
    deleteTodos(body){
        return body.map(element => {
            element.Hidden = true;
            return this.updateTodo(element);
        })
    }

    // only called via the todos_delete which gives an array
    completeTodos(body){
        return body.map(element => {
            element.Completed = true;
            return this.updateTodo(element);
        })
    }
    

    updateTodo(body){
        if(body.DueDate === ''){
            body.DueDate = undefined;
        }
        return this.papiClient.addons.data.uuid(this.addonUUID).table(TABLE_NAME).upsert(body)
    }


}

export default TodosService;