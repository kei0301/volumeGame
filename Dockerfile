FROM node:16-alpine as pricegame
# RUN apk add --no-cache python g++ make tree
WORKDIR /app
COPY . .
RUN yarn install 
# RUN yarn build
RUN npm install -g pm2
CMD ["yarn", "serve:all"]

FROM node:16-alpine as contract
# RUN apk add --no-cache python g++ make tree
WORKDIR /app
COPY . .
RUN yarn install 
# RUN yarn build
RUN npm install -g pm2
CMD ["yarn", "run:bot:testnet"]