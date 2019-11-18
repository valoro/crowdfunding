const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin} = require('fabric-network');
const ccName = 'cvs';
const networkPath = path.join(__dirname, '../fabric/first-network')

async function executeCmd(cmd) {
    return new Promise((resolve, reject) => {
        console.log('cmd is: ', cmd);
        let cmdOutput;
        const process = spawn(cmd, {shell: true});

        process.stdout.setEncoding('utf-8');
        process.stdout.on('data', function (data) {
            console.log('STDOUT: ', data);
            cmdOutput = data;
        });

        process.stderr.setEncoding('utf-8');
        process.stderr.on('data', function (data) {
            console.log('STDERR: ', data);
            cmdOutput = data;
        });

        process.on('exit', function (exitCode) {
            if (exitCode !== 0) {
                console.error('error running command!');
                return reject({
                    msg: 'error running command!',
                    cmdOutput: cmdOutput
                });
            }
            console.log('Child exited with code: ' + exitCode);
            return resolve({
                msg: 'success',
                cmdOutput: cmdOutput
            });
        });
    });
};

async function startNetwork() {
    try {
        await executeCmd(`cd ${networkPath} && echo y | ./byfn.sh up -n -a -s couchdb`);
        await enrollAdmin('admin', 'adminpw');
        await registerUser('admin', 'user0');
        return true;
    } catch (error) {
        return error;
    }
};

async function teardownNetwork() {
    try {
        await executeCmd(`cd ${networkPath} && pwd && echo y | ./byfn.sh down && (rm wallet/ -r || echo "couldnt findwallet to     remove")`);
        return true;
    } catch (error) {
        return error;
    }
};

async function deployContract() {
    try {
        await executeCmd(`cd ${networkPath} && ./runCC.sh ${ccName} && docker ps`);
        return true;
    } catch (error) {
        return error;
    }
};

async function upgradeContract(ccVersion) {
    try {
        await executeCmd(`cd ${networkPath} && ./upgradeCC.sh ${ccName} ${ccVersion} && docker ps`);
        return true;
    } catch (error) {
        return error;
    }
};

async function enrollAdmin(admin, adminSecret) {
    return new Promise( async (resolve, reject) => {
        const ccpPath = path.join(networkPath, 'connection-org1.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(ccpJSON);
        const caInfo = ccp.certificateAuthorities[`ca.org1.example.com`];
        const caTLSCACertsPath = path.resolve(networkPath, caInfo.tlsCACerts.path);
        const caTLSCACerts = fs.readFileSync(caTLSCACertsPath);
        const ca = new FabricCAServices(
            caInfo.url, {
                trustedRoots: caTLSCACerts,
                verify: false
            },
            caInfo.caName
        );
        const walletPath = path.join(networkPath, 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const adminExists = await wallet.exists(admin);
        if (adminExists) {
            console.log(`An identity for the admin user ${admin} already exists in the wallet`);
            return reject(`An identity for the admin user ${admin} already exists in the wallet`);
        }
        const enrollment = await ca.enroll({
            enrollmentID: admin,
            enrollmentSecret: adminSecret
        });
        const identity = X509WalletMixin.createIdentity(
            'Org1MSP',
            enrollment.certificate,
            enrollment.key.toBytes()
        );
        wallet.import(admin, identity).then(() => {
            console.log(`Successfully enrolled admin user ${admin} and imported it into the wallet`);
            return resolve(true);
        })
        .catch(err => {
            return reject(err);
        })
    });
};

async function registerUser(admin, appUser) {
    return new Promise( async (resolve, reject) => {
        const ccpPath = path.join(networkPath, 'connection-org1.json');
        const walletPath = path.join(networkPath, 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const userExists = await wallet.exists(appUser);
        if (userExists) {
            console.log(`An identity for the user ${appUser} already exists in the wallet`);
            return reject(`An identity for the user ${appUser} already exists in the wallet`);
        }
        const adminExists = await wallet.exists(admin);
        if (!adminExists) {
            console.log(`An identity for the admin user ${admin} does not exist in the wallet`);
            console.log('Run the enrollAdmin.js application before retrying');
            return reject('Run the enrollAdmin.js application before retrying');
        }
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: admin,
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: appUser,
                role: 'client'
            },
            adminIdentity
        );
        const enrollment = await ca.enroll({
            enrollmentID: appUser,
            enrollmentSecret: secret
        });
        const userIdentity = X509WalletMixin.createIdentity(
            'Org1MSP',
            enrollment.certificate,
            enrollment.key.toBytes()
        );
        wallet.import(appUser, userIdentity).then(() => {
            console.log(`Successfully registered and enrolled admin user ${appUser} and imported it into the wallet`);
            return resolve(true);
        })
        .catch(err => {
            return reject(err);
        })
    });
};

async function transactionExcute(argArray) {
    return new Promise(async (resolve, reject) => {
        const ccpPath = path.join(networkPath, 'connection-org1.json');
        const walletPath = path.resolve(networkPath, 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists('user0');
        if (!userExists) {
            console.log(`An identity for the user 'user0' does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return reject('Run the registerUser.js application before retrying');
        }
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: 'user0',
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract(ccName);

        console.log('transaction inputs ===> ', argArray);
        let result;

        if (argArray[0] === 'submit') {
            // Submit the specified transaction.
            try {
                result = await contract.submitTransaction(...argArray.slice(1));
                console.log('Transaction has been submitted');
            } catch (error) {
                if(error.message.includes('Endorsement has failed')){
                    if(error.endorsements[0].message){
                        return reject({message: error.endorsements[0].message});
                    }
                }
                return reject(error);
            }
            try {
                result = JSON.parse(JSON.parse(JSON.parse(result)));
            } catch (error) {
                try {
                    result = JSON.parse(JSON.parse(result));
                } catch (error) {
                    try {
                        result = JSON.parse(result);
                    } catch (error) {}
                }
            }
        } else if (argArray[0] === 'evaluate') {
            // evaluate the specified transaction.
            try {
                result = await contract.evaluateTransaction(...argArray.slice(1));
                console.log('Query evaluation has been done successfully!');
            } catch (error) {
                if(error.message.includes('Endorsement has failed')){
                    if(error.endorsements[0].message){
                        return reject({message: error.endorsements[0].message});
                    }
                }
                return reject(error);
            }
            try {
                result = JSON.parse(JSON.parse(JSON.parse(result)));
            } catch (error) {
                try {
                    result = JSON.parse(JSON.parse(result));
                } catch (error) {
                    try {
                        result = JSON.parse(result);
                    } catch (error) {}
                }
            }
        } else {
            console.log('Failed to excute transaction: first argument of array must be "submit" or "evaluate"');
            return reject('Failed to excute transaction: first argument of array must be "submit" or "evaluate"! ');
        }
        await gateway.disconnect();
        return resolve(result);
    });
};

async function createAsset(assetObject, values) {
    return await transactionExcute(['submit', 'createAsset', JSON.stringify(assetObject), JSON.stringify(values)]);
};

async function queryAllAsset(asset) {
    return await transactionExcute(['evaluate', 'queryAllAsset', asset]);
};

async function queryAsset(key) {
    return await transactionExcute(['evaluate', 'queryAsset', key]);
};

async function queryAssetByProp(properties) {
    return await transactionExcute(['evaluate', 'queryAssetByProp', JSON.stringify(properties)]);
};

async function updateAsset(key, newProperties) {
    return await transactionExcute(['submit', 'updateAsset', key, JSON.stringify(newProperties)]);
};

async function deleteAsset(key) {
    return await transactionExcute(['submit', 'deleteAsset', key]);
};

module.exports = {
    Network: {
        startNetwork,
        teardownNetwork,
        deployContract,
        upgradeContract
    },
    Asset: {
        createAsset,
        queryAllAsset,
        queryAsset,
        queryAssetByProp,
        updateAsset,
        deleteAsset,
        transactionExcute
    }
};