module.exports.main = (event, context, callback) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  headers["x-serverless-time"] = [
    { key: "x-serverless-time", value: Date.now().toString() },
  ];

  return callback(null, response);
};
