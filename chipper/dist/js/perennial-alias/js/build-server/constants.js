// Copyright 2017, University of Colorado Boulder

/**
 * Constants required for the build-server
 *
 * @author Matt Pennington
 */

const fs = require('graceful-fs'); // eslint-disable-line require-statement-match
const getBuildServerConfig = require('./getBuildServerConfig');
const BUILD_SERVER_CONFIG = getBuildServerConfig(fs);
module.exports = {
  BUILD_SERVER_CONFIG: BUILD_SERVER_CONFIG,
  LISTEN_PORT: 16371,
  HTML_SIMS_DIRECTORY: BUILD_SERVER_CONFIG.htmlSimsDirectory,
  PHET_IO_SIMS_DIRECTORY: BUILD_SERVER_CONFIG.phetioSimsDirectory,
  REPOS_KEY: 'repos',
  DEPENDENCIES_KEY: 'dependencies',
  LOCALES_KEY: 'locales',
  API_KEY: 'api',
  SIM_NAME_KEY: 'simName',
  VERSION_KEY: 'version',
  OPTION_KEY: 'option',
  EMAIL_KEY: 'email',
  BRANCH_KEY: 'branch',
  USER_ID_KEY: 'userId',
  TRANSLATOR_ID_KEY: 'translatorId',
  AUTHORIZATION_KEY: 'authorizationCode',
  SERVERS_KEY: 'servers',
  BRANDS_KEY: 'brands',
  PRODUCTION_SERVER: 'production',
  DEV_SERVER: 'dev',
  PHET_BRAND: 'phet',
  PHET_IO_BRAND: 'phet-io',
  ENGLISH_LOCALE: 'en',
  PERENNIAL: '.'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJnZXRCdWlsZFNlcnZlckNvbmZpZyIsIkJVSUxEX1NFUlZFUl9DT05GSUciLCJtb2R1bGUiLCJleHBvcnRzIiwiTElTVEVOX1BPUlQiLCJIVE1MX1NJTVNfRElSRUNUT1JZIiwiaHRtbFNpbXNEaXJlY3RvcnkiLCJQSEVUX0lPX1NJTVNfRElSRUNUT1JZIiwicGhldGlvU2ltc0RpcmVjdG9yeSIsIlJFUE9TX0tFWSIsIkRFUEVOREVOQ0lFU19LRVkiLCJMT0NBTEVTX0tFWSIsIkFQSV9LRVkiLCJTSU1fTkFNRV9LRVkiLCJWRVJTSU9OX0tFWSIsIk9QVElPTl9LRVkiLCJFTUFJTF9LRVkiLCJCUkFOQ0hfS0VZIiwiVVNFUl9JRF9LRVkiLCJUUkFOU0xBVE9SX0lEX0tFWSIsIkFVVEhPUklaQVRJT05fS0VZIiwiU0VSVkVSU19LRVkiLCJCUkFORFNfS0VZIiwiUFJPRFVDVElPTl9TRVJWRVIiLCJERVZfU0VSVkVSIiwiUEhFVF9CUkFORCIsIlBIRVRfSU9fQlJBTkQiLCJFTkdMSVNIX0xPQ0FMRSIsIlBFUkVOTklBTCJdLCJzb3VyY2VzIjpbImNvbnN0YW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29uc3RhbnRzIHJlcXVpcmVkIGZvciB0aGUgYnVpbGQtc2VydmVyXHJcbiAqXHJcbiAqIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uXHJcbiAqL1xyXG5cclxuXHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2dyYWNlZnVsLWZzJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlcXVpcmUtc3RhdGVtZW50LW1hdGNoXHJcbmNvbnN0IGdldEJ1aWxkU2VydmVyQ29uZmlnID0gcmVxdWlyZSggJy4vZ2V0QnVpbGRTZXJ2ZXJDb25maWcnICk7XHJcblxyXG5jb25zdCBCVUlMRF9TRVJWRVJfQ09ORklHID0gZ2V0QnVpbGRTZXJ2ZXJDb25maWcoIGZzICk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBCVUlMRF9TRVJWRVJfQ09ORklHOiBCVUlMRF9TRVJWRVJfQ09ORklHLFxyXG4gIExJU1RFTl9QT1JUOiAxNjM3MSxcclxuICBIVE1MX1NJTVNfRElSRUNUT1JZOiBCVUlMRF9TRVJWRVJfQ09ORklHLmh0bWxTaW1zRGlyZWN0b3J5LFxyXG4gIFBIRVRfSU9fU0lNU19ESVJFQ1RPUlk6IEJVSUxEX1NFUlZFUl9DT05GSUcucGhldGlvU2ltc0RpcmVjdG9yeSxcclxuICBSRVBPU19LRVk6ICdyZXBvcycsXHJcbiAgREVQRU5ERU5DSUVTX0tFWTogJ2RlcGVuZGVuY2llcycsXHJcbiAgTE9DQUxFU19LRVk6ICdsb2NhbGVzJyxcclxuICBBUElfS0VZOiAnYXBpJyxcclxuICBTSU1fTkFNRV9LRVk6ICdzaW1OYW1lJyxcclxuICBWRVJTSU9OX0tFWTogJ3ZlcnNpb24nLFxyXG4gIE9QVElPTl9LRVk6ICdvcHRpb24nLFxyXG4gIEVNQUlMX0tFWTogJ2VtYWlsJyxcclxuICBCUkFOQ0hfS0VZOiAnYnJhbmNoJyxcclxuICBVU0VSX0lEX0tFWTogJ3VzZXJJZCcsXHJcbiAgVFJBTlNMQVRPUl9JRF9LRVk6ICd0cmFuc2xhdG9ySWQnLFxyXG4gIEFVVEhPUklaQVRJT05fS0VZOiAnYXV0aG9yaXphdGlvbkNvZGUnLFxyXG4gIFNFUlZFUlNfS0VZOiAnc2VydmVycycsXHJcbiAgQlJBTkRTX0tFWTogJ2JyYW5kcycsXHJcbiAgUFJPRFVDVElPTl9TRVJWRVI6ICdwcm9kdWN0aW9uJyxcclxuICBERVZfU0VSVkVSOiAnZGV2JyxcclxuICBQSEVUX0JSQU5EOiAncGhldCcsXHJcbiAgUEhFVF9JT19CUkFORDogJ3BoZXQtaW8nLFxyXG4gIEVOR0xJU0hfTE9DQUxFOiAnZW4nLFxyXG4gIFBFUkVOTklBTDogJy4nXHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE1BQU1BLEVBQUUsR0FBR0MsT0FBTyxDQUFFLGFBQWMsQ0FBQyxDQUFDLENBQUM7QUFDckMsTUFBTUMsb0JBQW9CLEdBQUdELE9BQU8sQ0FBRSx3QkFBeUIsQ0FBQztBQUVoRSxNQUFNRSxtQkFBbUIsR0FBR0Qsb0JBQW9CLENBQUVGLEVBQUcsQ0FBQztBQUV0REksTUFBTSxDQUFDQyxPQUFPLEdBQUc7RUFDZkYsbUJBQW1CLEVBQUVBLG1CQUFtQjtFQUN4Q0csV0FBVyxFQUFFLEtBQUs7RUFDbEJDLG1CQUFtQixFQUFFSixtQkFBbUIsQ0FBQ0ssaUJBQWlCO0VBQzFEQyxzQkFBc0IsRUFBRU4sbUJBQW1CLENBQUNPLG1CQUFtQjtFQUMvREMsU0FBUyxFQUFFLE9BQU87RUFDbEJDLGdCQUFnQixFQUFFLGNBQWM7RUFDaENDLFdBQVcsRUFBRSxTQUFTO0VBQ3RCQyxPQUFPLEVBQUUsS0FBSztFQUNkQyxZQUFZLEVBQUUsU0FBUztFQUN2QkMsV0FBVyxFQUFFLFNBQVM7RUFDdEJDLFVBQVUsRUFBRSxRQUFRO0VBQ3BCQyxTQUFTLEVBQUUsT0FBTztFQUNsQkMsVUFBVSxFQUFFLFFBQVE7RUFDcEJDLFdBQVcsRUFBRSxRQUFRO0VBQ3JCQyxpQkFBaUIsRUFBRSxjQUFjO0VBQ2pDQyxpQkFBaUIsRUFBRSxtQkFBbUI7RUFDdENDLFdBQVcsRUFBRSxTQUFTO0VBQ3RCQyxVQUFVLEVBQUUsUUFBUTtFQUNwQkMsaUJBQWlCLEVBQUUsWUFBWTtFQUMvQkMsVUFBVSxFQUFFLEtBQUs7RUFDakJDLFVBQVUsRUFBRSxNQUFNO0VBQ2xCQyxhQUFhLEVBQUUsU0FBUztFQUN4QkMsY0FBYyxFQUFFLElBQUk7RUFDcEJDLFNBQVMsRUFBRTtBQUNiLENBQUMifQ==