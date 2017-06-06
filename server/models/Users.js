var
mongoose = require( 'mongoose' ),
winston = require( 'winston' );

module.exports = function () {
  winston.debug( 'creating Users model' );

  var userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: { unique: true }
    },
    emailNickname: {
      type: String,
      lowercase: true,
      trim: true,
      index: { unique: true }
    },
    adId: String,
    roles: [ String ],
      manager: {
          name: String,
          emailNickname: {
              type: String,
              lowercase: true,
              trim: true,
              index: true
          },
          adId: {
              type: String,
              index: { unique: true }
          },
          email: {
              type: String,
              lowercase: true,
              trim: true,
              index: { unique: true }
          }
      }
  });

  userSchema.methods = {
    copyFromProfile: function ( profile ) {
      this.email = profile.email;
      this.firstName = profile.givenName;
      this.lastName = profile.familyName;
      this.adId = profile.id;
      this.roles = [];
      this.manager = {};
      return this;
    }
  };

  userSchema.statics.findAll = function ( callback ) {
    this.find({}, callback );
  };

  userSchema.statics.findByEmail = function ( email, callback ) {
    this.findOne({ email: email.toLowerCase()}, callback );
  };

  mongoose.model( 'Users', userSchema );
};
