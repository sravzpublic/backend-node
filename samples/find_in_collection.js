var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGOLAB_URI;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("sravz");
  dbo.collection("assets").findOne({}, function(err, result) {
    if (err) throw err;
    console.log(result.name);
    db.close();
  });
});
