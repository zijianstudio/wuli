// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import { MassTag } from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import TwoBlockMode from '../../common/model/TwoBlockMode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
export default class DensityIntroModel extends DensityBuoyancyModel {
  constructor(options) {
    const tandem = options.tandem;
    super(combineOptions({
      showMassesDefault: true,
      canShowForces: false
    }, options));
    this.modeProperty = new EnumerationProperty(TwoBlockMode.ONE_BLOCK, {
      tandem: tandem.createTandem('modeProperty')
    });
    const blocksTandem = tandem.createTandem('blocks');
    const minScreenVolume = 0.001 - 1e-7;
    const maxScreenVolume = 0.01 + 1e-7;
    this.primaryMass = Cube.createWithMass(this.engine, Material.WOOD, new Vector2(-0.2, 0.2), 2, {
      tag: MassTag.PRIMARY,
      tandem: blocksTandem.createTandem('blockA'),
      minVolume: minScreenVolume,
      maxVolume: maxScreenVolume
    });
    this.availableMasses.push(this.primaryMass);
    this.secondaryMass = Cube.createWithMass(this.engine, Material.ALUMINUM, new Vector2(0.2, 0.2), 13.5, {
      tag: MassTag.SECONDARY,
      tandem: blocksTandem.createTandem('blockB'),
      visible: false,
      minVolume: minScreenVolume,
      maxVolume: maxScreenVolume
    });
    this.availableMasses.push(this.secondaryMass);
    this.modeProperty.link(mode => {
      this.secondaryMass.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    });
    this.densityExpandedProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('densityExpandedProperty')
    });
  }

  /**
   * Resets things to their original values.
   */
  reset() {
    this.modeProperty.reset();
    this.primaryMass.reset();
    this.secondaryMass.reset();
    this.densityExpandedProperty.reset();
    super.reset();
  }
}
densityBuoyancyCommon.register('DensityIntroModel', DensityIntroModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiVmVjdG9yMiIsImNvbWJpbmVPcHRpb25zIiwiQ3ViZSIsIkRlbnNpdHlCdW95YW5jeU1vZGVsIiwiTWFzc1RhZyIsIk1hdGVyaWFsIiwiVHdvQmxvY2tNb2RlIiwiZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIiwiRGVuc2l0eUludHJvTW9kZWwiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJzaG93TWFzc2VzRGVmYXVsdCIsImNhblNob3dGb3JjZXMiLCJtb2RlUHJvcGVydHkiLCJPTkVfQkxPQ0siLCJjcmVhdGVUYW5kZW0iLCJibG9ja3NUYW5kZW0iLCJtaW5TY3JlZW5Wb2x1bWUiLCJtYXhTY3JlZW5Wb2x1bWUiLCJwcmltYXJ5TWFzcyIsImNyZWF0ZVdpdGhNYXNzIiwiZW5naW5lIiwiV09PRCIsInRhZyIsIlBSSU1BUlkiLCJtaW5Wb2x1bWUiLCJtYXhWb2x1bWUiLCJhdmFpbGFibGVNYXNzZXMiLCJwdXNoIiwic2Vjb25kYXJ5TWFzcyIsIkFMVU1JTlVNIiwiU0VDT05EQVJZIiwidmlzaWJsZSIsImxpbmsiLCJtb2RlIiwiaW50ZXJuYWxWaXNpYmxlUHJvcGVydHkiLCJ2YWx1ZSIsIlRXT19CTE9DS1MiLCJkZW5zaXR5RXhwYW5kZWRQcm9wZXJ0eSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZW5zaXR5SW50cm9Nb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgbWFpbiBtb2RlbCBmb3IgdGhlIEludHJvIHNjcmVlbiBvZiB0aGUgRGVuc2l0eSBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgQ3ViZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ3ViZS5qcyc7XHJcbmltcG9ydCBDdWJvaWQgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0N1Ym9pZC5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lNb2RlbCwgeyBEZW5zaXR5QnVveWFuY3lNb2RlbE9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRGVuc2l0eUJ1b3lhbmN5TW9kZWwuanMnO1xyXG5pbXBvcnQgeyBNYXNzVGFnIH0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL01hc3MuanMnO1xyXG5pbXBvcnQgTWF0ZXJpYWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL01hdGVyaWFsLmpzJztcclxuaW1wb3J0IFR3b0Jsb2NrTW9kZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvVHdvQmxvY2tNb2RlLmpzJztcclxuaW1wb3J0IGRlbnNpdHlCdW95YW5jeUNvbW1vbiBmcm9tICcuLi8uLi9kZW5zaXR5QnVveWFuY3lDb21tb24uanMnO1xyXG5cclxuZXhwb3J0IHR5cGUgRGVuc2l0eUludHJvTW9kZWxPcHRpb25zID0gRGVuc2l0eUJ1b3lhbmN5TW9kZWxPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVuc2l0eUludHJvTW9kZWwgZXh0ZW5kcyBEZW5zaXR5QnVveWFuY3lNb2RlbCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBtb2RlUHJvcGVydHk6IFByb3BlcnR5PFR3b0Jsb2NrTW9kZT47XHJcbiAgcHVibGljIHJlYWRvbmx5IHByaW1hcnlNYXNzOiBDdWJvaWQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IHNlY29uZGFyeU1hc3M6IEN1Ym9pZDtcclxuICBwdWJsaWMgcmVhZG9ubHkgZGVuc2l0eUV4cGFuZGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM6IERlbnNpdHlJbnRyb01vZGVsT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCB0YW5kZW0gPSBvcHRpb25zLnRhbmRlbTtcclxuXHJcbiAgICBzdXBlciggY29tYmluZU9wdGlvbnM8RGVuc2l0eUludHJvTW9kZWxPcHRpb25zPigge1xyXG4gICAgICBzaG93TWFzc2VzRGVmYXVsdDogdHJ1ZSxcclxuICAgICAgY2FuU2hvd0ZvcmNlczogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKSApO1xyXG5cclxuICAgIHRoaXMubW9kZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIFR3b0Jsb2NrTW9kZS5PTkVfQkxPQ0ssIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYmxvY2tzVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Jsb2NrcycgKTtcclxuXHJcbiAgICBjb25zdCBtaW5TY3JlZW5Wb2x1bWUgPSAwLjAwMSAtIDFlLTc7XHJcbiAgICBjb25zdCBtYXhTY3JlZW5Wb2x1bWUgPSAwLjAxICsgMWUtNztcclxuXHJcbiAgICB0aGlzLnByaW1hcnlNYXNzID0gQ3ViZS5jcmVhdGVXaXRoTWFzcyggdGhpcy5lbmdpbmUsIE1hdGVyaWFsLldPT0QsIG5ldyBWZWN0b3IyKCAtMC4yLCAwLjIgKSwgMiwge1xyXG4gICAgICB0YWc6IE1hc3NUYWcuUFJJTUFSWSxcclxuICAgICAgdGFuZGVtOiBibG9ja3NUYW5kZW0uY3JlYXRlVGFuZGVtKCAnYmxvY2tBJyApLFxyXG5cclxuICAgICAgbWluVm9sdW1lOiBtaW5TY3JlZW5Wb2x1bWUsXHJcbiAgICAgIG1heFZvbHVtZTogbWF4U2NyZWVuVm9sdW1lXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmF2YWlsYWJsZU1hc3Nlcy5wdXNoKCB0aGlzLnByaW1hcnlNYXNzICk7XHJcbiAgICB0aGlzLnNlY29uZGFyeU1hc3MgPSBDdWJlLmNyZWF0ZVdpdGhNYXNzKCB0aGlzLmVuZ2luZSwgTWF0ZXJpYWwuQUxVTUlOVU0sIG5ldyBWZWN0b3IyKCAwLjIsIDAuMiApLCAxMy41LCB7XHJcbiAgICAgIHRhZzogTWFzc1RhZy5TRUNPTkRBUlksXHJcbiAgICAgIHRhbmRlbTogYmxvY2tzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Jsb2NrQicgKSxcclxuICAgICAgdmlzaWJsZTogZmFsc2UsXHJcblxyXG4gICAgICBtaW5Wb2x1bWU6IG1pblNjcmVlblZvbHVtZSxcclxuICAgICAgbWF4Vm9sdW1lOiBtYXhTY3JlZW5Wb2x1bWVcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYXZhaWxhYmxlTWFzc2VzLnB1c2goIHRoaXMuc2Vjb25kYXJ5TWFzcyApO1xyXG5cclxuICAgIHRoaXMubW9kZVByb3BlcnR5LmxpbmsoIG1vZGUgPT4ge1xyXG4gICAgICB0aGlzLnNlY29uZGFyeU1hc3MuaW50ZXJuYWxWaXNpYmxlUHJvcGVydHkudmFsdWUgPSBtb2RlID09PSBUd29CbG9ja01vZGUuVFdPX0JMT0NLUztcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRlbnNpdHlFeHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkZW5zaXR5RXhwYW5kZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoaW5ncyB0byB0aGVpciBvcmlnaW5hbCB2YWx1ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tb2RlUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnByaW1hcnlNYXNzLnJlc2V0KCk7XHJcbiAgICB0aGlzLnNlY29uZGFyeU1hc3MucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLmRlbnNpdHlFeHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmRlbnNpdHlCdW95YW5jeUNvbW1vbi5yZWdpc3RlciggJ0RlbnNpdHlJbnRyb01vZGVsJywgRGVuc2l0eUludHJvTW9kZWwgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBRTVFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsY0FBYyxRQUFRLHVDQUF1QztBQUN0RSxPQUFPQyxJQUFJLE1BQU0sNEJBQTRCO0FBRTdDLE9BQU9DLG9CQUFvQixNQUF1Qyw0Q0FBNEM7QUFDOUcsU0FBU0MsT0FBTyxRQUFRLDRCQUE0QjtBQUNwRCxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBSWxFLGVBQWUsTUFBTUMsaUJBQWlCLFNBQVNMLG9CQUFvQixDQUFDO0VBTzNETSxXQUFXQSxDQUFFQyxPQUFpQyxFQUFHO0lBRXRELE1BQU1DLE1BQU0sR0FBR0QsT0FBTyxDQUFDQyxNQUFNO0lB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