var
auth = require( './auth' ),
passport = require( 'passport' ),
consultantsCntrl = require( '../controllers/consultantsCntrl' ),
locationsCntrl = require('../controllers/locationsCntrl'),
adCntrl = require( '../controllers/adCntrl' ),
skillsCntrl = require( '../controllers/skillsCntrl'),
requestSkillCntrl = require( '../controllers/requestSkillCntrl'),
approveSkillCntrl = require( '../controllers/approveSkillCntrl'),
skillLevelsCntrl = require( '../controllers/skillLevelsCntrl'),
verticalsCntrl = require( '../controllers/verticalsCntrl'),
newsCntrl = require( '../controllers/newsCntrl'),
releaseNotesCntrl = require( '../controllers/releaseNotesCntrl'),
winston = require( 'winston' );

module.exports = function ( app, config ) {
  winston.debug( 'creating routes' );

  app.get( '/api/config', auth.requiresApiLogin, 
    function(req, res) { res.send(config.getClientConfig()); });

  app.get( '/public/api/consultants', consultantsCntrl.publicGetAll );
  app.get( '/public/api/consultants/:id', consultantsCntrl.publicGet );

  app.get( '/api/consultants/getCountsByEnterprise', auth.requiresManager, consultantsCntrl.getCountsByEnterprise );
  app.get( '/api/consultants/getCvtCountsByQuarterAndEnterprise', auth.requiresManager, consultantsCntrl.getCvtCountsByQuarterAndEnterprise );

  app.get( '/api/consultants', auth.requiresApiLogin, consultantsCntrl.getAll );
  app.get( '/api/consultants/:id', auth.requiresApiLogin, consultantsCntrl.get );
  app.post( '/api/consultants/:id', auth.requiresApiLogin, consultantsCntrl.post );

  app.get( '/api/locations', auth.requiresApiLogin, locationsCntrl.getAll );

  app.get( '/api/requestSkill', auth.requiresApiLogin, requestSkillCntrl.getAll );
  app.post( '/api/requestSkill/:id', auth.requiresApiLogin, requestSkillCntrl.post);

    app.get( '/api/approveSkill/:id', auth.requiresApiLogin, approveSkillCntrl.get );
    app.post( '/api/approveSkill/:id', auth.requiresApiLogin, approveSkillCntrl.post );

  app.get( '/api/skillLevels', auth.requiresApiLogin, skillLevelsCntrl.getAll );

  app.get('/api/skills', auth.requiresApiLogin, skillsCntrl.getAll );
  app.post( '/api/skills/:id', auth.requiresApiLogin, skillsCntrl.post);
  app.delete( '/api/skills/:id', auth.requiresApiLogin, skillsCntrl.delete);

  app.get('/api/verticals', auth.requiresApiLogin, verticalsCntrl.getAll );
  app.post('/api/verticals/:id', auth.requiresApiLogin, verticalsCntrl.post);
  app.delete('/api/verticals/:id', auth.requiresApiLogin, verticalsCntrl.delete);

  app.get('/api/news', newsCntrl.getAll );
  app.get('/api/releaseNotes', releaseNotesCntrl.getAll );

  app.get( '/api/ad/refresh', auth.requiresRole( 'Active Employees' ), adCntrl.refresh );

  app.get( '/partials/*', function ( req, res ) {
    res.render( '../../public/app/' + req.params[ "0" ]);
  });

  // WsFed Related Routes
  // -------------------------------------------------------------
  app.get( '/login',
  passport.authenticate( 'wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
  function ( req, res ) {
    var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
    delete req.session.redirect_to;
    res.redirect( redirect_to );
  });

  app.post( '/login/callback',
  passport.authenticate( 'wsfed-saml2', { failureRedirect: '/', failureFlash: true }),
  function ( req, res ) {
    var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
    delete req.session.redirect_to;
    res.redirect( redirect_to );
  });

  app.get( '/logout', function ( req, res ) {
    // clear the passport session cookies
    req.logout();

    // We need to redirect the user to the WSFED logout endpoint so the
    // auth token will be revoked
    config.passport.strategy.logout({}, function ( err, url ) {
      if ( err ) {
        res.redirect( '/' );
      } else {
        res.redirect( url );
      }
    });
  });

  // Catch-Alls
  // -------------------------------------------------------------
  app.all( '/api/*', function ( req, res ) {
    res.send( 404 );
  });

  app.get( '*', function ( req, res ) {
    delete req.session.redirect_to;
    res.render( 'index', {
      bootstrappedUser: req.user
    });
  });

};
