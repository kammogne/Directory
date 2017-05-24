var
mongoose = require( 'mongoose' ),
winston = require( 'winston' ),
ObjectId = mongoose.Schema.ObjectId;

module.exports = function () {
  winston.debug( 'creating Consultants model' );

  var consultantsSchema = mongoose.Schema({
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
    enterprise: String,
    adId: {
      type: String,
      index: { unique: true }
    },
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
        index: true
      }
    },
    socialMedia: {
        twitter: String,
        github: String,
        linkedin: String,
        facebook: String,
        instagram: String,
        skype: String,
        blogUrl: String
    },
    ad: {
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      mobilePhone: String,
      homePhone: String,
      clientPhone: String
    },
    publicDisclosure: {
      socialMedia: { type: Boolean, default: false }
    },
    skills: [{ _id: ObjectId, name: String, description: String }],
    verticals: [{ _id: ObjectId, name: String, description: String }],
    careerValuationTools: [
        {
            date: Date,
            categories: [{ name: String, ideal: Number, current: Number }]
        }
    ],
    lastUpdatedAt: Date,
    enabled: Boolean
  });

  consultantsSchema.methods.isInRole = function ( role ) {
    return this.roles.lastIndexOf(role) > 0;
  };

  var allMask = {
    firstName: 1,
    lastName: 1,
    email: 1,
    emailNickname: 1,
    adId: 1,
    enterprise: 1,
    "ad.mobilePhone": 1,
    manager: 1,
    skills: 1,
    verticals: 1
  };

  function findCriteria() {
    return { enabled: true };
  }

  function findCriteriaEmailNicknameOrAdId( emailNicknameOrAdId ) {
    var criteria = { '$or': [
        { emailNickname: emailNicknameOrAdId.toLowerCase() },
        { adId: emailNicknameOrAdId.toLowerCase() }
    ]};
    return criteria;
  }

  consultantsSchema.statics.deactivateConsultantsMissingFromAdRefresh = function ( updatedAt, callback ){
    var conditions = {'lastUpdatedAt': { $ne: updatedAt},'enabled':true},
     update = {lastUpdatedAt:updatedAt,enabled: false},
     options = {multi: true};
    return this.update(conditions, update, options,callback);
  };

  consultantsSchema.statics.findAll = function ( callback ) {
    return this.find( findCriteria(), allMask ).lean().exec( callback );
  };

  consultantsSchema.statics.findAllPublic = function ( callback ) {
    return this.find( findCriteria() ).lean().exec( callback );
  };

  consultantsSchema.statics.findByEmailNicknameOrAdIdPublic = function ( emailNicknameOrAdId, callback ) {
    return this.findOne( findCriteriaEmailNicknameOrAdId( emailNicknameOrAdId ) ).lean().exec( callback );
  };


  consultantsSchema.statics.findByEmail = function ( email, callback ) {
    return this.findOne( { email: email }, callback );
  };

  consultantsSchema.statics.findByEmailNicknameOrAdId = function ( emailNicknameOrAdId, callback ) {
    // Cannot be lean() it is used by POST method.
    return this.findOne( findCriteriaEmailNicknameOrAdId( emailNicknameOrAdId ), callback );
  };

  consultantsSchema.statics.findByManagerAdId = function ( adId, callback ) {
    var criteria = findCriteria();
    criteria["manager.adId"] = adId;
    return this.find( criteria ).lean().exec( callback );
  };

  consultantsSchema.statics.getCountsByEnterprise = function( callback ) {
    this.aggregate([
      { $match : { enabled : true } },
      { $project : { enterprise : 1, emailNickname : 1, } },
      { $group : { _id : { enterprise: "$enterprise", emailNickname: "$emailNickname" } } },
      { $group : { _id : { enterprise: "$_id.enterprise" }, count: { $sum: 1 } } },
      { $project : { _id : 0, enterprise: "$_id.enterprise", count: 1, } },
    ]).exec( callback );
  }

  consultantsSchema.statics.getCvtCountsByQuarterAndEnterprise = function( callback ) {
    this.aggregate([
      { $match : { enabled : true } },
      { $unwind : "$careerValuationTools" },

      // Get sumOfCurrent for each CVT
      { $unwind : "$careerValuationTools.categories" },
      { $group : { _id : { enterprise: "$enterprise", emailNickname: "$emailNickname", cvtDate: "$careerValuationTools.date" },
                   sumOfCurrent : { $sum : "$careerValuationTools.categories.current" } } },
      { $project : { _id : 0, enterprise : "$_id.enterprise", emailNickname : "$_id.emailNickname", cvtDate : "$_id.cvtDate", sumOfCurrent : 1, } },

      // Calculate quarter
      { $project : {
         enterprise : 1,
         emailNickname : 1,
         year : { $year: "$cvtDate" },
         quarter : { $subtract: [
             { $divide: [ { $add: [ { $month: "$cvtDate" }, 2 ] }, 3 ] },
             { $mod: [ { $divide: [ { $add: [ { $month: "$cvtDate" }, 2 ] }, 3 ] }, 1 ] }
         ] },
         sumOfCurrent : 1,
        }
      },

      // If multiple CVTs for a consultant in a given quarter/enterprise, reduce to one (avg the sumOfCurrent)
      { $group : { _id : { year: "$year", quarter: "$quarter", enterprise: "$enterprise", emailNickname: "$emailNickname" }, sumOfCurrent : { $avg : "$sumOfCurrent" } } },
      { $project : { _id : 0, year: "$_id.year", quarter: "$_id.quarter", enterprise : "$_id.enterprise", emailNickname : "$_id.emailNickname", sumOfCurrent : 1, } },

      // Group by Quarter/Enterprise, capturing total CVTs and average sumOfCurrent
      { $group : { _id : { year: "$year", quarter: "$quarter", enterprise: "$enterprise" }, count: { $sum: 1 }, avgSumOfCurrent: { $avg: "$sumOfCurrent" } } },
      { $project : { _id : 0, year: "$_id.year", quarter: "$_id.quarter", enterprise : "$_id.enterprise", count: 1, avgSumOfCurrent: 1, } },

      // Group by Quarter, put Enterprises in sub-array
      { $group : { _id : { year: "$year", quarter: "$quarter" }, counts: { $push: { enterprise: "$enterprise", count: "$count", avgSumOfCurrent: "$avgSumOfCurrent", } } } },
      { $project : { _id : 0, year: "$_id.year", quarter: "$_id.quarter", counts: 1, } },
    ]).exec( callback );
  }

  mongoose.model( 'Consultants', consultantsSchema );
};
