module.exports = class Router extends Backbone.Router
  routes: 
    "": "root"
    "CodeCards": "main"
    ":404": "root"