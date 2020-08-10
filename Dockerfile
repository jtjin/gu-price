FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json /usr/src/app/
RUN npm install && npm cache clean --force

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000
CMD [ "node", "app.js" ]