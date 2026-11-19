
FROM node

COPY package.json /data/
WORKDIR /data/
RUN npm install --force
ENV PATH /data/node_modules/.bin:$PATH

COPY . /data/app/
WORKDIR /data/app/
