import { Client } from 'typesense';

const typesense = new Client({
    nodes: [
        {
            host: 'typesense', // Your Typesense host
            port: 8108, // Your Typesense port
            protocol: 'http',
        },
    ],
    apiKey: 'xyz123',
});

export default typesense;
