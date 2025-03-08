# ABCWaas API 

Setup guide to run the service
1. Modify .env.example to .env and make appropriate changes
2. `npm install`
3. `npm start` or `pm2 start npm --name abcwaas-api -- start`
4. Swagger docs should be available on http://localhost:3000/api-docs

Admin Address = 0x435050e332523ca7391eac5bebf083a808a41e8c040072c35c279aa816633206 0x46072601dae4184b348a632f41f23cff675e61d1
sudo docker run -d \
  --name nftapimongodb \
  -p 0.0.0.0:27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=PASSWORD \
  -v nftapi_mongo_data:/data/db \
  mongo


Besu Network Validator:
Private key: 0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63
public key: 0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73

Network Details in metamask
Name: Besu Private Network
RPC URL: http://3.38.125.193:8545
Chain ID: 1337
Currency Symbol: ETH
