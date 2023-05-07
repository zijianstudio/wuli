// Copyright 2022, University of Colorado Boulder

/**
 * DeBroglieRadialNodeOptions represents the de Broglie model as a standing wave. A ring is drawn that corresponds
 * to the electron's orbit. The radial offset of that ring from the electron's orbit is a function of the amplitude
 * of the standing wave.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import OrbitsNode from './OrbitsNode.js';
import MOTHAColors from '../MOTHAColors.js';
import { Shape } from '../../../../kite/js/imports.js';
import Multilink from '../../../../axon/js/Multilink.js';
import MOTHAConstants from '../MOTHAConstants.js';

// multiply the ground state orbit radius by this number to determine the radial offset at max amplitude
const RADIAL_OFFSET_FACTOR = 0.45;

// number of line segments used to approximate the ring, empirically tunes to make the ring look smooth
const NUMBER_OF_SEGMENTS = 200;
export default class DeBroglieRadialNode extends Node {
  constructor(hydrogenAtom, modelViewTransform, providedOptions) {
    const options = optionize()({
      // visible when the view choice is 'radial'
      visibleProperty: new DerivedProperty([hydrogenAtom.deBroglieViewProperty], deBroglieView => deBroglieView === 'radial', {
        tandem: providedOptions.tandem.createTandem('visibleProperty'),
        phetioValueType: BooleanIO
      })
    }, providedOptions);

    // Electron orbits
    const orbitsNode = new OrbitsNode(hydrogenAtom, modelViewTransform, {
      tandem: options.tandem.createTandem('orbitsNode')
    });

    // Ring that represents the standing wave
    const ringNode = new RingNode(hydrogenAtom, modelViewTransform, {
      // Synchronize visibility with the parent Node, because RingNode is optimized to update only when visible.
      visibleProperty: options.visibleProperty,
      tandem: options.tandem.createTandem('ringNode')
    });
    options.children = [orbitsNode, ringNode];
    super(options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
/**
 * RingNode is the ring that represents the standing wave.
 * It's radial distance from the electron's orbit is a function of amplitude.
 */
class RingNode extends Path {
  // position of the hydrogen atom, in view coordinates

  // radius of the ground state orbit, in view coordinates

  constructor(hydrogenAtom, modelViewTransform, providedOptions) {
    const options = optionize()({
      // PathOptions
      stroke: MOTHAColors.electronBaseColorProperty,
      lineWidth: 2
    }, providedOptions);
    super(null, options);
    this.hydrogenAtom = hydrogenAtom;
    this.modelViewTransform = modelViewTransform;
    this.hydrogenAtomPosition = this.modelViewTransform.modelToViewPosition(hydrogenAtom.position);
    this.groundStateOrbitRadius = this.modelViewTransform.modelToViewDeltaX(hydrogenAtom.getElectronOrbitRadius(MOTHAConstants.GROUND_STATE));
    Multilink.multilink([hydrogenAtom.electronAngleProperty, this.visibleProperty], (electronAngle, visible) => {
      visible && this.update();
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Updates the shape of the ring.
   */
  update() {
    assert && assert(this.visible);

    // Get the radius for the electron's current state.
    const electronState = this.hydrogenAtom.getElectronState();
    const electronOrbitRadius = this.modelViewTransform.modelToViewDeltaX(this.hydrogenAtom.getElectronOrbitRadius(electronState));
    const ringShape = new Shape();
    for (let i = 0; i < NUMBER_OF_SEGMENTS; i++) {
      const angle = 2 * Math.PI * (i / NUMBER_OF_SEGMENTS);
      const amplitude = this.hydrogenAtom.getAmplitude(angle, electronState);
      const maxRadialOffset = RADIAL_OFFSET_FACTOR * this.groundStateOrbitRadius;
      const radialOffset = maxRadialOffset * amplitude;
      const x = (electronOrbitRadius + radialOffset) * Math.cos(angle) + this.hydrogenAtomPosition.x;
      const y = (electronOrbitRadius + radialOffset) * Math.sin(angle) + this.hydrogenAtomPosition.y;
      if (i === 0) {
        ringShape.moveTo(x, y);
      } else {
        ringShape.lineTo(x, y);
      }
    }
    ringShape.close();
    this.shape = ringShape;
  }
}
modelsOfTheHydrogenAtom.register('DeBroglieRadialNode', DeBroglieRadialNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJvcHRpb25pemUiLCJOb2RlIiwiUGF0aCIsIkJvb2xlYW5JTyIsIm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tIiwiT3JiaXRzTm9kZSIsIk1PVEhBQ29sb3JzIiwiU2hhcGUiLCJNdWx0aWxpbmsiLCJNT1RIQUNvbnN0YW50cyIsIlJBRElBTF9PRkZTRVRfRkFDVE9SIiwiTlVNQkVSX09GX1NFR01FTlRTIiwiRGVCcm9nbGllUmFkaWFsTm9kZSIsImNvbnN0cnVjdG9yIiwiaHlkcm9nZW5BdG9tIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInZpc2libGVQcm9wZXJ0eSIsImRlQnJvZ2xpZVZpZXdQcm9wZXJ0eSIsImRlQnJvZ2xpZVZpZXciLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9WYWx1ZVR5cGUiLCJvcmJpdHNOb2RlIiwicmluZ05vZGUiLCJSaW5nTm9kZSIsImNoaWxkcmVuIiwiZGlzcG9zZSIsImFzc2VydCIsInN0cm9rZSIsImVsZWN0cm9uQmFzZUNvbG9yUHJvcGVydHkiLCJsaW5lV2lkdGgiLCJoeWRyb2dlbkF0b21Qb3NpdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJwb3NpdGlvbiIsImdyb3VuZFN0YXRlT3JiaXRSYWRpdXMiLCJtb2RlbFRvVmlld0RlbHRhWCIsImdldEVsZWN0cm9uT3JiaXRSYWRpdXMiLCJHUk9VTkRfU1RBVEUiLCJtdWx0aWxpbmsiLCJlbGVjdHJvbkFuZ2xlUHJvcGVydHkiLCJlbGVjdHJvbkFuZ2xlIiwidmlzaWJsZSIsInVwZGF0ZSIsImVsZWN0cm9uU3RhdGUiLCJnZXRFbGVjdHJvblN0YXRlIiwiZWxlY3Ryb25PcmJpdFJhZGl1cyIsInJpbmdTaGFwZSIsImkiLCJhbmdsZSIsIk1hdGgiLCJQSSIsImFtcGxpdHVkZSIsImdldEFtcGxpdHVkZSIsIm1heFJhZGlhbE9mZnNldCIsInJhZGlhbE9mZnNldCIsIngiLCJjb3MiLCJ5Iiwic2luIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJzaGFwZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGVCcm9nbGllUmFkaWFsTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVCcm9nbGllUmFkaWFsTm9kZU9wdGlvbnMgcmVwcmVzZW50cyB0aGUgZGUgQnJvZ2xpZSBtb2RlbCBhcyBhIHN0YW5kaW5nIHdhdmUuIEEgcmluZyBpcyBkcmF3biB0aGF0IGNvcnJlc3BvbmRzXHJcbiAqIHRvIHRoZSBlbGVjdHJvbidzIG9yYml0LiBUaGUgcmFkaWFsIG9mZnNldCBvZiB0aGF0IHJpbmcgZnJvbSB0aGUgZWxlY3Ryb24ncyBvcmJpdCBpcyBhIGZ1bmN0aW9uIG9mIHRoZSBhbXBsaXR1ZGVcclxuICogb2YgdGhlIHN0YW5kaW5nIHdhdmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBQYXRoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcbmltcG9ydCBEZUJyb2dsaWVNb2RlbCBmcm9tICcuLi9tb2RlbC9EZUJyb2dsaWVNb2RlbC5qcyc7XHJcbmltcG9ydCBPcmJpdHNOb2RlIGZyb20gJy4vT3JiaXRzTm9kZS5qcyc7XHJcbmltcG9ydCBNT1RIQUNvbG9ycyBmcm9tICcuLi9NT1RIQUNvbG9ycy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE1PVEhBQ29uc3RhbnRzIGZyb20gJy4uL01PVEhBQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIG11bHRpcGx5IHRoZSBncm91bmQgc3RhdGUgb3JiaXQgcmFkaXVzIGJ5IHRoaXMgbnVtYmVyIHRvIGRldGVybWluZSB0aGUgcmFkaWFsIG9mZnNldCBhdCBtYXggYW1wbGl0dWRlXHJcbmNvbnN0IFJBRElBTF9PRkZTRVRfRkFDVE9SID0gMC40NTtcclxuXHJcbi8vIG51bWJlciBvZiBsaW5lIHNlZ21lbnRzIHVzZWQgdG8gYXBwcm94aW1hdGUgdGhlIHJpbmcsIGVtcGlyaWNhbGx5IHR1bmVzIHRvIG1ha2UgdGhlIHJpbmcgbG9vayBzbW9vdGhcclxuY29uc3QgTlVNQkVSX09GX1NFR01FTlRTID0gMjAwO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIERlQnJvZ2xpZVJhZGlhbE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlQnJvZ2xpZVJhZGlhbE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBoeWRyb2dlbkF0b206IERlQnJvZ2xpZU1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBEZUJyb2dsaWVSYWRpYWxOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPERlQnJvZ2xpZVJhZGlhbE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIHZpc2libGUgd2hlbiB0aGUgdmlldyBjaG9pY2UgaXMgJ3JhZGlhbCdcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGh5ZHJvZ2VuQXRvbS5kZUJyb2dsaWVWaWV3UHJvcGVydHkgXSxcclxuICAgICAgICBkZUJyb2dsaWVWaWV3ID0+ICggZGVCcm9nbGllVmlldyA9PT0gJ3JhZGlhbCcgKSwge1xyXG4gICAgICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Zpc2libGVQcm9wZXJ0eScgKSxcclxuICAgICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9vbGVhbklPXHJcbiAgICAgICAgfSApXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBFbGVjdHJvbiBvcmJpdHNcclxuICAgIGNvbnN0IG9yYml0c05vZGUgPSBuZXcgT3JiaXRzTm9kZSggaHlkcm9nZW5BdG9tLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdvcmJpdHNOb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIHN0YW5kaW5nIHdhdmVcclxuICAgIGNvbnN0IHJpbmdOb2RlID0gbmV3IFJpbmdOb2RlKCBoeWRyb2dlbkF0b20sIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG5cclxuICAgICAgLy8gU3luY2hyb25pemUgdmlzaWJpbGl0eSB3aXRoIHRoZSBwYXJlbnQgTm9kZSwgYmVjYXVzZSBSaW5nTm9kZSBpcyBvcHRpbWl6ZWQgdG8gdXBkYXRlIG9ubHkgd2hlbiB2aXNpYmxlLlxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IG9wdGlvbnMudmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JpbmdOb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgb3JiaXRzTm9kZSwgcmluZ05vZGUgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnR5cGUgUmluZ05vZGVTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbnR5cGUgUmluZ05vZGVPcHRpb25zID0gUmluZ05vZGVTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQYXRoT3B0aW9ucywgJ3Zpc2libGVQcm9wZXJ0eScgfCAndGFuZGVtJz47XHJcblxyXG4vKipcclxuICogUmluZ05vZGUgaXMgdGhlIHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBzdGFuZGluZyB3YXZlLlxyXG4gKiBJdCdzIHJhZGlhbCBkaXN0YW5jZSBmcm9tIHRoZSBlbGVjdHJvbidzIG9yYml0IGlzIGEgZnVuY3Rpb24gb2YgYW1wbGl0dWRlLlxyXG4gKi9cclxuY2xhc3MgUmluZ05vZGUgZXh0ZW5kcyBQYXRoIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBoeWRyb2dlbkF0b206IERlQnJvZ2xpZU1vZGVsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yO1xyXG5cclxuICAvLyBwb3NpdGlvbiBvZiB0aGUgaHlkcm9nZW4gYXRvbSwgaW4gdmlldyBjb29yZGluYXRlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaHlkcm9nZW5BdG9tUG9zaXRpb246IFZlY3RvcjI7XHJcblxyXG4gIC8vIHJhZGl1cyBvZiB0aGUgZ3JvdW5kIHN0YXRlIG9yYml0LCBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBncm91bmRTdGF0ZU9yYml0UmFkaXVzOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaHlkcm9nZW5BdG9tOiBEZUJyb2dsaWVNb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogUmluZ05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmluZ05vZGVPcHRpb25zLCBSaW5nTm9kZVNlbGZPcHRpb25zLCBQYXRoT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gUGF0aE9wdGlvbnNcclxuICAgICAgc3Ryb2tlOiBNT1RIQUNvbG9ycy5lbGVjdHJvbkJhc2VDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDJcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBudWxsLCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5oeWRyb2dlbkF0b20gPSBoeWRyb2dlbkF0b207XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuICAgIHRoaXMuaHlkcm9nZW5BdG9tUG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBoeWRyb2dlbkF0b20ucG9zaXRpb24gKTtcclxuICAgIHRoaXMuZ3JvdW5kU3RhdGVPcmJpdFJhZGl1cyA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBoeWRyb2dlbkF0b20uZ2V0RWxlY3Ryb25PcmJpdFJhZGl1cyggTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFICkgKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIGh5ZHJvZ2VuQXRvbS5lbGVjdHJvbkFuZ2xlUHJvcGVydHksIHRoaXMudmlzaWJsZVByb3BlcnR5IF0sXHJcbiAgICAgICggZWxlY3Ryb25BbmdsZSwgdmlzaWJsZSApID0+IHtcclxuICAgICAgICB2aXNpYmxlICYmIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBzaGFwZSBvZiB0aGUgcmluZy5cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudmlzaWJsZSApO1xyXG5cclxuICAgIC8vIEdldCB0aGUgcmFkaXVzIGZvciB0aGUgZWxlY3Ryb24ncyBjdXJyZW50IHN0YXRlLlxyXG4gICAgY29uc3QgZWxlY3Ryb25TdGF0ZSA9IHRoaXMuaHlkcm9nZW5BdG9tLmdldEVsZWN0cm9uU3RhdGUoKTtcclxuICAgIGNvbnN0IGVsZWN0cm9uT3JiaXRSYWRpdXMgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggdGhpcy5oeWRyb2dlbkF0b20uZ2V0RWxlY3Ryb25PcmJpdFJhZGl1cyggZWxlY3Ryb25TdGF0ZSApICk7XHJcblxyXG4gICAgY29uc3QgcmluZ1NoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBOVU1CRVJfT0ZfU0VHTUVOVFM7IGkrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IGFuZ2xlID0gKCAyICogTWF0aC5QSSApICogKCBpIC8gTlVNQkVSX09GX1NFR01FTlRTICk7XHJcbiAgICAgIGNvbnN0IGFtcGxpdHVkZSA9IHRoaXMuaHlkcm9nZW5BdG9tLmdldEFtcGxpdHVkZSggYW5nbGUsIGVsZWN0cm9uU3RhdGUgKTtcclxuXHJcbiAgICAgIGNvbnN0IG1heFJhZGlhbE9mZnNldCA9IFJBRElBTF9PRkZTRVRfRkFDVE9SICogdGhpcy5ncm91bmRTdGF0ZU9yYml0UmFkaXVzO1xyXG4gICAgICBjb25zdCByYWRpYWxPZmZzZXQgPSBtYXhSYWRpYWxPZmZzZXQgKiBhbXBsaXR1ZGU7XHJcbiAgICAgIGNvbnN0IHggPSAoIGVsZWN0cm9uT3JiaXRSYWRpdXMgKyByYWRpYWxPZmZzZXQgKSAqIE1hdGguY29zKCBhbmdsZSApICsgdGhpcy5oeWRyb2dlbkF0b21Qb3NpdGlvbi54O1xyXG4gICAgICBjb25zdCB5ID0gKCBlbGVjdHJvbk9yYml0UmFkaXVzICsgcmFkaWFsT2Zmc2V0ICkgKiBNYXRoLnNpbiggYW5nbGUgKSArIHRoaXMuaHlkcm9nZW5BdG9tUG9zaXRpb24ueTtcclxuICAgICAgaWYgKCBpID09PSAwICkge1xyXG4gICAgICAgIHJpbmdTaGFwZS5tb3ZlVG8oIHgsIHkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByaW5nU2hhcGUubGluZVRvKCB4LCB5ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJpbmdTaGFwZS5jbG9zZSgpO1xyXG5cclxuICAgIHRoaXMuc2hhcGUgPSByaW5nU2hhcGU7XHJcbiAgfVxyXG59XHJcblxyXG5tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5yZWdpc3RlciggJ0RlQnJvZ2xpZVJhZGlhbE5vZGUnLCBEZUJyb2dsaWVSYWRpYWxOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBR25GLFNBQVNDLElBQUksRUFBZUMsSUFBSSxRQUFxQixtQ0FBbUM7QUFDeEYsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFFdEUsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBQzNDLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFFdEQsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0sc0JBQXNCOztBQUVqRDtBQUNBLE1BQU1DLG9CQUFvQixHQUFHLElBQUk7O0FBRWpDO0FBQ0EsTUFBTUMsa0JBQWtCLEdBQUcsR0FBRztBQU05QixlQUFlLE1BQU1DLG1CQUFtQixTQUFTWCxJQUFJLENBQUM7RUFFN0NZLFdBQVdBLENBQUVDLFlBQTRCLEVBQzVCQyxrQkFBdUMsRUFDdkNDLGVBQTJDLEVBQUc7SUFFaEUsTUFBTUMsT0FBTyxHQUFHakIsU0FBUyxDQUF1RCxDQUFDLENB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