var express = require("express");
var exphbs = require("express-handlebars");
var routes = require("./controllers/controller.js");
var bodyParser = require("body-parser");

var port = process.env.PORT || 3000;
var app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.engine("html", exphbs({ defaultLayout: "main.html" }));
app.set("view engine", "html");

app.use("/", routes);

app.listen(port, function() {
  console.log("App running on port " + port + "!");
});