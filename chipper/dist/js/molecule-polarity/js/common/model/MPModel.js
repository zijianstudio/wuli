// Copyright 2014-2023, University of Colorado Boulder

/**
 * MPModel is the abstract base type for 2D models in this sim.
 * Every 2D model has an E-field and a molecule.
 * If the E-field is enabled, the molecule rotates until its molecular dipole is aligned with the E-field.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import moleculePolarity from '../../moleculePolarity.js';
import MPConstants from '../MPConstants.js';
import MPPreferences from './MPPreferences.js';
import normalizeAngle from './normalizeAngle.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import optionize from '../../../../phet-core/js/optionize.js';
// constants
const MAX_RADIANS_PER_STEP = 0.17; // controls animation of E-field alignment

export default class MPModel extends PhetioObject {
  constructor(molecule, providedOptions) {
    const options = optionize()({
      // PhetioObjectOptions
      phetioState: false
    }, providedOptions);
    super(options);
    this.molecule = molecule;
    this.eFieldEnabledProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('eFieldEnabledProperty')
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.eFieldEnabledProperty.reset();
  }

  /**
   * Advances the model.
   * @param dt - time step, in seconds
   */
  step(dt) {
    // If the E-field is on and the user isn't controlling the molecule's orientation, animate molecule rotation.
    if (this.eFieldEnabledProperty.value && !this.molecule.isDraggingProperty.value) {
      this.updateMoleculeOrientation(this.molecule);
    }
  }

  /**
   * Rotate the molecule one step towards alignment of the molecular dipole with the E-field.
   * Angular velocity is proportional to the dipole's magnitude.
   */
  updateMoleculeOrientation(molecule) {
    let dipole = molecule.dipoleProperty.value;

    // This algorithm is for a dipole that points from positive to negative charge, and is therefore
    // antiparallel to the E-field.  For IUPAC convention, the direction of the dipole moment
    // is from negative to positive charge, so rotate the dipole 180 degrees. See issue #5 and #56.
    if (MPPreferences.dipoleDirectionProperty.value === 'negativeToPositive') {
      dipole = dipole.rotated(Math.PI);
    }

    // magnitude of angular velocity is proportional to molecular dipole magnitude
    const deltaDipoleAngle = Math.abs(Utils.linear(0, MPConstants.ELECTRONEGATIVITY_RANGE.getLength(), 0, MAX_RADIANS_PER_STEP, dipole.magnitude));

    // normalize to [0,2*PI), because that's what the next chunk of code expects.
    const dipoleAngle = normalizeAngle(dipole.angle);
    let newDipoleAngle;

    // move the molecular dipole one step towards alignment with the E-field
    if (dipoleAngle === 0) {
      // do nothing, molecule is aligned with E-field
      newDipoleAngle = dipoleAngle;
    } else if (dipoleAngle > 0 && dipoleAngle < Math.PI) {
      // rotate counterclockwise
      newDipoleAngle = dipoleAngle - deltaDipoleAngle;
      if (newDipoleAngle < 0) {
        // new angle would overshoot, set to zero
        newDipoleAngle = 0;
      }
    } else {
      // rotate clockwise
      newDipoleAngle = dipoleAngle + deltaDipoleAngle;
      if (newDipoleAngle > 2 * Math.PI) {
        // new angle would overshoot, set to zero
        newDipoleAngle = 0;
      }
    }

    // convert dipole rotation to molecule rotation
    const deltaMoleculeAngle = newDipoleAngle - dipoleAngle;
    let angle = molecule.angleProperty.value + deltaMoleculeAngle;

    // If dipole is aligned with molecule orientation, snap to zero when we're close enough.
    // See https://github.com/phetsims/molecule-polarity/issues/97
    if (newDipoleAngle === 0 && Math.abs(angle) < 1E-5) {
      angle = 0;
    }
    const angleRange = molecule.angleProperty.range;
    molecule.angleProperty.value = normalizeAngle(angle, angleRange.min);
  }
}
moleculePolarity.register('MPModel', MPModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJVdGlscyIsIm1vbGVjdWxlUG9sYXJpdHkiLCJNUENvbnN0YW50cyIsIk1QUHJlZmVyZW5jZXMiLCJub3JtYWxpemVBbmdsZSIsIlBoZXRpb09iamVjdCIsIm9wdGlvbml6ZSIsIk1BWF9SQURJQU5TX1BFUl9TVEVQIiwiTVBNb2RlbCIsImNvbnN0cnVjdG9yIiwibW9sZWN1bGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGhldGlvU3RhdGUiLCJlRmllbGRFbmFibGVkUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVzZXQiLCJzdGVwIiwiZHQiLCJ2YWx1ZSIsImlzRHJhZ2dpbmdQcm9wZXJ0eSIsInVwZGF0ZU1vbGVjdWxlT3JpZW50YXRpb24iLCJkaXBvbGUiLCJkaXBvbGVQcm9wZXJ0eSIsImRpcG9sZURpcmVjdGlvblByb3BlcnR5Iiwicm90YXRlZCIsIk1hdGgiLCJQSSIsImRlbHRhRGlwb2xlQW5nbGUiLCJhYnMiLCJsaW5lYXIiLCJFTEVDVFJPTkVHQVRJVklUWV9SQU5HRSIsImdldExlbmd0aCIsIm1hZ25pdHVkZSIsImRpcG9sZUFuZ2xlIiwiYW5nbGUiLCJuZXdEaXBvbGVBbmdsZSIsImRlbHRhTW9sZWN1bGVBbmdsZSIsImFuZ2xlUHJvcGVydHkiLCJhbmdsZVJhbmdlIiwicmFuZ2UiLCJtaW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1QTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTVBNb2RlbCBpcyB0aGUgYWJzdHJhY3QgYmFzZSB0eXBlIGZvciAyRCBtb2RlbHMgaW4gdGhpcyBzaW0uXHJcbiAqIEV2ZXJ5IDJEIG1vZGVsIGhhcyBhbiBFLWZpZWxkIGFuZCBhIG1vbGVjdWxlLlxyXG4gKiBJZiB0aGUgRS1maWVsZCBpcyBlbmFibGVkLCB0aGUgbW9sZWN1bGUgcm90YXRlcyB1bnRpbCBpdHMgbW9sZWN1bGFyIGRpcG9sZSBpcyBhbGlnbmVkIHdpdGggdGhlIEUtZmllbGQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVQb2xhcml0eSBmcm9tICcuLi8uLi9tb2xlY3VsZVBvbGFyaXR5LmpzJztcclxuaW1wb3J0IE1QQ29uc3RhbnRzIGZyb20gJy4uL01QQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IE1QUHJlZmVyZW5jZXMgZnJvbSAnLi9NUFByZWZlcmVuY2VzLmpzJztcclxuaW1wb3J0IG5vcm1hbGl6ZUFuZ2xlIGZyb20gJy4vbm9ybWFsaXplQW5nbGUuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGUgZnJvbSAnLi9Nb2xlY3VsZS5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVE1vZGVsIGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1RNb2RlbC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFYX1JBRElBTlNfUEVSX1NURVAgPSAwLjE3OyAvLyBjb250cm9scyBhbmltYXRpb24gb2YgRS1maWVsZCBhbGlnbm1lbnRcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgTVBNb2RlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBNUE1vZGVsIGV4dGVuZHMgUGhldGlvT2JqZWN0IGltcGxlbWVudHMgVE1vZGVsIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb2xlY3VsZTogTW9sZWN1bGU7XHJcbiAgcHVibGljIHJlYWRvbmx5IGVGaWVsZEVuYWJsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggbW9sZWN1bGU6IE1vbGVjdWxlLCBwcm92aWRlZE9wdGlvbnM6IE1QTW9kZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TVBNb2RlbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBQaGV0aW9PYmplY3RPcHRpb25zXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLm1vbGVjdWxlID0gbW9sZWN1bGU7XHJcblxyXG4gICAgdGhpcy5lRmllbGRFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VGaWVsZEVuYWJsZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZUZpZWxkRW5hYmxlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZHZhbmNlcyB0aGUgbW9kZWwuXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gSWYgdGhlIEUtZmllbGQgaXMgb24gYW5kIHRoZSB1c2VyIGlzbid0IGNvbnRyb2xsaW5nIHRoZSBtb2xlY3VsZSdzIG9yaWVudGF0aW9uLCBhbmltYXRlIG1vbGVjdWxlIHJvdGF0aW9uLlxyXG4gICAgaWYgKCB0aGlzLmVGaWVsZEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSAmJiAhdGhpcy5tb2xlY3VsZS5pc0RyYWdnaW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlTW9sZWN1bGVPcmllbnRhdGlvbiggdGhpcy5tb2xlY3VsZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSBtb2xlY3VsZSBvbmUgc3RlcCB0b3dhcmRzIGFsaWdubWVudCBvZiB0aGUgbW9sZWN1bGFyIGRpcG9sZSB3aXRoIHRoZSBFLWZpZWxkLlxyXG4gICAqIEFuZ3VsYXIgdmVsb2NpdHkgaXMgcHJvcG9ydGlvbmFsIHRvIHRoZSBkaXBvbGUncyBtYWduaXR1ZGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVNb2xlY3VsZU9yaWVudGF0aW9uKCBtb2xlY3VsZTogTW9sZWN1bGUgKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IGRpcG9sZSA9IG1vbGVjdWxlLmRpcG9sZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIFRoaXMgYWxnb3JpdGhtIGlzIGZvciBhIGRpcG9sZSB0aGF0IHBvaW50cyBmcm9tIHBvc2l0aXZlIHRvIG5lZ2F0aXZlIGNoYXJnZSwgYW5kIGlzIHRoZXJlZm9yZVxyXG4gICAgLy8gYW50aXBhcmFsbGVsIHRvIHRoZSBFLWZpZWxkLiAgRm9yIElVUEFDIGNvbnZlbnRpb24sIHRoZSBkaXJlY3Rpb24gb2YgdGhlIGRpcG9sZSBtb21lbnRcclxuICAgIC8vIGlzIGZyb20gbmVnYXRpdmUgdG8gcG9zaXRpdmUgY2hhcmdlLCBzbyByb3RhdGUgdGhlIGRpcG9sZSAxODAgZGVncmVlcy4gU2VlIGlzc3VlICM1IGFuZCAjNTYuXHJcbiAgICBpZiAoIE1QUHJlZmVyZW5jZXMuZGlwb2xlRGlyZWN0aW9uUHJvcGVydHkudmFsdWUgPT09ICduZWdhdGl2ZVRvUG9zaXRpdmUnICkge1xyXG4gICAgICBkaXBvbGUgPSBkaXBvbGUucm90YXRlZCggTWF0aC5QSSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1hZ25pdHVkZSBvZiBhbmd1bGFyIHZlbG9jaXR5IGlzIHByb3BvcnRpb25hbCB0byBtb2xlY3VsYXIgZGlwb2xlIG1hZ25pdHVkZVxyXG4gICAgY29uc3QgZGVsdGFEaXBvbGVBbmdsZSA9IE1hdGguYWJzKCBVdGlscy5saW5lYXIoIDAsIE1QQ29uc3RhbnRzLkVMRUNUUk9ORUdBVElWSVRZX1JBTkdFLmdldExlbmd0aCgpLCAwLCBNQVhfUkFESUFOU19QRVJfU1RFUCwgZGlwb2xlLm1hZ25pdHVkZSApICk7XHJcblxyXG4gICAgLy8gbm9ybWFsaXplIHRvIFswLDIqUEkpLCBiZWNhdXNlIHRoYXQncyB3aGF0IHRoZSBuZXh0IGNodW5rIG9mIGNvZGUgZXhwZWN0cy5cclxuICAgIGNvbnN0IGRpcG9sZUFuZ2xlID0gbm9ybWFsaXplQW5nbGUoIGRpcG9sZS5hbmdsZSApO1xyXG5cclxuICAgIGxldCBuZXdEaXBvbGVBbmdsZTtcclxuXHJcbiAgICAvLyBtb3ZlIHRoZSBtb2xlY3VsYXIgZGlwb2xlIG9uZSBzdGVwIHRvd2FyZHMgYWxpZ25tZW50IHdpdGggdGhlIEUtZmllbGRcclxuICAgIGlmICggZGlwb2xlQW5nbGUgPT09IDAgKSB7XHJcblxyXG4gICAgICAvLyBkbyBub3RoaW5nLCBtb2xlY3VsZSBpcyBhbGlnbmVkIHdpdGggRS1maWVsZFxyXG4gICAgICBuZXdEaXBvbGVBbmdsZSA9IGRpcG9sZUFuZ2xlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGRpcG9sZUFuZ2xlID4gMCAmJiBkaXBvbGVBbmdsZSA8IE1hdGguUEkgKSB7XHJcblxyXG4gICAgICAvLyByb3RhdGUgY291bnRlcmNsb2Nrd2lzZVxyXG4gICAgICBuZXdEaXBvbGVBbmdsZSA9IGRpcG9sZUFuZ2xlIC0gZGVsdGFEaXBvbGVBbmdsZTtcclxuICAgICAgaWYgKCBuZXdEaXBvbGVBbmdsZSA8IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIG5ldyBhbmdsZSB3b3VsZCBvdmVyc2hvb3QsIHNldCB0byB6ZXJvXHJcbiAgICAgICAgbmV3RGlwb2xlQW5nbGUgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIHJvdGF0ZSBjbG9ja3dpc2VcclxuICAgICAgbmV3RGlwb2xlQW5nbGUgPSBkaXBvbGVBbmdsZSArIGRlbHRhRGlwb2xlQW5nbGU7XHJcbiAgICAgIGlmICggbmV3RGlwb2xlQW5nbGUgPiAyICogTWF0aC5QSSApIHtcclxuXHJcbiAgICAgICAgLy8gbmV3IGFuZ2xlIHdvdWxkIG92ZXJzaG9vdCwgc2V0IHRvIHplcm9cclxuICAgICAgICBuZXdEaXBvbGVBbmdsZSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjb252ZXJ0IGRpcG9sZSByb3RhdGlvbiB0byBtb2xlY3VsZSByb3RhdGlvblxyXG4gICAgY29uc3QgZGVsdGFNb2xlY3VsZUFuZ2xlID0gbmV3RGlwb2xlQW5nbGUgLSBkaXBvbGVBbmdsZTtcclxuICAgIGxldCBhbmdsZSA9IG1vbGVjdWxlLmFuZ2xlUHJvcGVydHkudmFsdWUgKyBkZWx0YU1vbGVjdWxlQW5nbGU7XHJcblxyXG4gICAgLy8gSWYgZGlwb2xlIGlzIGFsaWduZWQgd2l0aCBtb2xlY3VsZSBvcmllbnRhdGlvbiwgc25hcCB0byB6ZXJvIHdoZW4gd2UncmUgY2xvc2UgZW5vdWdoLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9tb2xlY3VsZS1wb2xhcml0eS9pc3N1ZXMvOTdcclxuICAgIGlmICggbmV3RGlwb2xlQW5nbGUgPT09IDAgJiYgTWF0aC5hYnMoIGFuZ2xlICkgPCAxRS01ICkge1xyXG4gICAgICBhbmdsZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYW5nbGVSYW5nZSA9IG1vbGVjdWxlLmFuZ2xlUHJvcGVydHkucmFuZ2U7XHJcbiAgICBtb2xlY3VsZS5hbmdsZVByb3BlcnR5LnZhbHVlID0gbm9ybWFsaXplQW5nbGUoIGFuZ2xlLCBhbmdsZVJhbmdlLm1pbiApO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVQb2xhcml0eS5yZWdpc3RlciggJ01QTW9kZWwnLCBNUE1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFDM0MsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBRWhELE9BQU9D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