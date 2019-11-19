/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
const { checkAssetExist, getAllAssets, editAsset, getAssetByProp, checkEnum, createAssetObj, toJSON , getAllAssetsByPartialKey} = require('./utils');

class cvs extends Contract {
    async test(ctx) {
        console.info('============= Test Started Contract ===========');
    }
    async initLedger(ctx) {
        console.info('============= END : Initialize Ledger ===========');
    }
    // async createCertificateClaim(ctx, userInput) {

    //     let certificateSchema = {
    //         name: 'certificateSchema',
    //         properties: [{
    //             name: 'degreeType',
    //             type: 'string',
    //             required: 'true'
    //         },{
    //             name: 'department',
    //             type: 'string',
    //             required: 'true'
    //         },{
    //             name: 'claimPeriod',
    //             type: 'string',
    //             required: 'true'
    //         },{
    //             name: 'file',
    //             type: 'string',
    //             required: 'false'
    //         },{
    //             name: 'organizationId',
    //             type: 'string',
    //             required: 'true'
    //         },{
    //             name: 'individualId',
    //             type: 'string',
    //             required: 'true'
    //         },{
    //             name: 'identityNumber',
    //             type: 'number',
    //             required: 'true'
    //         }]
    //     }
    //     await createAssetObj(ctx, JSON.stringify(certificateSchema), userInput);
    //     userInput = toJSON(userInput);

    //     let org = await getAssetByProp(ctx, JSON.stringify({
    //         organizationId: userInput.organizationId,
    //         docType: 'certificateOrg'
    //     }));

    //     if(org.length === 0) throw new Error(`organization ${userInput.organizationId} doesn't exist!`);
    //     org = org[0];

    //     checkEnum(userInput.degreeType, org.Record.degreeTypes, `degree ${userInput.degreeType} is not available in ${org.Record.organizationName}!`);
    //     checkEnum(userInput.department, org.Record.departments, `department ${userInput.department} is not available in ${org.Record.organizationName}!`)

    //     let newkey = 'CERTIFICATE_' + userInput.individualId + '_' + userInput.organizationId + '_' + ctx.stub.getTxTimestamp().seconds.low.toString();
    //     userInput.status = 'pending';
    //     userInput.file = '';
    //     userInput.docType = 'certificateClaim';
    //     userInput.type = 'claim';

    //     await ctx.stub.putState(newkey, Buffer.from(JSON.stringify(userInput)));
    //     return JSON.stringify({
    //         Key: newkey,
    //         Record: userInput
    //     });
    // }
    // async createExperienceOrganization(ctx, userInput) {

    //     let experienceOrgSchema = {
    //         name: 'experienceOrganizationSchema',
    //         properties: [{
    //             name: 'industries',
    //             type: 'array',
    //             required: 'true'
    //         },{
    //             name: 'designations',
    //             type: 'array',
    //             required: 'true'
    //         },{
    //             name: 'organizationId',
    //             type: 'string',
    //             required: 'true'
    //         },{
    //             name: 'organizationName',
    //             type: 'string',
    //             required: 'true'
    //         }]
    //     }
    //     await createAssetObj(ctx, JSON.stringify(experienceOrgSchema) , userInput);
    //     userInput = toJSON(userInput);
    //     userInput.docType = 'experienceOrg';
    //     userInput.type = 'org';

    //     let newkey = 'ORGANIZATION_EXPERIENCE_' + userInput.organizationId;
    //     const assetAsBytes = await ctx.stub.getState(newkey);
    //     if (assetAsBytes && assetAsBytes.length !== 0) {
    //         throw new Error(`organization ${userInput.organizationName} already registered!`);
    //     }

    //     await ctx.stub.putState(newkey, Buffer.from(JSON.stringify(userInput)));
    //     return JSON.stringify({
    //         Key: newkey,
    //         Record: userInput
    //     });
    // }
    // async approveClaim(ctx, userInput) {
    //     let approveClaimSchema = {
    //         name: 'approveClaimSchema',
    //         properties: [{
    //             name: 'claimId',
    //             type: 'asset',
    //             required: 'true'
    //         },{
    //             name: 'organizationId',
    //             type: 'string',
    //             required: 'true'
    //         }]
    //     }
    //     await createAssetObj(ctx, JSON.stringify(approveClaimSchema) , userInput);
    //     userInput = toJSON(userInput);
    //     let claim = await checkAssetExist(ctx, userInput.claimId, 'claim');
    //     if (claim.organizationId !== userInput.organizationId){
    //         throw new Error(`organization: ${userInput.organizationId} is not the organization mentioned in claim: ${userInput.claimId}`);
    //     }
    //     claim.status = 'approved';
    //     await ctx.stub.putState(userInput.claimId, Buffer.from(JSON.stringify(claim)));
    //     return JSON.stringify({
    //         Key: userInput.claimId,
    //         Record: claim
    //     });
    // }
    async queryAllAsset(ctx, asset) {
        return JSON.stringify(await getAllAssets(ctx, asset));
    }
    async queryAllAssetByPartialKey(ctx, assetObj) {
        return JSON.stringify(await getAllAssetsByPartialKey(ctx, assetObj));
    }
    async queryAsset(ctx, key, assetName) {
        if (!assetName || assetName === 0) {
            assetName = 'asset';
    }
        return await checkAssetExist(ctx, key, assetName);
    }
    async updateAsset(ctx, key, newProparties){
        let asset = await editAsset(ctx, key, newProparties);
        return JSON.stringify({key: key, asset});
    }
    async deleteAsset(ctx, key, assetName){
        if(!assetName){
            assetName = 'asset';
    }
        await checkAssetExist(ctx, key, assetName);
        await ctx.stub.deleteState(key);
        return JSON.stringify(key);
    }
    async queryAssetByProp(ctx, properties){
        return JSON.stringify(await getAssetByProp(ctx, properties));
    }
    async createOrganization(ctx, userInput) {
        console.info("-------------------------------------begin createOrganization---------------------");
        let organizationSchema = {
            name : 'organizationSchema',
            properties : [{
                name : 'organizationName',
                type : 'string',
                required : 'true'
            },{
                name : 'organizationId',
                type : 'string',
                required : 'true'                
            },{
                name : 'organizationDescription',
                type : 'string',
                required : 'true'
            }]
        }
        await createAssetObj(ctx, JSON.stringify(organizationSchema),userInput);
        userInput = toJSON(userInput);

        console.info('the input is ' + userInput);

        let newKey = 'organizaiton_' + userInput.organizationName + '_organizationId_' + userInput.organizationId + '_' + ctx.stub.getTxTimestamp().seconds.low.toString();
        userInput.status = 'pending';
 
        console.info("the input after adding the status is " + userInput);
        userInput.events = [];
        console.dir(userInput);
        console.info('the new key of the organization is '+ newKey);

        await ctx.stub.putState(newKey, Buffer.from(JSON.stringify(userInput)));
        console.info(JSON.stringify({ key : newKey, Record : userInput}));
        console.info("--------------------------------end createOrganization---------------------------");
        return JSON.stringify({
            key : newKey,
            Record : userInput
        });
        
    }
    async createEvent(ctx,userInput) {
        console.info("-----------------------------------------begin createEvent---------------------------------");
        let eventSchema = {
            name : 'eventSchema',
            properties : [{
                name : 'eventName',
                type : 'string',
                required : 'true'
            },{
                name : 'eventId',
                type : 'string',
                required : 'true'
            },{
                name : 'requiredAmount',
                type : 'number',
                required : 'true'
            },{
                name : 'eventDuration',
                type : 'string',
                required : 'true'  
            },{
                name : 'organizationId',
                type : 'string',
                required : 'true'
            }]
        }
        await createAssetObj(ctx, JSON.stringify(eventSchema), userInput);
        userInput = toJSON(userInput);

        console.info('the input of event is ' + userInput);

        let organizations = await getAssetByProp(ctx, JSON.stringify({
            organizationId : userInput.organizationId
        }));

        console.info("the organization of the event is " + organizations);

        if(organizations.length === 0) throw new Error(`organization ${userInput.organizationId} doesn't exist!`);
        let organizaiton = organizations[0];
        if(organizaiton.Record.status !== 'confirmed'){
            throw new Error(` the organization ${userInput.organizationId} is not confirmed by the system`);
        }

        userInput.donationIds = [];
        userInput.startDate = ctx.stub.getTxTimestamp().seconds.low.toString();
        userInput.donatedAmount = 0;

        let newKey = 'Event_' + userInput.eventId + '_organizationId_' + userInput.organizationId + '_' + ctx.stub.getTxTimestamp().seconds.low.toString();

        console.info("the new key of the event is " + newKey);

        let events = organizaiton.Record.events;
        events.push(userInput);

        let org = await editAsset(ctx, organizaiton.Key , JSON.stringify({
            events : events
        }))
        console.info("the organization added is : ");
        console.dir(org);
        console.log(" the events are : " + events);
        console.dir(events[0]);

        await ctx.stub.putState(newKey, Buffer.from(JSON.stringify(userInput)));
        console.info(JSON.stringify({
            Key : newKey,
            Record : userInput
        }));
        console.info("------------------------------------------end createEvent----------------------------------");

        return JSON.stringify({
            Key : newKey,
            Record : userInput
        })
    }
    async createDonations(ctx,userInput) {
        console.info("--------------------------------begin createDonations----------------------------------");

        let donationSchema = {
            name : 'donationSchema',
            properties : [{
                name : 'donationId',
                type : 'string',
                required : 'true'
            },{
                name : 'eventId',
                type : 'string',
                required : 'true'
            },{
                name : 'userId',
                type : 'string',
                required : 'true'
            },{
                name : 'donationAmount',
                type : 'number',
                required : 'true'  
            }]
        }
        await createAssetObj(ctx, JSON.stringify(donationSchema), userInput);
        userInput = toJSON(userInput);

        console.info("the input of the donation is " + userInput);

        let events = await getAssetByProp(ctx, JSON.stringify({
            eventId : userInput.eventId
        }));

        if(events.length === 0) throw new Error(`organization ${userInput.eventId} doesn't exist!`);
        let event = events[0];

        console.info("the event of the donation is " + events);
        console.dir(events[0]);

        let users = await getAssetByProp(ctx, JSON.stringify({
            userId : userInput.userId
        }));
        if(users.length === 0) throw new Error(`organization ${userInput.userId} doesn't exist!`);
        //let user = users[0];

        console.info("the user of the donation is  " );

        let date = ctx.stub.getTxTimestamp().seconds.low.toString();
        let dateDifference = parseInt(event.Record.startDate) - parseInt(date);
        let differenceDays = dateDifference /(1000 * 36 * 24);
        if(differenceDays > event.Record.eventDuration){
            throw new Error (` the time of the event ${ userInput.eventId} has ended`);
        }
        console.info("after checking the time difference : " + dateDifference + ' _ ' + differenceDays);

        event.Record.donatedAmount = event.Record.donatedAmount + userInput.donatedAmount;
        if(event.Record.donatedAmount > event.Record.requiredAmount){
            throw new Error(`the event ${ userInput.eventId} has ended`);
        }

        let newKey = 'donation_' + userInput.donationId + '_eventId_' + userInput.eventId + '_userId_ '+ userInput.userId + '_' + ctx.stub.getTxTimestamp().seconds.low.toString();

        console.info("the new key of the donation is " + newKey);
        await ctx.stub.putState(newKey, Buffer.from(JSON.stringify(userInput)));

        let donationsArray = event.Record.donationIds;
        donationsArray.push(userInput);

        let eventEdited = await editAsset(ctx, event.Key , JSON.stringify({
            donationIds : donationsArray
        }))

        console.info(JSON.stringify({
            Key : newKey,
            Record : userInput
        }));
        console.info("-----------------------------end createDonations------------------------------------------");
        return JSON.stringify({
            Key : newKey,
            Record : userInput
        })
    }
    async createUser(ctx, userInput){
        console.info("--------------------------------------begin createUser----------------------------------");

        let userSchema = {
            name : 'userSchema',
            properties : [{
                name : 'userId',
                type : 'string',
                required : 'true'
            },{
                name : 'userName',
                type : 'string',
                required : 'true'
            },{
                name : 'contactNumber',
                type : 'number',
                required : 'true'
            },{
                name : 'emailId',
                type : 'string',
                required : 'true'  
            }]
        }
        await createAssetObj(ctx, JSON.stringify(userSchema), userInput);
        userInput = toJSON(userInput);

        console.info("the input of the user is " + userInput);
        
        let newKey = 'user_' + userInput.userId + '_userName_' + userInput.userName + '_' + ctx.stub.getTxTimestamp().seconds.low.toString();

        console.info("the new key of the user is " + newKey);
        await ctx.stub.putState(newKey, Buffer.from(JSON.stringify(userInput)));
        console.info(JSON.stringify({
            key : newKey,
            Record : userInput
        }));
        console.info("--------------------------------------------end createUser--------------------------------");
        return JSON.stringify({
            key : newKey,
            Record : userInput
        })
    }
    async adminConfirm(ctx,organizationId){
        console.info("-------------------------------------------begin admin confrim-------------------------------");
        let organizations = await getAssetByProp(ctx, JSON.stringify({
            organizationId : organizationId
        }));
        console.info("the organization of the admin to confirm is " + organizations);
        console.dir(organizations[0]);
        console.info("the key of the organization is : "+ organizations[0].Key + " - " + organizations[0].Record);
        let organization = await editAsset(ctx, organizations[0].Key, JSON.stringify({
            status : 'confirmed'
        }))
        console.info(JSON.stringify({ key : organizations[0].Key , Record : organization}));
        console.info("----------------------------------------end admin confirm------------------------------------");

        return JSON.stringify({ key : organizations[0].Key , Record : organization});
    }
}

module.exports = cvs;
