angular.module( 'app' ).factory( 'dirConsultants', function ( $resource, $filter ) {
  var ConsultantResource = $resource( '/api/consultants/:id', { id: "@emailNickname" }, {
    get: {
      method: 'GET',
      transformResponse: function(data, headers) {
        var value = angular.fromJson(data);
        attachCvtProperties(value.careerValuationTools);
        return value;
      }
    }
  });

  function attachCvtProperties(cvt) {
    if (!cvt)
      return;

    if (angular.isArray(cvt)) {
      angular.forEach(cvt, function(c) { attachCvtProperties(c); });
      return;
    }

    Object.defineProperty(cvt, 'formattedDate', {
        get: function(){
          // truncate timezone so date is treated as local, displayed without offset
          this.date = this.date.replace('Z', '');
          var formatted = $filter('date')(this.date, 'MMMM d, y');
          //$log.info('formattedDate.get() - date: ' + this.date + ', _formattedDate: ' + this._formattedDate + ', formatted: ' + formatted + ', result: ' + this._formattedDate || formatted);
          return this._formattedDate || formatted;
        },
        set: function(newValue){
          //$log.info('formattedDate.set(' + newValue + ')');

          this._formattedDate = newValue || "";

          // format is 'MMMM d, y' (e.g. September 3, 2010)
          var match = this._formattedDate.match(/(\w+) (\d\d?), (\d\d\d\d)/);
          //$log.info('match: ' + JSON.stringify(match));

          if (match === null) {
            // copy invalid values to date, just to prevent out-of-sync issues
            this.date = this._formattedDate;
          }
          else {
            var month = (new Date(match[1] + " 1, 2000").getMonth() + 1)+"";
            var date = match[2];
            var year = match[3];
            month = (month.length === 1 ? "0" : "") + month;
            date = (date.length === 1 ? "0" : "") + date;
            this.date = year + '-' + month + '-' + date; // ISO expected by back-end
            //$log.info('month: ' + month + ', date: ' + date + ', year: ' + year + ', this.date: ' + this.date);
          }
        }
    });

    Object.defineProperty(cvt, 'totalIdeal', {
        get: function(){
          var totalIdeal = 0;
          angular.forEach(this.categories, function(category) {
            totalIdeal += category.ideal*1;
          });
          return totalIdeal;
        },
    });

    Object.defineProperty(cvt, 'totalCurrent', {
        get: function(){
          var totalCurrent = 0;
          angular.forEach(this.categories, function(category) {
            totalCurrent += category.current*1;
          });
          return totalCurrent;
        },
    });
  }

  // Extending the ConsultantResource (via prototype) extends every instance
  //  returned by the ConsultantResource.  Per the documentation:
  //  "When the data is returned from the server then the object is an instance of the resource class.""

  ConsultantResource.prototype.isInRole = function ( role ) {
    return this.roles && this.roles.indexOf( role ) > -1;
  };

  ConsultantResource.prototype.addCvt = function () {
    var newCvt = {
      'date' : new Date().toISOString().substring(0, 10),
      'categories' : [
        { 'name' : 'Professional Fit', 'ideal' : '', 'current' : '' },
        { 'name' : 'Personal Fit', 'ideal' : '', 'current' : '' },
        { 'name' : 'Cultural Fit', 'ideal' : '', 'current' : '' },
        { 'name' : 'Growth & Learning', 'ideal' : '', 'current' : '' },
        { 'name' : 'Recognition', 'ideal' : '', 'current' : '' },
        { 'name' : 'Financial', 'ideal' : '', 'current' : '' }
      ]
    };
    attachCvtProperties(newCvt);
    this.careerValuationTools.push(newCvt);
    return newCvt;
  };

  // $save wrapper
  ConsultantResource.prototype._resourceSave = ConsultantResource.prototype.$save;
  ConsultantResource.prototype.$save = function (success, error) {
    this._resourceSave(function (consultant) {
      attachCvtProperties(consultant.careerValuationTools);
      success();
    }, error);
  };

  return ConsultantResource;
});
