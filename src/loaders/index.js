const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');
const passportLoader = require('./passport');
const fabricLoader = require('./fabric');

module.exports = async (app) => {
    try {

        await passportLoader(app);
        await expressLoader(app);
        console.log('- Express Loaded');
    
        await mongooseLoader();
        console.log('- Connected successfully to database');

        await fabricLoader();
        console.log('- Connected successfully to Blockchain');
        
    } catch (error) {
        throw error;
    }
};