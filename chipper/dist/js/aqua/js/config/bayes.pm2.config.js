// Copyright 2023, University of Colorado Boulder

/**
 * From bayes run:
 * pm2 startOrReload bayes.pm2.config.js --update-env
 *
 * In general or for testing run:
 * pm2 start bayes.pm2.config.js
 *
 * Likely to be run as `phet` user on sparky.colorado.edu
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Matt Pennington (PhET Interactive Simulations)
 */

module.exports = {
  apps: [{
    name: 'yotta-server',
    cwd: '/data/share/phet/yotta-statistics/yotta/',
    script: 'js/reports/yotta-server.js',
    time: true
  }, {
    name: 'phettest-server',
    cwd: '/data/web/htdocs/dev/phettest/phettest',
    script: 'phettest-server.js',
    time: true
  }, {
    name: 'ct-browser-clients',
    cwd: '/data/share/phet/continuous-testing/ct-browser-clients/aqua',
    script: 'grunt',
    time: true,
    args: 'client-server --puppeteerClients=16 --ctID=Bayes'
  }, {
    name: 'monday-server',
    cwd: '/data/share/phet/monday/monday',
    script: 'app.js',
    time: true
  }]
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwiYXBwcyIsIm5hbWUiLCJjd2QiLCJzY3JpcHQiLCJ0aW1lIiwiYXJncyJdLCJzb3VyY2VzIjpbImJheWVzLnBtMi5jb25maWcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZyb20gYmF5ZXMgcnVuOlxyXG4gKiBwbTIgc3RhcnRPclJlbG9hZCBiYXllcy5wbTIuY29uZmlnLmpzIC0tdXBkYXRlLWVudlxyXG4gKlxyXG4gKiBJbiBnZW5lcmFsIG9yIGZvciB0ZXN0aW5nIHJ1bjpcclxuICogcG0yIHN0YXJ0IGJheWVzLnBtMi5jb25maWcuanNcclxuICpcclxuICogTGlrZWx5IHRvIGJlIHJ1biBhcyBgcGhldGAgdXNlciBvbiBzcGFya3kuY29sb3JhZG8uZWR1XHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgYXBwczogW1xyXG4gICAge1xyXG4gICAgICBuYW1lOiAneW90dGEtc2VydmVyJyxcclxuICAgICAgY3dkOiAnL2RhdGEvc2hhcmUvcGhldC95b3R0YS1zdGF0aXN0aWNzL3lvdHRhLycsXHJcbiAgICAgIHNjcmlwdDogJ2pzL3JlcG9ydHMveW90dGEtc2VydmVyLmpzJyxcclxuICAgICAgdGltZTogdHJ1ZVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BoZXR0ZXN0LXNlcnZlcicsXHJcbiAgICAgIGN3ZDogJy9kYXRhL3dlYi9odGRvY3MvZGV2L3BoZXR0ZXN0L3BoZXR0ZXN0JyxcclxuICAgICAgc2NyaXB0OiAncGhldHRlc3Qtc2VydmVyLmpzJyxcclxuICAgICAgdGltZTogdHJ1ZVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ2N0LWJyb3dzZXItY2xpZW50cycsXHJcbiAgICAgIGN3ZDogJy9kYXRhL3NoYXJlL3BoZXQvY29udGludW91cy10ZXN0aW5nL2N0LWJyb3dzZXItY2xpZW50cy9hcXVhJyxcclxuICAgICAgc2NyaXB0OiAnZ3J1bnQnLFxyXG4gICAgICB0aW1lOiB0cnVlLFxyXG4gICAgICBhcmdzOiAnY2xpZW50LXNlcnZlciAtLXB1cHBldGVlckNsaWVudHM9MTYgLS1jdElEPUJheWVzJ1xyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ21vbmRheS1zZXJ2ZXInLFxyXG4gICAgICBjd2Q6ICcvZGF0YS9zaGFyZS9waGV0L21vbmRheS9tb25kYXknLFxyXG4gICAgICBzY3JpcHQ6ICdhcHAuanMnLFxyXG4gICAgICB0aW1lOiB0cnVlXHJcbiAgICB9XHJcbiAgXVxyXG59OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFBLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHO0VBQ2ZDLElBQUksRUFBRSxDQUNKO0lBQ0VDLElBQUksRUFBRSxjQUFjO0lBQ3BCQyxHQUFHLEVBQUUsMENBQTBDO0lBQy9DQyxNQUFNLEVBQUUsNEJBQTRCO0lBQ3BDQyxJQUFJLEVBQUU7RUFDUixDQUFDLEVBQ0Q7SUFDRUgsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QkMsR0FBRyxFQUFFLHdDQUF3QztJQUM3Q0MsTUFBTSxFQUFFLG9CQUFvQjtJQUM1QkMsSUFBSSxFQUFFO0VBQ1IsQ0FBQyxFQUNEO0lBQ0VILElBQUksRUFBRSxvQkFBb0I7SUFDMUJDLEdBQUcsRUFBRSw2REFBNkQ7SUFDbEVDLE1BQU0sRUFBRSxPQUFPO0lBQ2ZDLElBQUksRUFBRSxJQUFJO0lBQ1ZDLElBQUksRUFBRTtFQUNSLENBQUMsRUFDRDtJQUNFSixJQUFJLEVBQUUsZUFBZTtJQUNyQkMsR0FBRyxFQUFFLGdDQUFnQztJQUNyQ0MsTUFBTSxFQUFFLFFBQVE7SUFDaEJDLElBQUksRUFBRTtFQUNSLENBQUM7QUFFTCxDQUFDIn0=