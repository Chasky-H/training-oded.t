import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from "@angular/core";
import { PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { AddonService } from '../../services/addon.service';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { GenericListDataSource } from '../generic-list/generic-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TodosService } from 'src/app/services/todos.service';


@Component({
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss'],
  providers: [TranslatePipe]
})
export class TodoForm implements OnInit {

    screenSize: PepScreenSizeType;

    constructor(
        public addonService: AddonService,
        public layoutService: PepLayoutService,
        public translate: TranslateService,
        public dialogService: PepDialogService,
        public router: Router,
        public activatedRoute: ActivatedRoute,
        private todosService: TodosService
    ) {

        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });

        this.key = this.activatedRoute.snapshot.params["todo_uuid"];
        this.loading = true;

        if(this.key === 'new_todo'){
            this.mode = 'Add';
        }
        else{
            this.mode = 'Edit';
        }

        if(this.mode === "Edit"){
            this.todosService.getTodo(this.key).then(obj => {
                if(!obj[0].DueDate){
                    obj[0].DueDate = '';
                }
                this.obj = obj[0];
                //console.log(`after setting obj: ${this.obj.Key}`)
                this.loading = false;
            });
        }

        else{
            this.loading = false;
        }
        

    }

    mode: 'Edit' | 'Add'
    title: string = "Hello"
    field1: string = "Hello"
    loading: boolean = true
    key: string;

    obj = {
        Key: '',
        Name: 'default name',
        Description: 'default description',
        DueDate: ''
    }

    ngOnInit(){
    }

    goBack() {
        this.router.navigate(['..'], {
            relativeTo: this.activatedRoute,
            queryParamsHandling: 'preserve'
        })
    }

    backClicked() {
        this.goBack();
    }

    async saveClicked() {
        await this.todosService.upsertTodo(this.obj);
        this.goBack();
    }

    cancelClicked() {
        this.dialogService.openDefaultDialog(new PepDialogData({
            title: 'Are you sure?',
            actionButtons: [
                {
                    title: this.translate.instant('No'),
                    className: 'regular',
                    callback: () => {
                        this.goBack()
                    }
                },
                {
                    title: this.translate.instant('Yes'),
                    className: 'strong',
                    callback: () => {
                        this.goBack()
                    }
                }
            ]
        }))
    }
}
