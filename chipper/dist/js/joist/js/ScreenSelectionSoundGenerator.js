// Copyright 2020-2023, University of Colorado Boulder

/**
 * ScreenSelectionSoundGenerator generates sounds when the user switches between screens.  It does *not* handle the
 * sounds associated with the home screen - there is a separate sound generator for that.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import SoundClip from '../../tambo/js/sound-generators/SoundClip.js';
import screenSelection_mp3 from '../sounds/screenSelection_mp3.js';
import joist from './joist.js';
class ScreenSelectionSoundGenerator extends SoundClip {
  constructor(screenProperty, homeScreen, options) {
    super(screenSelection_mp3, options);

    // play sounds when the user navigates between screens and to/from the home screen
    screenProperty.lazyLink(currentScreen => {
      if (currentScreen !== homeScreen) {
        this.play();
      }
    });
  }
}
joist.register('ScreenSelectionSoundGenerator', ScreenSelectionSoundGenerator);
export default ScreenSelectionSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTb3VuZENsaXAiLCJzY3JlZW5TZWxlY3Rpb25fbXAzIiwiam9pc3QiLCJTY3JlZW5TZWxlY3Rpb25Tb3VuZEdlbmVyYXRvciIsImNvbnN0cnVjdG9yIiwic2NyZWVuUHJvcGVydHkiLCJob21lU2NyZWVuIiwib3B0aW9ucyIsImxhenlMaW5rIiwiY3VycmVudFNjcmVlbiIsInBsYXkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNjcmVlblNlbGVjdGlvblNvdW5kR2VuZXJhdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblNlbGVjdGlvblNvdW5kR2VuZXJhdG9yIGdlbmVyYXRlcyBzb3VuZHMgd2hlbiB0aGUgdXNlciBzd2l0Y2hlcyBiZXR3ZWVuIHNjcmVlbnMuICBJdCBkb2VzICpub3QqIGhhbmRsZSB0aGVcclxuICogc291bmRzIGFzc29jaWF0ZWQgd2l0aCB0aGUgaG9tZSBzY3JlZW4gLSB0aGVyZSBpcyBhIHNlcGFyYXRlIHNvdW5kIGdlbmVyYXRvciBmb3IgdGhhdC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU291bmRDbGlwLCB7IFNvdW5kQ2xpcE9wdGlvbnMgfSBmcm9tICcuLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcC5qcyc7XHJcbmltcG9ydCBzY3JlZW5TZWxlY3Rpb25fbXAzIGZyb20gJy4uL3NvdW5kcy9zY3JlZW5TZWxlY3Rpb25fbXAzLmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xyXG5pbXBvcnQgeyBBbnlTY3JlZW4gfSBmcm9tICcuL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBIb21lU2NyZWVuIGZyb20gJy4vSG9tZVNjcmVlbi5qcyc7XHJcblxyXG5jbGFzcyBTY3JlZW5TZWxlY3Rpb25Tb3VuZEdlbmVyYXRvciBleHRlbmRzIFNvdW5kQ2xpcCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NyZWVuUHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8QW55U2NyZWVuPiwgaG9tZVNjcmVlbjogSG9tZVNjcmVlbiB8IG51bGwsIG9wdGlvbnM/OiBTb3VuZENsaXBPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBzY3JlZW5TZWxlY3Rpb25fbXAzLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gcGxheSBzb3VuZHMgd2hlbiB0aGUgdXNlciBuYXZpZ2F0ZXMgYmV0d2VlbiBzY3JlZW5zIGFuZCB0by9mcm9tIHRoZSBob21lIHNjcmVlblxyXG4gICAgc2NyZWVuUHJvcGVydHkubGF6eUxpbmsoIGN1cnJlbnRTY3JlZW4gPT4ge1xyXG4gICAgICBpZiAoIGN1cnJlbnRTY3JlZW4gIT09IGhvbWVTY3JlZW4gKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmpvaXN0LnJlZ2lzdGVyKCAnU2NyZWVuU2VsZWN0aW9uU291bmRHZW5lcmF0b3InLCBTY3JlZW5TZWxlY3Rpb25Tb3VuZEdlbmVyYXRvciApO1xyXG5leHBvcnQgZGVmYXVsdCBTY3JlZW5TZWxlY3Rpb25Tb3VuZEdlbmVyYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLE1BQTRCLDhDQUE4QztBQUMxRixPQUFPQyxtQkFBbUIsTUFBTSxrQ0FBa0M7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFJOUIsTUFBTUMsNkJBQTZCLFNBQVNILFNBQVMsQ0FBQztFQUU3Q0ksV0FBV0EsQ0FBRUMsY0FBMkMsRUFBRUMsVUFBNkIsRUFBRUMsT0FBMEIsRUFBRztJQUUzSCxLQUFLLENBQUVOLG1CQUFtQixFQUFFTSxPQUFRLENBQUM7O0lBRXJDO0lBQ0FGLGNBQWMsQ0FBQ0csUUFBUSxDQUFFQyxhQUFhLElBQUk7TUFDeEMsSUFBS0EsYUFBYSxLQUFLSCxVQUFVLEVBQUc7UUFDbEMsSUFBSSxDQUFDSSxJQUFJLENBQUMsQ0FBQztNQUNiO0lBQ0YsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBUixLQUFLLENBQUNTLFFBQVEsQ0FBRSwrQkFBK0IsRUFBRVIsNkJBQThCLENBQUM7QUFDaEYsZUFBZUEsNkJBQTZCIn0=