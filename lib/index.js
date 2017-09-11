const DATABASE_VERS = process.env.MYSQL_DATABASE_VERSION;
const DRIVER_VERS = process.env.MYSQL_DRIVER_VERSION;

var AWSXRay;
var SqlData;
var knex;
var openSegments = {};

function captureKnex(target) {
  knex = target
  
  target.on('query', openSubsegment)
    .on('query-response', closeSubsegment)
    .on('query-error', closeSubsegmentWithError)

  return target
}
  
function getSegmentName() {
  return knex.client.config.connection.database + '@' + knex.client.config.connection.host
}

function getSQLServerURL() {
  return knex.client.config.host 
    + ':' 
    + ((knex.client.config.port != undefined) ? knex.client.config.port : '3306') 
    + '/' 
    + knex.client.config.database
}

function closeSubsegment(response, { __knexQueryUid: queryId }) {
  const subsegment = openSegments[queryId]

  if (!subsegment) { return; }

  subsegment.close()
  delete openSegments[uuid]
}

function closeSubsegmentWithError(err, { __knexQueryUid: queryId }) {
  const subsegment = openSegments[queryId]

  if (!subsegment) { return; }

  subsegment.close(err)
  delete openSegments[uuid]
}

function openSubsegment({method, sql, bindings, __knexQueryUid: queryId }) {
  const parent = AWSXRay.getSegment();

  if (!parent) { return; }

  const payload = new SqlData(DATABASE_VERS, DRIVER_VERS, knex.client.config.user, getSQLServerURL(), method);
  payload['sanitized_query'] = sql
  
  const subsegment = parent.addNewSubsegment(getSegmentName());
  subsegment.addSqlData(payload);
  subsegment.namespace = 'remote';

  openSegments[queryId] = subsegment
}

module.exports = function (xray) {
  AWSXRay = xray;
  SqlData = AWSXRay.database.SqlData;
  AWSXRay["captureKnex"] = captureKnex;
}
