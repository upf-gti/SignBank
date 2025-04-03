import { Client } from 'typesense';

const typesense = new Client({
    nodes: [
        {
            host: 'typesense', // Your Typesense host
            port: 8108, // Your Typesense port
            protocol: 'http',
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY,
});

export default typesense;
