FROM node:11.10.1

# Prepare Git LFS
WORKDIR /usr/git-lfs

ADD https://github.com/git-lfs/git-lfs/releases/download/v2.7.1/git-lfs-linux-amd64-v2.7.1.tar.gz .
RUN tar -xf ./git-lfs-linux-amd64-v2.7.1.tar.gz
RUN ln -s /usr/git-lfs/git-lfs /bin/git-lfs

# Setup Frontend
WORKDIR /usr/src/frontend

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .
RUN yarn deps

RUN rm -rf components/medicon/node_modules/@types
RUN rm -rf components/mediconLekarny/node_modules/@types

# Build React App
RUN yarn build

# Build Server
RUN yarn buildServer

EXPOSE 3001

CMD ["yarn", "start"]
CMD ["yarn", "server"]
