import DKG from '../index.js';
import 'dotenv/config';

const OT_NODE_HOSTNAME = 'https://v6-pegasus-node-03.origin-trail.network';
const OT_NODE_PORT = '8900';
const BLOCKCHAIN_NAME = 'otp:20430';

// IMPORTANT: Don't forget to add your PRIVATE_KEY to the .env file.
const DkgClient = new DKG({
    endpoint: OT_NODE_HOSTNAME,
    port: OT_NODE_PORT,
    blockchain: {
        name: BLOCKCHAIN_NAME,
        privateKey: process.env.PRIVATE_KEY,
    },
    maxNumberOfRetries: 300,
    frequency: 2,
    contentType: 'all',
    nodeApiVersion: '/v1',
});

(async () => {
    const content = {
        public: {
            '@context': 'https://www.schema.org',
            '@id': 'urn:us-cities:info:new-york',
            '@type': 'City',
            name: 'New York',
            state: 'New York',
            population: '8,336,817',
            area: '468.9 sq mi',
            mayor:{
                '@id':'urn:akshay:dhayal:1',
                'name':'Akshay',
                'lastname':'Dhayal'
            }
        }
    };

    const nodeInfo = await DkgClient.node.info();
    console.log('======================== NODE INFO RECEIVED');
    console.log(nodeInfo);

    const create_result = await DkgClient.asset.create(content, {
        epochsNum: 2,
        minimumNumberOfFinalizationConfirmations: 3,
        minimumNumberOfNodeReplications: 1,
    });

    console.log(create_result);

    const get_result = await DkgClient.asset.get(create_result.UAL, {
        contentType: 'all',
    });
    console.log('======================== ASSET GET');
    console.log(get_result);
})();
