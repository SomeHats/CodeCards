#### /Router
# define names for different URLs
# E.G. dir/#CodeCards loads codecards. dir/#remote loads the remote control.
# dir/ everything else loads the landing view.

module.exports = class Router extends Backbone.Router
  routes: 
    "": "root"
    "CodeCards": "codecards"
    "remote": "remote"
    ":404": "root"