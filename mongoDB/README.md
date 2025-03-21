Create keyfile in mongoDB folder for replica set
openssl rand -base64 756 > mongoDB/keyfile && chmod 400 mongoDB/keyfile