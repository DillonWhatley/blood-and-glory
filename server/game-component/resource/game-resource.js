var gameService = require('../service/game-service');
var avatarService = require('../avatars/avatar-service');
var authenticationInterceptor = require('../../middleware/authentication-interceptor');
module.exports = function(app, io) {
  app.post('/game', authenticationInterceptor, function(request, response) {
    gameService.create(function(err, game) {
      if (err) {
        console.log('Error in db query.');
        response.sendStatus(400).send('Game could not be initialized.');
      }
      var gameInstance = io.of('/' + game.id);
      gameInstance.on('connection', function(socket) {
        console.log(request.session.passport.user + ' connected');
        gameInstance.emit('welcome', ['Welcome to game instance:' + game.id]);
        socket.on('disconnect', function() {
          console.log('user disconnected');
        });
      });
      setInterval(function() {
        var events = [];
        for (var i = 0; i < 10; i++) {
          events = events.concat(gameService.processEvent(game, null, null));
        }
        gameInstance.emit('game-world-event', events);
      }, 1000);
      response.send({
        'data': game.id
      });
    });
  });

  app.get('/avatars', authenticationInterceptor, function(request, response) {
    response.send({
      'data': [{
        'id': 1,
        'name': 'MainChar',
        'avatarClass': 'Warrior',
        'strength': 10,
        'dexterity': 10,
        'intelligence': 10,
        'luck': 10,
        'endurance': 10,
        'charisma': 10,
        'inventory': []
      }]
    });
  });

  app.post('/avatars', authenticationInterceptor, function(request, response) {
    avatarService.create(request.body, function(err, avatar) {
      if (err) {
        console.log('Error in db query.');
        response.sendStatus(400).send('Invalid avatar');
      }
      response.sendStatus(200);
    });
  });
};
