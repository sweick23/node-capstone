exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://shane:weickum23@ds155150.mlab.com:55150/blogapp';
exports.PORT = process.env.PORT || 8080;

exports.TEST_DATABASE_URL = (process.env.TEST_DATABASE_URL ||

                      'mongodb://shane:weickum23@ds155150.mlab.com:55150/blogapp');
exports.PORT = process.env.PORT || 8080;
