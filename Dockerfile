FROM node:18
LABEL maintainer="contactus@sravz.com"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
HEALTHCHECK  --interval=3m --timeout=3s \
  CMD curl 'http://localhost:3030/api/auth/login'  -H 'Content-Type: application/json'  --data-binary '{"email":"guest123@guest.com","password":"password","rememberMe":true}' --compressed || exit 1

EXPOSE 3030
CMD [ "node", "server.js" ]