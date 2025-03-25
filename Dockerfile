FROM node:18.16.0-bullseye AS dist

COPY package.json yarn.lock ./
# RUN apk add g++ make py3-pip
# RUN yarn config set network-timeout 600000 -g
# RUN yarn cache clean
RUN yarn install

COPY . ./
RUN yarn build


FROM node:18.16.0-bullseye AS node_modules

COPY package.json yarn.lock ./
# RUN apk add g++ make py3-pip
# RUN yarn config set network-timeout 600000 -g
# RUN yarn cache clean
RUN yarn install --prod


FROM node:18.16.0-alpine3.18

ARG PORT=3000

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# RUN apk add g++ make py3-pip
COPY --from=dist dist /usr/src/app/dist
COPY --from=node_modules node_modules /usr/src/app/node_modules
COPY . /usr/src/app

EXPOSE $PORT

CMD ["yarn", "start:prod"]
