// Copyright 2013-2022, University of Colorado Boulder

/**
 * States during the 'play' phase of a game, mutually exclusive. (See GamePhase.)
 * For lack of better names, the state names correspond to the main action that
 * the user can take in that state.  For example. the FIRST_CHECK state is where the user
 * has their first opportunity to press the 'Check' button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import graphingLines from '../../graphingLines.js';
export default class PlayState extends EnumerationValue {
  static FIRST_CHECK = new PlayState(); // 'Check' button is visible for the first time
  static TRY_AGAIN = new PlayState(); // 'Try Again' button is visible
  static SECOND_CHECK = new PlayState(); // 'Check' button is visible for the second time
  static SHOW_ANSWER = new PlayState(); // 'Show Answer' button is visible
  static NEXT = new PlayState(); // 'Next' button is visible
  static NONE = new PlayState(); // use this value when game is not in the 'play' phase

  static enumeration = new Enumeration(PlayState);
}
graphingLines.register('PlayState', PlayState);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJncmFwaGluZ0xpbmVzIiwiUGxheVN0YXRlIiwiRklSU1RfQ0hFQ0siLCJUUllfQUdBSU4iLCJTRUNPTkRfQ0hFQ0siLCJTSE9XX0FOU1dFUiIsIk5FWFQiLCJOT05FIiwiZW51bWVyYXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYXlTdGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTdGF0ZXMgZHVyaW5nIHRoZSAncGxheScgcGhhc2Ugb2YgYSBnYW1lLCBtdXR1YWxseSBleGNsdXNpdmUuIChTZWUgR2FtZVBoYXNlLilcclxuICogRm9yIGxhY2sgb2YgYmV0dGVyIG5hbWVzLCB0aGUgc3RhdGUgbmFtZXMgY29ycmVzcG9uZCB0byB0aGUgbWFpbiBhY3Rpb24gdGhhdFxyXG4gKiB0aGUgdXNlciBjYW4gdGFrZSBpbiB0aGF0IHN0YXRlLiAgRm9yIGV4YW1wbGUuIHRoZSBGSVJTVF9DSEVDSyBzdGF0ZSBpcyB3aGVyZSB0aGUgdXNlclxyXG4gKiBoYXMgdGhlaXIgZmlyc3Qgb3Bwb3J0dW5pdHkgdG8gcHJlc3MgdGhlICdDaGVjaycgYnV0dG9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheVN0YXRlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgRklSU1RfQ0hFQ0sgPSBuZXcgUGxheVN0YXRlKCk7IC8vICdDaGVjaycgYnV0dG9uIGlzIHZpc2libGUgZm9yIHRoZSBmaXJzdCB0aW1lXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUUllfQUdBSU4gPSBuZXcgUGxheVN0YXRlKCk7IC8vICdUcnkgQWdhaW4nIGJ1dHRvbiBpcyB2aXNpYmxlXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTRUNPTkRfQ0hFQ0sgPSBuZXcgUGxheVN0YXRlKCk7IC8vICdDaGVjaycgYnV0dG9uIGlzIHZpc2libGUgZm9yIHRoZSBzZWNvbmQgdGltZVxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU0hPV19BTlNXRVIgPSBuZXcgUGxheVN0YXRlKCk7IC8vICdTaG93IEFuc3dlcicgYnV0dG9uIGlzIHZpc2libGVcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE5FWFQgPSBuZXcgUGxheVN0YXRlKCk7IC8vICdOZXh0JyBidXR0b24gaXMgdmlzaWJsZVxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTk9ORSA9IG5ldyBQbGF5U3RhdGUoKTsgLy8gdXNlIHRoaXMgdmFsdWUgd2hlbiBnYW1lIGlzIG5vdCBpbiB0aGUgJ3BsYXknIHBoYXNlXHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIFBsYXlTdGF0ZSApO1xyXG59XHJcblxyXG5ncmFwaGluZ0xpbmVzLnJlZ2lzdGVyKCAnUGxheVN0YXRlJywgUGxheVN0YXRlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFFbEQsZUFBZSxNQUFNQyxTQUFTLFNBQVNGLGdCQUFnQixDQUFDO0VBRXRELE9BQXVCRyxXQUFXLEdBQUcsSUFBSUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3RELE9BQXVCRSxTQUFTLEdBQUcsSUFBSUYsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3BELE9BQXVCRyxZQUFZLEdBQUcsSUFBSUgsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3ZELE9BQXVCSSxXQUFXLEdBQUcsSUFBSUosU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3RELE9BQXVCSyxJQUFJLEdBQUcsSUFBSUwsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQy9DLE9BQXVCTSxJQUFJLEdBQUcsSUFBSU4sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUUvQyxPQUF1Qk8sV0FBVyxHQUFHLElBQUlWLFdBQVcsQ0FBRUcsU0FBVSxDQUFDO0FBQ25FO0FBRUFELGFBQWEsQ0FBQ1MsUUFBUSxDQUFFLFdBQVcsRUFBRVIsU0FBVSxDQUFDIn0=