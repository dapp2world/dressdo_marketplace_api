FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install -g npm
RUN npm install -g node-gyp

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
