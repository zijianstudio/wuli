// Copyright 2023, University of Colorado Boulder

/**
 * From sparky run:
 * pm2 startOrReload sparky.pm2.config.js --update-env
 *
 * In general or for testing run:
 * pm2 start sparky.pm2.config.js
 *
 * Likely to be run as `phet` user on sparky.colorado.edu
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Matt Pennington (PhET Interactive Simulations)
 */

module.exports = {
  apps: [{
    name: 'ct-main',
    cwd: '/data/share/phet/continuous-testing/ct-main/aqua',
    script: 'grunt',
    args: 'continuous-server --localCount=20',
    time: true
  }, {
    name: 'ct-quick',
    cwd: '/data/share/phet/continuous-testing/ct-quick/aqua',
    script: 'grunt',
    args: 'quick-server',
    time: true
  }, {
    name: 'ct-browser-clients',
    cwd: '/data/share/phet/continuous-testing/ct-browser-clients/aqua',
    script: 'grunt',
    args: 'client-server --puppeteerClients=70 --firefoxClients=30 --serverURL=http://127.0.0.1',
    time: true
  }]
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwiYXBwcyIsIm5hbWUiLCJjd2QiLCJzY3JpcHQiLCJhcmdzIiwidGltZSJdLCJzb3VyY2VzIjpbInNwYXJreS5wbTIuY29uZmlnLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGcm9tIHNwYXJreSBydW46XHJcbiAqIHBtMiBzdGFydE9yUmVsb2FkIHNwYXJreS5wbTIuY29uZmlnLmpzIC0tdXBkYXRlLWVudlxyXG4gKlxyXG4gKiBJbiBnZW5lcmFsIG9yIGZvciB0ZXN0aW5nIHJ1bjpcclxuICogcG0yIHN0YXJ0IHNwYXJreS5wbTIuY29uZmlnLmpzXHJcbiAqXHJcbiAqIExpa2VseSB0byBiZSBydW4gYXMgYHBoZXRgIHVzZXIgb24gc3Bhcmt5LmNvbG9yYWRvLmVkdVxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGFwcHM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogJ2N0LW1haW4nLFxyXG4gICAgICBjd2Q6ICcvZGF0YS9zaGFyZS9waGV0L2NvbnRpbnVvdXMtdGVzdGluZy9jdC1tYWluL2FxdWEnLFxyXG4gICAgICBzY3JpcHQ6ICdncnVudCcsXHJcbiAgICAgIGFyZ3M6ICdjb250aW51b3VzLXNlcnZlciAtLWxvY2FsQ291bnQ9MjAnLFxyXG4gICAgICB0aW1lOiB0cnVlXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnY3QtcXVpY2snLFxyXG4gICAgICBjd2Q6ICcvZGF0YS9zaGFyZS9waGV0L2NvbnRpbnVvdXMtdGVzdGluZy9jdC1xdWljay9hcXVhJyxcclxuICAgICAgc2NyaXB0OiAnZ3J1bnQnLFxyXG4gICAgICBhcmdzOiAncXVpY2stc2VydmVyJyxcclxuICAgICAgdGltZTogdHJ1ZVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ2N0LWJyb3dzZXItY2xpZW50cycsXHJcbiAgICAgIGN3ZDogJy9kYXRhL3NoYXJlL3BoZXQvY29udGludW91cy10ZXN0aW5nL2N0LWJyb3dzZXItY2xpZW50cy9hcXVhJyxcclxuICAgICAgc2NyaXB0OiAnZ3J1bnQnLFxyXG4gICAgICBhcmdzOiAnY2xpZW50LXNlcnZlciAtLXB1cHBldGVlckNsaWVudHM9NzAgLS1maXJlZm94Q2xpZW50cz0zMCAtLXNlcnZlclVSTD1odHRwOi8vMTI3LjAuMC4xJyxcclxuICAgICAgdGltZTogdHJ1ZVxyXG4gICAgfVxyXG4gIF1cclxufTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBQSxNQUFNLENBQUNDLE9BQU8sR0FBRztFQUNmQyxJQUFJLEVBQUUsQ0FDSjtJQUNFQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxHQUFHLEVBQUUsa0RBQWtEO0lBQ3ZEQyxNQUFNLEVBQUUsT0FBTztJQUNmQyxJQUFJLEVBQUUsbUNBQW1DO0lBQ3pDQyxJQUFJLEVBQUU7RUFDUixDQUFDLEVBQ0Q7SUFDRUosSUFBSSxFQUFFLFVBQVU7SUFDaEJDLEdBQUcsRUFBRSxtREFBbUQ7SUFDeERDLE1BQU0sRUFBRSxPQUFPO0lBQ2ZDLElBQUksRUFBRSxjQUFjO0lBQ3BCQyxJQUFJLEVBQUU7RUFDUixDQUFDLEVBQ0Q7SUFDRUosSUFBSSxFQUFFLG9CQUFvQjtJQUMxQkMsR0FBRyxFQUFFLDZEQUE2RDtJQUNsRUMsTUFBTSxFQUFFLE9BQU87SUFDZkMsSUFBSSxFQUFFLHNGQUFzRjtJQUM1RkMsSUFBSSxFQUFFO0VBQ1IsQ0FBQztBQUVMLENBQUMifQ==