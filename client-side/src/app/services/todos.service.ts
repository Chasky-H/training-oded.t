import { Injectable } from '@angular/core';
import { AddonService } from './addon.service';

@Injectable({
  providedIn: 'root'
})
// this should be our access to the todos actions we built on the server side
// gonna need to use papiClient and give it the addonUUID so we should inject the addonService which has those
export class TodosService {

  constructor(private addonService: AddonService) {}

  getTodos(options){
    return this.addonService.papiClient.addons.api.uuid(this.addonService.addonUUID).file('api').func('todos').get(options);
  }

  // get all todos
  getAllTodos() {
    return this.getTodos({});
  }

  getTodo(key){
    return this.getTodos({
      where: `Key = '${key}'`
    })
  }
  
  deleteTodos(objs){
    return this.addonService.pepPost(`/addons/api/${this.addonService.addonUUID}/api/todos_delete`, objs).toPromise();
    //return this.addonService.papiClient.addons.api.uuid(this.addonService.addonUUID).file('api').func('todos_delete').post(undefined, objs);
  }

  completeTodos(objs){
    return this.addonService.pepPost(`/addons/api/${this.addonService.addonUUID}/api/todos_complete`, objs).toPromise();
  }

  async upsertTodo(obj){
    return this.addonService.pepPost(`/addons/api/${this.addonService.addonUUID}/api/todos`, obj).toPromise()
  }

  // get todo by key
  //getTodos(key){

  //}

  //
}
