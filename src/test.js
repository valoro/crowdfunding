const fabric = require('./services/fabric');

async function main() {

    await fabric.Network.teardownNetwork();
    await fabric.Network.startNetwork();
    await fabric.Network.deployContract();
    try {
        await fabric.Asset.transactionExcute(['submit','createUser', JSON.stringify({
            userId : 'user1',
            userName : "userName",
            contactNumber : 0100,
            emailId : 'email@hotmail.com'
        })]);
    } catch (error) {
        console.log("error of creating user is : " + error);
    }
    await fabric.Asset.transactionExcute (['submit','createOrganization', JSON.stringify({
        organizationName : 'health organization',
        organizationId : 'organization1',
        organizationDescription : 'this is health organization'
    })]);
    await fabric.Asset.transactionExcute(['submit','adminConfirm', 'organization1']);
    await fabric.Asset.transactionExcute(['submit','createEvent', JSON.stringify({
        eventName : 'event health',
        eventId : "event1",
        requiredAmount : 3,
        eventDuration : '3 days',
        organizationId : 'organization1',
    })]);
    await fabric.Asset.transactionExcute(['submit','createDonations', JSON.stringify({
        donationId : 'donation1',
        eventId : 'event1',
        userId : 'user1',
        donationAmount : 10
    })]);

}

main()