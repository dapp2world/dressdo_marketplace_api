# ABCWaas API 

Setup guide to run the service
1. Modify .env.example to .env and make appropriate changes
2. `npm install`
3. `npm start` or `pm2 start npm --name abcwaas-api -- start`
4. Swagger docs should be available on http://localhost:3000/api-docs

sudo docker run -d \
  --name nftapimongodb \
  -p 0.0.0.0:27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=PASSWORD \
  -v nftapi_mongo_data:/data/db \
  mongo

Network Details in metamask
Name: Besu Private Network
RPC URL: http://3.38.125.193:8545
Chain ID: 1337
Currency Symbol: ETH
