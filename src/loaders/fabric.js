const { Fabric } = require('../services');

module.exports = async () => {
    return new Promise( async (resolve, reject) => {
        Fabric.Asset.transactionExcute(['evaluate', 'test'])
        .then(() => {
            return resolve(true);
        })
        .catch(err => {
            return reject({message: 'couldn\'t connect to blockchain network or contract, please make sure u started the network probably!'});
        })
    });
};