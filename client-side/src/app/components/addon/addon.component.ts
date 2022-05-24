import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { PepLayoutService, PepScreenSizeType, PepFileService, PepGuid } from '@pepperi-addons/ngx-lib';
import { AddonService } from '../../services/addon.service';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { GenericListComponent, GenericListDataSource } from '../generic-list/generic-list.component';
import { TodoForm } from '../form/todo-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TodosService } from '../../services/todos.service';
import { saveAs } from 'file-saver';
import { Buffer } from 'buffer';
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { DIMXComponent as DIMXComponent } from '@pepperi-addons/ngx-composite-lib/dimx-export';

type fileStatus = 'uploading'|'downloading'|'done'|'failed'|'hidden';
export class IFile {
    key: number = 0;
    name:string = '';
    status: fileStatus = 'downloading';
    }

@Component({
  selector: 'addon-module',
  templateUrl: './addon.component.html',
  styleUrls: ['./addon.component.scss'],
  providers: [TranslatePipe]
})


export class AddonComponent implements OnInit {
    @ViewChild('dimx') dimx:DIMXComponent | undefined;
    screenSize: PepScreenSizeType;
    @ViewChild(GenericListComponent) GenericList: GenericListComponent;
    @Input() DIMXExportFormat: string = "json";
    @Input() DIMXExportIncludeDeleted: boolean = false;
    @Input() DIMXExportWhere: string;
    @Input() DIMXExportFields: string;
    @Input() DIMXExportDelimiter: string;
    @Input() DIMXExportAddonUUID: string = this.addonService.addonUUID;
    @Input() DIMXExportResource: string = 'Todos';
    constructor(
        public addonService: AddonService,
        public layoutService: PepLayoutService,
        public fileService: PepFileService,
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
    menuItems = [{"key":'dimxexport', "text":"Export"}, {"key":'dimximport', "text":"Import"}];
    selectedMenuItem = {"key":'dimxexport'};
    menuItemClick(value: any){
        console.log(`menu item was clicked with value ${JSON.stringify(value)}`);
       
        switch(value["source"]["key"]){
            case "dimxexport":
                this.dimx?.DIMXExportRun({"DIMXExportFormat":"csv"});
                break;
            case "dimximport":
                this.dimx?.uploadFile({});
                
                break;
            default:
                console.log("default reached in menuItemClick switch-case");
        }
        
    }

    onDIMXProcessDone(event:any){
        console.log(`DIMXProcessDone: ${JSON.stringify(event)}`);
    }
    
   
    menuClick(value: any){
        console.log(`menu click with value: ${JSON.stringify(value)}`);
    }

    getDIMXExportPOSTBody(){
        return {
            "Format":this.DIMXExportFormat,
            "IncludeDeleted":this.DIMXExportIncludeDeleted,
            "Where":this.DIMXExportWhere,
            "Fields":this.DIMXExportFields,
            "Delimiter":this.DIMXExportDelimiter
        }
    }

    

    async pollDIMXExportResult(pollingURL:string, ifile:IFile){
        console.log(`polling audit with the executionUUID: ${pollingURL}`);
        const delay = ms => new Promise(res => setTimeout(res, ms));
        var seconds = 0;
        const waitingTime = 1000; //in ms
        try{
            while(true){
                var result = await this.addonService.papiClient.get(`/audit_logs/${pollingURL}`);
                //debugger;
                console.log(`result from auditlog get is: ${result}`);
                if( !result || result["Status"]["ID"] === 2 || result["Status"]["ID"] === 4){
                    console.log(`waited for ${seconds++} seconds`);
                    await delay(waitingTime);
                }
                else{
                    break;
                }
            }
            switch(result["Status"]["ID"]){
                case 0:
                    ifile.status = "failed";
                    throw new Error(result["AuditInfo"]["ErrorMessage"]);
                case 1:
                    console.log(`polling result: ${result["AuditInfo"]["ResultObject"]}`);
                    return JSON.parse(result["AuditInfo"]["ResultObject"]);
                default:
                    ifile.status = "failed";
                    throw new Error(`pollDIMXExportResult: unknown audit log type: ${result["Status"]}`);
            }
        }
        catch(ex){
            console.log(`pollDIMXExportResult: ${ex}`);
            ifile.status = "failed";
            throw new Error((ex as {message:string}).message);
        }
    }

    getNewFileName(){
        var extension;
        var filename;
        switch (this.DIMXExportFormat.toLowerCase()){
            case "json":
                extension = ".json";
                break;
            case "csv":
                extension = '.csv';
                break;
            default:
                extension = "";
        }
        filename = "export"
        return filename+extension;
    }
    
    iFileID = 0;
    iFileArray:IFile[] = [];
    createNewIFile(fileName:string):IFile{
        return {
            "key":this.iFileID++,
            "name":fileName,
            "status":"downloading"};
    }
    

    async buttonClickExport(value: any ) {
        console.log("sombody clicked a button");
        const bod = this.getDIMXExportPOSTBody();
        const fileName = this.getNewFileName();
        const iFile:IFile = this.createNewIFile(fileName);
        this.iFileArray.push(iFile);
        try{

            console.log("posting to dimx export now");
            var res = await this.addonService.papiClient.post(`/addons/data/export/file/${this.DIMXExportAddonUUID}/${this.DIMXExportResource}`, bod);
            console.log("Got reply from dimx, calling poll with the result:");
            console.log(res);

            const url = await this.pollDIMXExportResult(res['ExecutionUUID'], iFile);

            console.log("attempting to download the file");
            console.log(`url is: ${url}`);
            let blob = await fetch(url).then(r => r.blob());
            saveAs(blob, fileName);
            iFile.status = "done";
            console.log("downloaded the file");
        }
        catch(ex){
            iFile.status= "failed";
            console.log(`buttonClick: ${ex}`);
            throw new Error((ex as {message:string}).message);
        }
        //debugger;
    }


    ngOnInit(){
    }

    elementClickImport(value: any){
        console.log(`element click: ${value}`);
        debugger;
    }
    
    getNewPFSUploadKey(fileExt:string){
        const uuid = PepGuid.newGuid();
        const folder = 'DIMX_import';
        const pfsKey = `/${folder}/${uuid}.${fileExt}`;
        return pfsKey;
    }

    postToRelativeURL(relativeURL:string, body:any){

    }

    getPFSUploadObject(value:{fileStr:string, fileExt:string}){
        const fileStrArr = value.fileStr.split(';');
        const mime = fileStrArr[0].split(':')[1];
        const pfsKey = this.getNewPFSUploadKey(value.fileExt);
        const pfsUploadObject = {
            "Key": pfsKey,
            "MIME": mime,
            "URI":value.fileStr
        }
        return pfsUploadObject;
    }
    fileChangeImport(value: any){
        const pfsRelativeURL = `/addons/files/${this.addonService.addonUUID}`;
        const pfsUploadObject = this.getPFSUploadObject(value);
        console.log(this.addonService.session.getPapiBaseUrl());
        console.log(this.route.snapshot.params.addon_uuid);
        console.log(`file change: ${value}`);
        debugger;
    }
    toBase64 = file => new Promise((resolve, reject) => {

        const reader = new FileReader();
        
        reader.readAsDataURL(file);
        
        reader.onload = () => resolve(reader.result);
        
        reader.onerror = error => reject(error);
        
        });

    async upload(e, options:{OverwriteOBject?:boolean, Delimiter?:string}) {
        const dimx_import_uuid = '44c97115-6d14-4626-91dc-83f176e9a0fc';
        const fileListAsArray = Array.from(e);
        fileListAsArray.forEach(async (item, i) => {
        const file = (e as HTMLInputElement);
        var str = (await this.toBase64(file[0])) as string;
        var ext = file[0].name.split('.')[1];
        const value = {fileStr:str, fileExt:ext}
        const pfsUploadObject = this.getPFSUploadObject(value);

        debugger;
        
        });
        
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
