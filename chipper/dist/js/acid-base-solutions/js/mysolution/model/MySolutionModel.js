// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model for the 'My Solution' screen in 'Acid-Base Solutions' sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
import ABSModel from '../../common/model/ABSModel.js';
import StrongAcid from '../../common/model/solutions/StrongAcid.js';
import StrongBase from '../../common/model/solutions/StrongBase.js';
import WeakAcid from '../../common/model/solutions/WeakAcid.js';
import WeakBase from '../../common/model/solutions/WeakBase.js';

// constants
const DEFAULT_SOLUTION_TYPE = 'weakAcid';
export default class MySolutionModel extends ABSModel {
  // convenience Property that will synchronize with the concentration of the currently selected solution

  // convenience Property that will synchronize with the strength of the currently selected solution

  constructor(tandem) {
    const solutionsTandem = tandem.createTandem('solutions');
    const solutions = [new StrongAcid(solutionsTandem.createTandem('strongAcid')), new WeakAcid(solutionsTandem.createTandem('weakAcid')), new StrongBase(solutionsTandem.createTandem('strongBase')), new WeakBase(solutionsTandem.createTandem('weakBase'))];
    super(solutions, DEFAULT_SOLUTION_TYPE, tandem);

    /**
     * Everything below here is for the convenience of the 'Solution' control panel, which
     * allows the user to change concentration and (for weak solutions) strength.
     * The concentration and strength Properties created here are kept synchronized with
     * whichever solution is currently selected. When the solution changes, the observer
     * wiring is changed. This may have been more appropriate to handle in SolutionControl.
     */

    const defaultSolution = this.solutionsMap.get(DEFAULT_SOLUTION_TYPE);
    assert && assert(defaultSolution);
    this.concentrationProperty = new NumberProperty(defaultSolution.concentrationProperty.value, {
      reentrant: true,
      units: 'mol/L',
      tandem: tandem.createTandem('concentrationProperty')
    });
    this.strengthProperty = new NumberProperty(defaultSolution.strengthProperty.value, {
      reentrant: true,
      tandem: tandem.createTandem('strengthProperty')
    });
    const setStrength = strength => {
      this.strengthProperty.value = strength;
    };
    const setConcentration = concentration => {
      this.concentrationProperty.value = concentration;
    };
    this.solutionTypeProperty.link((newSolutionType, previousSolutionType) => {
      const newSolution = this.solutionsMap.get(newSolutionType);
      assert && assert(newSolution);

      // unlink from previous solution strength and concentration Property
      if (previousSolutionType) {
        const previousSolution = this.solutionsMap.get(previousSolutionType);
        assert && assert(previousSolution);
        previousSolution.strengthProperty.unlink(setStrength);
        previousSolution.concentrationProperty.unlink(setConcentration);

        /*
         * Set concentration of new solution equal to previous solution.
         * Do not do this for strength, see strength observer below and issue #94.
         */
        newSolution.concentrationProperty.value = previousSolution.concentrationProperty.value;
      }

      // link to new solution strength and concentration Properties
      newSolution.strengthProperty.link(setStrength);
      newSolution.concentrationProperty.link(setConcentration);
    });
    this.concentrationProperty.link(concentration => {
      this.solutionsMap.get(this.solutionTypeProperty.value).concentrationProperty.value = concentration;
    });

    /*
     * issue #94:
     * Keep strength of all weak solutions synchronized, so that strength slider
     * maintains the same value when switching between weak solution types.
     * Strong solutions have constant strength, so do not synchronize.
     */
    this.strengthProperty.link(strength => {
      const solutionType = this.solutionTypeProperty.value;
      if (solutionType === 'weakAcid' || solutionType === 'weakBase') {
        this.solutionsMap.get('weakAcid').strengthProperty.value = strength;
        this.solutionsMap.get('weakBase').strengthProperty.value = strength;
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    super.reset();
    this.concentrationProperty.reset();
    this.strengthProperty.reset();
  }
}
acidBaseSolutions.register('MySolutionModel', MySolutionModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsImFjaWRCYXNlU29sdXRpb25zIiwiQUJTTW9kZWwiLCJTdHJvbmdBY2lkIiwiU3Ryb25nQmFzZSIsIldlYWtBY2lkIiwiV2Vha0Jhc2UiLCJERUZBVUxUX1NPTFVUSU9OX1RZUEUiLCJNeVNvbHV0aW9uTW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsInNvbHV0aW9uc1RhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInNvbHV0aW9ucyIsImRlZmF1bHRTb2x1dGlvbiIsInNvbHV0aW9uc01hcCIsImdldCIsImFzc2VydCIsImNvbmNlbnRyYXRpb25Qcm9wZXJ0eSIsInZhbHVlIiwicmVlbnRyYW50IiwidW5pdHMiLCJzdHJlbmd0aFByb3BlcnR5Iiwic2V0U3RyZW5ndGgiLCJzdHJlbmd0aCIsInNldENvbmNlbnRyYXRpb24iLCJjb25jZW50cmF0aW9uIiwic29sdXRpb25UeXBlUHJvcGVydHkiLCJsaW5rIiwibmV3U29sdXRpb25UeXBlIiwicHJldmlvdXNTb2x1dGlvblR5cGUiLCJuZXdTb2x1dGlvbiIsInByZXZpb3VzU29sdXRpb24iLCJ1bmxpbmsiLCJzb2x1dGlvblR5cGUiLCJkaXNwb3NlIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk15U29sdXRpb25Nb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlICdNeSBTb2x1dGlvbicgc2NyZWVuIGluICdBY2lkLUJhc2UgU29sdXRpb25zJyBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGFjaWRCYXNlU29sdXRpb25zIGZyb20gJy4uLy4uL2FjaWRCYXNlU29sdXRpb25zLmpzJztcclxuaW1wb3J0IEFCU01vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BQlNNb2RlbC5qcyc7XHJcbmltcG9ydCBTdHJvbmdBY2lkIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9zb2x1dGlvbnMvU3Ryb25nQWNpZC5qcyc7XHJcbmltcG9ydCBTdHJvbmdCYXNlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9zb2x1dGlvbnMvU3Ryb25nQmFzZS5qcyc7XHJcbmltcG9ydCBXZWFrQWNpZCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvc29sdXRpb25zL1dlYWtBY2lkLmpzJztcclxuaW1wb3J0IFdlYWtCYXNlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9zb2x1dGlvbnMvV2Vha0Jhc2UuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFRkFVTFRfU09MVVRJT05fVFlQRSA9ICd3ZWFrQWNpZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNeVNvbHV0aW9uTW9kZWwgZXh0ZW5kcyBBQlNNb2RlbCB7XHJcblxyXG4gIC8vIGNvbnZlbmllbmNlIFByb3BlcnR5IHRoYXQgd2lsbCBzeW5jaHJvbml6ZSB3aXRoIHRoZSBjb25jZW50cmF0aW9uIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc29sdXRpb25cclxuICBwdWJsaWMgcmVhZG9ubHkgY29uY2VudHJhdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvLyBjb252ZW5pZW5jZSBQcm9wZXJ0eSB0aGF0IHdpbGwgc3luY2hyb25pemUgd2l0aCB0aGUgc3RyZW5ndGggb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzb2x1dGlvblxyXG4gIHB1YmxpYyByZWFkb25seSBzdHJlbmd0aFByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IHNvbHV0aW9uc1RhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzb2x1dGlvbnMnICk7XHJcblxyXG4gICAgY29uc3Qgc29sdXRpb25zID0gW1xyXG4gICAgICBuZXcgU3Ryb25nQWNpZCggc29sdXRpb25zVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0cm9uZ0FjaWQnICkgKSxcclxuICAgICAgbmV3IFdlYWtBY2lkKCBzb2x1dGlvbnNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnd2Vha0FjaWQnICkgKSxcclxuICAgICAgbmV3IFN0cm9uZ0Jhc2UoIHNvbHV0aW9uc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdzdHJvbmdCYXNlJyApICksXHJcbiAgICAgIG5ldyBXZWFrQmFzZSggc29sdXRpb25zVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dlYWtCYXNlJyApIClcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIHNvbHV0aW9ucywgREVGQVVMVF9TT0xVVElPTl9UWVBFLCB0YW5kZW0gKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEV2ZXJ5dGhpbmcgYmVsb3cgaGVyZSBpcyBmb3IgdGhlIGNvbnZlbmllbmNlIG9mIHRoZSAnU29sdXRpb24nIGNvbnRyb2wgcGFuZWwsIHdoaWNoXHJcbiAgICAgKiBhbGxvd3MgdGhlIHVzZXIgdG8gY2hhbmdlIGNvbmNlbnRyYXRpb24gYW5kIChmb3Igd2VhayBzb2x1dGlvbnMpIHN0cmVuZ3RoLlxyXG4gICAgICogVGhlIGNvbmNlbnRyYXRpb24gYW5kIHN0cmVuZ3RoIFByb3BlcnRpZXMgY3JlYXRlZCBoZXJlIGFyZSBrZXB0IHN5bmNocm9uaXplZCB3aXRoXHJcbiAgICAgKiB3aGljaGV2ZXIgc29sdXRpb24gaXMgY3VycmVudGx5IHNlbGVjdGVkLiBXaGVuIHRoZSBzb2x1dGlvbiBjaGFuZ2VzLCB0aGUgb2JzZXJ2ZXJcclxuICAgICAqIHdpcmluZyBpcyBjaGFuZ2VkLiBUaGlzIG1heSBoYXZlIGJlZW4gbW9yZSBhcHByb3ByaWF0ZSB0byBoYW5kbGUgaW4gU29sdXRpb25Db250cm9sLlxyXG4gICAgICovXHJcblxyXG4gICAgY29uc3QgZGVmYXVsdFNvbHV0aW9uID0gdGhpcy5zb2x1dGlvbnNNYXAuZ2V0KCBERUZBVUxUX1NPTFVUSU9OX1RZUEUgKSE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZWZhdWx0U29sdXRpb24gKTtcclxuXHJcbiAgICB0aGlzLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggZGVmYXVsdFNvbHV0aW9uLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICByZWVudHJhbnQ6IHRydWUsXHJcbiAgICAgIHVuaXRzOiAnbW9sL0wnLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb25jZW50cmF0aW9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnN0cmVuZ3RoUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGRlZmF1bHRTb2x1dGlvbi5zdHJlbmd0aFByb3BlcnR5LnZhbHVlLCB7XHJcbiAgICAgIHJlZW50cmFudDogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RyZW5ndGhQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNldFN0cmVuZ3RoID0gKCBzdHJlbmd0aDogbnVtYmVyICkgPT4ge1xyXG4gICAgICB0aGlzLnN0cmVuZ3RoUHJvcGVydHkudmFsdWUgPSBzdHJlbmd0aDtcclxuICAgIH07XHJcbiAgICBjb25zdCBzZXRDb25jZW50cmF0aW9uID0gKCBjb25jZW50cmF0aW9uOiBudW1iZXIgKSA9PiB7XHJcbiAgICAgIHRoaXMuY29uY2VudHJhdGlvblByb3BlcnR5LnZhbHVlID0gY29uY2VudHJhdGlvbjtcclxuICAgIH07XHJcbiAgICB0aGlzLnNvbHV0aW9uVHlwZVByb3BlcnR5LmxpbmsoICggbmV3U29sdXRpb25UeXBlLCBwcmV2aW91c1NvbHV0aW9uVHlwZSApID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IG5ld1NvbHV0aW9uID0gdGhpcy5zb2x1dGlvbnNNYXAuZ2V0KCBuZXdTb2x1dGlvblR5cGUgKSE7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5ld1NvbHV0aW9uICk7XHJcblxyXG4gICAgICAvLyB1bmxpbmsgZnJvbSBwcmV2aW91cyBzb2x1dGlvbiBzdHJlbmd0aCBhbmQgY29uY2VudHJhdGlvbiBQcm9wZXJ0eVxyXG4gICAgICBpZiAoIHByZXZpb3VzU29sdXRpb25UeXBlICkge1xyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzU29sdXRpb24gPSB0aGlzLnNvbHV0aW9uc01hcC5nZXQoIHByZXZpb3VzU29sdXRpb25UeXBlICkhO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByZXZpb3VzU29sdXRpb24gKTtcclxuICAgICAgICBwcmV2aW91c1NvbHV0aW9uLnN0cmVuZ3RoUHJvcGVydHkudW5saW5rKCBzZXRTdHJlbmd0aCApO1xyXG4gICAgICAgIHByZXZpb3VzU29sdXRpb24uY29uY2VudHJhdGlvblByb3BlcnR5LnVubGluayggc2V0Q29uY2VudHJhdGlvbiApO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFNldCBjb25jZW50cmF0aW9uIG9mIG5ldyBzb2x1dGlvbiBlcXVhbCB0byBwcmV2aW91cyBzb2x1dGlvbi5cclxuICAgICAgICAgKiBEbyBub3QgZG8gdGhpcyBmb3Igc3RyZW5ndGgsIHNlZSBzdHJlbmd0aCBvYnNlcnZlciBiZWxvdyBhbmQgaXNzdWUgIzk0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG5ld1NvbHV0aW9uLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHByZXZpb3VzU29sdXRpb24uY29uY2VudHJhdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBsaW5rIHRvIG5ldyBzb2x1dGlvbiBzdHJlbmd0aCBhbmQgY29uY2VudHJhdGlvbiBQcm9wZXJ0aWVzXHJcbiAgICAgIG5ld1NvbHV0aW9uLnN0cmVuZ3RoUHJvcGVydHkubGluayggc2V0U3RyZW5ndGggKTtcclxuICAgICAgbmV3U29sdXRpb24uY29uY2VudHJhdGlvblByb3BlcnR5LmxpbmsoIHNldENvbmNlbnRyYXRpb24gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eS5saW5rKCBjb25jZW50cmF0aW9uID0+IHtcclxuICAgICAgdGhpcy5zb2x1dGlvbnNNYXAuZ2V0KCB0aGlzLnNvbHV0aW9uVHlwZVByb3BlcnR5LnZhbHVlICkhLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGNvbmNlbnRyYXRpb247XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLypcclxuICAgICAqIGlzc3VlICM5NDpcclxuICAgICAqIEtlZXAgc3RyZW5ndGggb2YgYWxsIHdlYWsgc29sdXRpb25zIHN5bmNocm9uaXplZCwgc28gdGhhdCBzdHJlbmd0aCBzbGlkZXJcclxuICAgICAqIG1haW50YWlucyB0aGUgc2FtZSB2YWx1ZSB3aGVuIHN3aXRjaGluZyBiZXR3ZWVuIHdlYWsgc29sdXRpb24gdHlwZXMuXHJcbiAgICAgKiBTdHJvbmcgc29sdXRpb25zIGhhdmUgY29uc3RhbnQgc3RyZW5ndGgsIHNvIGRvIG5vdCBzeW5jaHJvbml6ZS5cclxuICAgICAqL1xyXG4gICAgdGhpcy5zdHJlbmd0aFByb3BlcnR5LmxpbmsoIHN0cmVuZ3RoID0+IHtcclxuICAgICAgY29uc3Qgc29sdXRpb25UeXBlID0gdGhpcy5zb2x1dGlvblR5cGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgaWYgKCBzb2x1dGlvblR5cGUgPT09ICd3ZWFrQWNpZCcgfHwgc29sdXRpb25UeXBlID09PSAnd2Vha0Jhc2UnICkge1xyXG4gICAgICAgIHRoaXMuc29sdXRpb25zTWFwLmdldCggJ3dlYWtBY2lkJyApIS5zdHJlbmd0aFByb3BlcnR5LnZhbHVlID0gc3RyZW5ndGg7XHJcbiAgICAgICAgdGhpcy5zb2x1dGlvbnNNYXAuZ2V0KCAnd2Vha0Jhc2UnICkhLnN0cmVuZ3RoUHJvcGVydHkudmFsdWUgPSBzdHJlbmd0aDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zdHJlbmd0aFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5hY2lkQmFzZVNvbHV0aW9ucy5yZWdpc3RlciggJ015U29sdXRpb25Nb2RlbCcsIE15U29sdXRpb25Nb2RlbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx1Q0FBdUM7QUFHbEUsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCO0FBQzFELE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsVUFBVSxNQUFNLDRDQUE0QztBQUNuRSxPQUFPQyxVQUFVLE1BQU0sNENBQTRDO0FBQ25FLE9BQU9DLFFBQVEs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