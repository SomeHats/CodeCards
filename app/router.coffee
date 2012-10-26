module.exports = class Router extends Backbone.Router
  routes: 
    "": "root"
    "CodeCards": "codecards"
    "remote": "remote"
    ":404": "root"