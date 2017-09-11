# AWS X-Ray for Knex

Unfortunately the official AWS mysql adapter is not working properly when used together with Knex.
So this project aims to allow capturing MySQL queries when using Knex in a reliable way.

Please note that this module is work in progress and currently considered a prototype.

## Installation

To install, simply run

```bash
npm install knex-aws-xray
```

## Usage

This module extends the official `AWSXRay` SDK with a `captureKnex` call. Use it like in the example below.

```js
const AWSXRay = require('aws-xray-sdk');
require('knex-aws-xray')(AWSXRay)
const knex = AWSXRay.captureKnex(require('knex')(config));
```
