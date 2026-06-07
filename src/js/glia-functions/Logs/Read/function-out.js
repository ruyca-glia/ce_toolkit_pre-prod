// read_log.js
async function onInvoke(request, env, kvStoreFactory) {
  const accessKeyId = env["aws:accessKeyId"];
  const secretAccessKey = env["aws:secretAccessKey"];
  const region = env["region"];
  const tableName = env["tableName"];
}
export {
  onInvoke
};
