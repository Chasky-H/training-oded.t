import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild } from "@angular/core";
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { AddonService } from '../../services/addon.service';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { GenericListComponent, GenericListDataSource } from '../generic-list/generic-list.component';
import { TodoForm } from '../form/todo-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TodosService } from '../../services/todos.service';


@Component({
  selector: 'addon-module',
  templateUrl: './addon.component.html',
  styleUrls: ['./addon.component.scss'],
  providers: [TranslatePipe]
})
export class AddonComponent implements OnInit {

    screenSize: PepScreenSizeType;
    @ViewChild(GenericListComponent) GenericList: GenericListComponent;
    constructor(
        public addonService: AddonService,
        public layoutService: PepLayoutService,
        public translate: TranslateService,
        public router: Router,
        public route: ActivatedRoute,
        public activatedRoute: ActivatedRoute,
        public todosService: TodosService
    ) {

        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });

    }

    ngOnInit(){
    }

    goAdd() {
        this.router.navigate(['./new_todo'], {
            relativeTo: this.activatedRoute,
            queryParamsHandling: 'preserve'
        })
    }

    listDataSource: GenericListDataSource = {
        // the objects in the list
        getList: async (state) => {
            return this.todosService.getAllTodos();
        },
        // what you see in the list
        getDataView: async () => {
            return {
                Context: {
                    Name: '',
                    Profile: { InternalID: 0 },
                    ScreenSize: 'Landscape'
                  },
                  Type: 'Grid',
                  Title: '',
                  Fields: [
                    {
                        FieldID: 'Name',
                        Type: 'TextBox',
                        Title: 'Name',
                        Mandatory: false,
                        ReadOnly: true
                    },
                    {
                        FieldID: 'Description',
                        Type: 'TextBox',
                        Title: 'Description',
                        Mandatory: false,
                        ReadOnly: true
                    },
                    {
                        FieldID: 'DueDate',
                        Type: 'Date',
                        Title: 'Due date',
                        Mandatory: false,
                        ReadOnly: true
                    },
                    {
                        FieldID: 'Completed',
                        Type: 'Boolean',
                        Title: 'Completed',
                        Mandatory: false,
                        ReadOnly: true
                    }
                  ],
                  Columns: [
                    {
                        Width: 25
                    },
                    {
                        Width: 25
                    },
                    {
                        Width: 25
                    },
                    {
                      Width: 25
                    }
                  ],
                  FrozenColumnsCount: 0,
                  MinimumColumnWidth: 0
            }
        },

        getActions: async (objs) =>  {
            const output = [];
            if(objs.length === 1){
                output.push({
                    title: this.translate.instant("Edit"),
                    handler: async (objs) => {
                        this.router.navigate([objs[0].Key], {
                            relativeTo: this.route,
                            queryParamsHandling: 'merge'
                        });
                    }
                })
            }
            if(objs.length >= 1){
                output.push({ //replace foreach with for
                    title: this.translate.instant("Delete"),
                    handler: async (objs) => {
                        await this.todosService.deleteTodos(objs);
                        this.GenericList.reload();
                }
                });
                output.push({
                    title: this.translate.instant("Mark as done"),
                    handler: async (objs) => {
                        await this.todosService.completeTodos(objs);
                        this.GenericList.reload();
                    }
                })
            }
            return output;
        }
    }
}
