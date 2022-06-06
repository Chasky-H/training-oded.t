
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { PapiClient, Relation } from '@pepperi-addons/papi-sdk'

export async function install(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client['ActionUUID']
    });

    papiClient.addons.data.schemes.post({
        Name: 'Todos',
        Type: 'indexed_data',
        Fields: {
            Name: {
                Type: 'String',
                Indexed: true
            },
            Description: {
                Type: 'String',
                Indexed: true
            },
            DueDate: {
                Type: 'DateTime'
            },
            Completed: {
                Type: 'Bool'
            }
        } as any
    })
    papiClient.addons.data.schemes.post({
        Name: 'AuditTest',
        Type: 'data',
        Fields: {
            IsChanged: {
                Type: 'Bool'
            }
        }
    })
    papiClient.addons.data.schemes.post({
        Name: 'AuditTest2',
        Type: 'data',
        Fields: {
            IsChanged: {
                Type: 'Bool'
            }
        }
    })
    const importRelation:Relation = {
        RelationName: "DataImport",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'OdedTodoAddon',
        Type: 'AddonAPI',
        AddonRelativeURL:'/api/importRelation'
    }

    const exportRelation:Relation = {
        RelationName: "DataExport",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'OdedTodoAddon',
        Type: 'AddonAPI',
        AddonRelativeURL:'/api/importRelation'
    }

    await upsertRelation(papiClient, importRelation);
    await upsertRelation(papiClient, exportRelation);
    return {success:true,resultObject:{}}
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client['ActionUUID']
    });
    const importRelation:Relation = {
        RelationName: "DataImportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'OdedTodoAddon',
        Type: 'AddonAPI',
        AddonRelativeURL:'',//'/api/importRelation',
        MappingRelativeURL:'/api/mappingRelation'
    }

    const importRelation1:Relation = {
        RelationName: "DataImportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'TrainingContainedTestHost',
        Type: 'AddonAPI',
        AddonRelativeURL:'',//'/api/importRelation',
        MappingRelativeURL:'',
        FixRelativeURL:'/api/fixHost'
    }

    const exportRelation1:Relation = {
        RelationName: "DataExportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'TrainingContainedTestHost',
        Type: 'AddonAPI',
        AddonRelativeURL:'/api/exportRelation',
    }

    const RecursiveImportTestContained_ImportRelation = {
        RelationName: "DataImportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'RecursiveImportTestContained',
        Type: 'AddonAPI',
        AddonRelativeURL:"",
        MappingRelativeURL:null,
        FixRelativeURL:'/api/RecursiveImportTestContained_FixRelativeURL'
    }
    const RecursiveImportTestReference_ImportRelation = {
        RelationName: "DataImportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'RecursiveImportTestReference',
        Type: 'AddonAPI',
        AddonRelativeURL:'/api/RecursiveImportTestReference_ImportRelativeURL',
        MappingRelativeURL:'/api/RecursiveImportTestReference_MappingRelativeURL',
    }

    const RecursiveImportTestHost_ImportRelation = {
        RelationName: "DataImportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'RecursiveImportTestHost',
        Type: 'AddonAPI',
        AddonRelativeURL:'/api/RecursiveImportTestHost_ImportRelativeURL',
        MappingRelativeURL:'/api/RecursiveImportTestHost_MappingRelativeURL',
    }

    const RecursiveImportTestReference_ExportRelation = {
        RelationName: "DataExportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'RecursiveImportTestReference',
        Type: 'AddonAPI',
        AddonRelativeURL:''
    }

    const RecursiveImportTestHost_ExportRelation = {
        RelationName: "DataExportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'RecursiveImportTestHost',
        Type: 'AddonAPI',
        AddonRelativeURL:''
    }

    const importRelation2:Relation = {
        RelationName: "DataImportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'TrainingContainedResource',
        Type: 'AddonAPI',
        AddonRelativeURL:'',//'/api/importRelation',
        MappingRelativeURL:'',
        FixRelativeURL:'/api/fixContained'
    }
    const importRelation3:Relation = {
        RelationName: "DataImportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'TrainingDynamicContainedResource',
        Type: 'AddonAPI',
        AddonRelativeURL:'',//'/api/importRelation',
        MappingRelativeURL:'',
        FixRelativeURL:'/api/fixDynamicContained'
    }

    const exportRelation:Relation = {
        RelationName: "DataExportResource",
        AddonUUID: 'b78f61f0-e9f0-4650-9ab1-d8b0906505ec',
        Name: 'OdedTodoAddon',
        Type: 'AddonAPI',
        AddonRelativeURL:''
    }

    await upsertRelation(papiClient, importRelation);
    await upsertRelation(papiClient, exportRelation);
    await upsertRelation(papiClient, importRelation1);
    await upsertRelation(papiClient, exportRelation1);
    await upsertRelation(papiClient, importRelation2);
    await upsertRelation(papiClient, importRelation3);
    await upsertRelation(papiClient, RecursiveImportTestHost_ExportRelation);
    await upsertRelation(papiClient, RecursiveImportTestHost_ImportRelation);
    await upsertRelation(papiClient, RecursiveImportTestReference_ExportRelation);
    await upsertRelation(papiClient, RecursiveImportTestReference_ImportRelation);
    await upsertRelation(papiClient, RecursiveImportTestContained_ImportRelation);
    return {success:true,resultObject:{}}
}
async function upsertRelation(papiClient: PapiClient, relation){
    try{
        await papiClient.post(`/addons/data/relations`, relation);
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err){
        return {
            success: false,
            errorMessage: err
        }
    }}
export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

