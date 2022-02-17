# Grocery Store

## Prerequisites

[NodeJs](https://nodejs.org) `>= 16.13.1`

[npmjs](https://www.npmjs.com/) `>= 8.1.2`

[nodemon](https://nodemon.io/) `>= 2.0.15`

[git](https://git-scm.com/downloads) `>= 2.32.0`

[mongodb](https://www.mongodb.com) `>= 5.0.4`

## Installing / Getting started

A quick introduction of the minimal setup you need to get up & running

```shell
git clone git@github.com:SlavenBesevic/grocery-store.git
cd grocery-store
npm i
```

## Configuration

To run a project in a `development.local` environment run

```shell
npm start
```

Do note that `.env.development.local` file must be present in order to run the project.
Required environment variables:

```shell
NODE_ENV
PORT
JWT_SECRET
JWT_ALGORITHMS
MONGO_DB
```

To setup database run

```shell
npm run init-db
```

## Tests

To run API releated tests run

```shell
npm test
```

`.env.development.local` file must be present in order to test the project.
File example:

```shell
NODE_ENV='test'
PORT=8011
JWT_SECRET=123
JWT_ALGORITHMS='HS256'
MONGO_DB='mongodb://localhost:27017/grocery_store_test'
```
