import TodosService from './todos.service'
import { Client, Request } from '@pepperi-addons/debug-server'
import { AddonData } from '@pepperi-addons/papi-sdk';

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

