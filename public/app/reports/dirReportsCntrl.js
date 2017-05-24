angular.module( 'app' ).controller( 'dirReportsCntrl', function ( $scope, $filter, dirConsultants) {

  dirConsultants.query({ id: 'getCountsByEnterprise' }, function ( data ) {
    //$log.info('dirReportsCntrl - getCountsByEnterprise: ' + JSON.stringify(data));
    $scope.countsByEnterprise = data;
  });

  dirConsultants.query({ id: 'getCvtCountsByQuarterAndEnterprise' }, function ( data ) {
    //$log.info('dirReportsCntrl - getCvtCountsByQuarterAndEnterprise: ' + JSON.stringify(data));

    $scope.countsByEnterprise.$promise.then(function() {
      //$log.info('dirReportsCntrl - then 1 - data: '+ JSON.stringify(data, null, 2));
      //$log.info('dirReportsCntrl - then 2 - $scope.countsByEnterprise: ' + JSON.stringify($scope.countsByEnterprise, null, 2));

      // Merge current consultant counts into current quarter data
      if ( data && $scope.countsByEnterprise ) {

        var currentQuarter = $filter('orderBy')(data, '[year,quarter]', true)[0];
        //$log.info('dirReportsCntrl - then 3 - currentQuarter: ' + JSON.stringify(currentQuarter, null, 2));

        // Enumerate through current per-enterprise counts
        angular.forEach($scope.countsByEnterprise, function(value) {
          // Get enterprise in current quarter data (create if needed)
          var currentQuarterEnterprise = $filter('filter')(currentQuarter.counts, {enterprise: value.enterprise}, true)[0];
          if (currentQuarterEnterprise == null) {
            currentQuarterEnterprise = { enterprise: value.enterprise, count: 0 };
            currentQuarter.counts.push(currentQuarterEnterprise);
          }
          // Set total, percentage
          currentQuarterEnterprise.total = value.count;
          currentQuarterEnterprise.percentage = currentQuarterEnterprise.count / currentQuarterEnterprise.total;
          //$log.info('dirReportsCntrl - then 4 - currentQuarterEnterprise: ' + JSON.stringify(currentQuarterEnterprise, null, 2));
        });

        //$log.info('dirReportsCntrl - then 5 - currentQuarter: ' + JSON.stringify(currentQuarter, null, 2));
      }
    });

    $scope.cvtCountsByQuarterAndEnterprise = data;
  });

  $scope.tab = 'tab-cvts';
});
