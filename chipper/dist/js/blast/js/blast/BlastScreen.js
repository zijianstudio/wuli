// Copyright 2016-2021, University of Colorado Boulder

/**
 * The 'Blast' screen.
 *
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import merge from '../../../phet-core/js/merge.js';
import blast from '../blast.js';
import BlastModel from './model/BlastModel.js';
import BlastScreenView from './view/BlastScreenView.js';
class BlastScreen extends Screen {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(tandem, options) {
    options = merge({
      particleColor: 'black',
      tandem: tandem
    }, options);
    super(() => new BlastModel(tandem.createTandem('model')), model => new BlastScreenView(model, options.particleColor, tandem.createTandem('view')), options);
  }
}
blast.register('BlastScreen', BlastScreen);
export default BlastScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJtZXJnZSIsImJsYXN0IiwiQmxhc3RNb2RlbCIsIkJsYXN0U2NyZWVuVmlldyIsIkJsYXN0U2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwicGFydGljbGVDb2xvciIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCbGFzdFNjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgJ0JsYXN0JyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgYmxhc3QgZnJvbSAnLi4vYmxhc3QuanMnO1xyXG5pbXBvcnQgQmxhc3RNb2RlbCBmcm9tICcuL21vZGVsL0JsYXN0TW9kZWwuanMnO1xyXG5pbXBvcnQgQmxhc3RTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9CbGFzdFNjcmVlblZpZXcuanMnO1xyXG5cclxuY2xhc3MgQmxhc3RTY3JlZW4gZXh0ZW5kcyBTY3JlZW4ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHBhcnRpY2xlQ29sb3I6ICdibGFjaycsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBCbGFzdE1vZGVsKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IEJsYXN0U2NyZWVuVmlldyggbW9kZWwsIG9wdGlvbnMucGFydGljbGVDb2xvciwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICkgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmJsYXN0LnJlZ2lzdGVyKCAnQmxhc3RTY3JlZW4nLCBCbGFzdFNjcmVlbiApO1xyXG5leHBvcnQgZGVmYXVsdCBCbGFzdFNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBQy9CLE9BQU9DLFVBQVUsTUFBTSx1QkFBdUI7QUFDOUMsT0FBT0MsZUFBZSxNQUFNLDJCQUEyQjtBQUV2RCxNQUFNQyxXQUFXLFNBQVNMLE1BQU0sQ0FBQztFQUUvQjtBQUNGO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUU3QkEsT0FBTyxHQUFHUCxLQUFLLENBQUU7TUFDZlEsYUFBYSxFQUFFLE9BQU87TUFDdEJGLE1BQU0sRUFBRUE7SUFDVixDQUFDLEVBQUVDLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FDSCxNQUFNLElBQUlMLFVBQVUsQ0FBRUksTUFBTSxDQUFDRyxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDdERDLEtBQUssSUFBSSxJQUFJUCxlQUFlLENBQUVPLEtBQUssRUFBRUgsT0FBTyxDQUFDQyxhQUFhLEVBQUVGLE1BQU0sQ0FBQ0csWUFBWSxDQUFFLE1BQU8sQ0FBRSxDQUFDLEVBQzNGRixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFOLEtBQUssQ0FBQ1UsUUFBUSxDQUFFLGFBQWEsRUFBRVAsV0FBWSxDQUFDO0FBQzVDLGVBQWVBLFdBQVcifQ==