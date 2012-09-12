module.exports = class Router extends Backbone.Router
  routes: 
    "": "root"
    "CodeCards": "main"
    "remote": "remote"
    ":404": "root"