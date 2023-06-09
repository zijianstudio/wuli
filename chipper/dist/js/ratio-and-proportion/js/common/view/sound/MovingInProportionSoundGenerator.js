// Copyright 2020-2022, University of Colorado Boulder

/**
 * A looped sound that plays when both hands are moving in the same direction, and in proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Multilink from '../../../../../axon/js/Multilink.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import CompositeSoundClip from '../../../../../tambo/js/sound-generators/CompositeSoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import movingInProportionChoirLoop_mp3 from '../../../../sounds/moving-in-proportion/movingInProportionChoirLoop_mp3.js';
import movingInProportionOrganLoop_mp3 from '../../../../sounds/moving-in-proportion/movingInProportionOrganLoop_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
class MovingInProportionSoundGenerator extends SoundGenerator {
  constructor(model, providedOptions) {
    const options = optionize()({
      initialOutputLevel: 0.13
    }, providedOptions);
    super(options);
    this.movingInProportionSoundClip = new CompositeSoundClip([{
      sound: movingInProportionChoirLoop_mp3,
      options: {
        loop: true,
        trimSilence: true
      }
    }, {
      sound: movingInProportionOrganLoop_mp3,
      options: {
        loop: true,
        initialOutputLevel: 0.6,
        trimSilence: true
      }
    }]);
    this.movingInProportionSoundClip.connect(this.soundSourceDestination);
    Multilink.multilink([model.ratio.movingInDirectionProperty, model.inProportionProperty, model.ratio.tupleProperty, model.ratioFitnessProperty], (movingInDirection, inProportion, tuple, ratioFitness) => {
      if (movingInDirection &&
      // only when moving
      !model.valuesTooSmallForInProportion() &&
      // no moving in proportion success if too small
      inProportion &&
      // must be fit enough to play the moving in proportion success
      !model.ratioEvenButNotAtTarget() // don't allow this sound if target isn't 1 but both values are 1
      ) {
        this.movingInProportionSoundClip.setOutputLevel(1, 0.1);
        !this.movingInProportionSoundClip.isPlaying && this.movingInProportionSoundClip.play();
      } else {
        this.movingInProportionSoundClip.setOutputLevel(0, 0.2);
      }
    });
  }

  /**
   * stop any in-progress sound generation
   */
  reset() {
    this.movingInProportionSoundClip.stop();
  }
}
ratioAndProportion.register('MovingInProportionSoundGenerator', MovingInProportionSoundGenerator);
export default MovingInProportionSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJvcHRpb25pemUiLCJDb21wb3NpdGVTb3VuZENsaXAiLCJTb3VuZEdlbmVyYXRvciIsIm1vdmluZ0luUHJvcG9ydGlvbkNob2lyTG9vcF9tcDMiLCJtb3ZpbmdJblByb3BvcnRpb25Pcmdhbkxvb3BfbXAzIiwicmF0aW9BbmRQcm9wb3J0aW9uIiwiTW92aW5nSW5Qcm9wb3J0aW9uU291bmRHZW5lcmF0b3IiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImluaXRpYWxPdXRwdXRMZXZlbCIsIm1vdmluZ0luUHJvcG9ydGlvblNvdW5kQ2xpcCIsInNvdW5kIiwibG9vcCIsInRyaW1TaWxlbmNlIiwiY29ubmVjdCIsInNvdW5kU291cmNlRGVzdGluYXRpb24iLCJtdWx0aWxpbmsiLCJyYXRpbyIsIm1vdmluZ0luRGlyZWN0aW9uUHJvcGVydHkiLCJpblByb3BvcnRpb25Qcm9wZXJ0eSIsInR1cGxlUHJvcGVydHkiLCJyYXRpb0ZpdG5lc3NQcm9wZXJ0eSIsIm1vdmluZ0luRGlyZWN0aW9uIiwiaW5Qcm9wb3J0aW9uIiwidHVwbGUiLCJyYXRpb0ZpdG5lc3MiLCJ2YWx1ZXNUb29TbWFsbEZvckluUHJvcG9ydGlvbiIsInJhdGlvRXZlbkJ1dE5vdEF0VGFyZ2V0Iiwic2V0T3V0cHV0TGV2ZWwiLCJpc1BsYXlpbmciLCJwbGF5IiwicmVzZXQiLCJzdG9wIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb3ZpbmdJblByb3BvcnRpb25Tb3VuZEdlbmVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGxvb3BlZCBzb3VuZCB0aGF0IHBsYXlzIHdoZW4gYm90aCBoYW5kcyBhcmUgbW92aW5nIGluIHRoZSBzYW1lIGRpcmVjdGlvbiwgYW5kIGluIHByb3BvcnRpb25cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IENvbXBvc2l0ZVNvdW5kQ2xpcCBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL0NvbXBvc2l0ZVNvdW5kQ2xpcC5qcyc7XHJcbmltcG9ydCBTb3VuZEdlbmVyYXRvciwgeyBTb3VuZEdlbmVyYXRvck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IG1vdmluZ0luUHJvcG9ydGlvbkNob2lyTG9vcF9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL21vdmluZy1pbi1wcm9wb3J0aW9uL21vdmluZ0luUHJvcG9ydGlvbkNob2lyTG9vcF9tcDMuanMnO1xyXG5pbXBvcnQgbW92aW5nSW5Qcm9wb3J0aW9uT3JnYW5Mb29wX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvbW92aW5nLWluLXByb3BvcnRpb24vbW92aW5nSW5Qcm9wb3J0aW9uT3JnYW5Mb29wX21wMy5qcyc7XHJcbmltcG9ydCByYXRpb0FuZFByb3BvcnRpb24gZnJvbSAnLi4vLi4vLi4vcmF0aW9BbmRQcm9wb3J0aW9uLmpzJztcclxuaW1wb3J0IFJBUE1vZGVsIGZyb20gJy4uLy4uL21vZGVsL1JBUE1vZGVsLmpzJztcclxuXHJcbmNsYXNzIE1vdmluZ0luUHJvcG9ydGlvblNvdW5kR2VuZXJhdG9yIGV4dGVuZHMgU291bmRHZW5lcmF0b3Ige1xyXG5cclxuICBwcml2YXRlIG1vdmluZ0luUHJvcG9ydGlvblNvdW5kQ2xpcDogQ29tcG9zaXRlU291bmRDbGlwO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBSQVBNb2RlbCwgcHJvdmlkZWRPcHRpb25zPzogU291bmRHZW5lcmF0b3JPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U291bmRHZW5lcmF0b3JPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zPigpKCB7XHJcbiAgICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC4xM1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLm1vdmluZ0luUHJvcG9ydGlvblNvdW5kQ2xpcCA9IG5ldyBDb21wb3NpdGVTb3VuZENsaXAoIFtcclxuICAgICAge1xyXG4gICAgICAgIHNvdW5kOiBtb3ZpbmdJblByb3BvcnRpb25DaG9pckxvb3BfbXAzLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgICB0cmltU2lsZW5jZTogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHNvdW5kOiBtb3ZpbmdJblByb3BvcnRpb25Pcmdhbkxvb3BfbXAzLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNixcclxuICAgICAgICAgIHRyaW1TaWxlbmNlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdICk7XHJcbiAgICB0aGlzLm1vdmluZ0luUHJvcG9ydGlvblNvdW5kQ2xpcC5jb25uZWN0KCB0aGlzLnNvdW5kU291cmNlRGVzdGluYXRpb24gKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXHJcbiAgICAgIG1vZGVsLnJhdGlvLm1vdmluZ0luRGlyZWN0aW9uUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmluUHJvcG9ydGlvblByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5yYXRpby50dXBsZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5yYXRpb0ZpdG5lc3NQcm9wZXJ0eVxyXG4gICAgXSwgKCBtb3ZpbmdJbkRpcmVjdGlvbiwgaW5Qcm9wb3J0aW9uLCB0dXBsZSwgcmF0aW9GaXRuZXNzICkgPT4ge1xyXG4gICAgICBpZiAoIG1vdmluZ0luRGlyZWN0aW9uICYmIC8vIG9ubHkgd2hlbiBtb3ZpbmdcclxuICAgICAgICAgICAhbW9kZWwudmFsdWVzVG9vU21hbGxGb3JJblByb3BvcnRpb24oKSAmJiAvLyBubyBtb3ZpbmcgaW4gcHJvcG9ydGlvbiBzdWNjZXNzIGlmIHRvbyBzbWFsbFxyXG4gICAgICAgICAgIGluUHJvcG9ydGlvbiAmJiAvLyBtdXN0IGJlIGZpdCBlbm91Z2ggdG8gcGxheSB0aGUgbW92aW5nIGluIHByb3BvcnRpb24gc3VjY2Vzc1xyXG4gICAgICAgICAgICFtb2RlbC5yYXRpb0V2ZW5CdXROb3RBdFRhcmdldCgpICAvLyBkb24ndCBhbGxvdyB0aGlzIHNvdW5kIGlmIHRhcmdldCBpc24ndCAxIGJ1dCBib3RoIHZhbHVlcyBhcmUgMVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLm1vdmluZ0luUHJvcG9ydGlvblNvdW5kQ2xpcC5zZXRPdXRwdXRMZXZlbCggMSwgMC4xICk7XHJcbiAgICAgICAgIXRoaXMubW92aW5nSW5Qcm9wb3J0aW9uU291bmRDbGlwLmlzUGxheWluZyAmJiB0aGlzLm1vdmluZ0luUHJvcG9ydGlvblNvdW5kQ2xpcC5wbGF5KCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb3ZpbmdJblByb3BvcnRpb25Tb3VuZENsaXAuc2V0T3V0cHV0TGV2ZWwoIDAsIDAuMiApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdG9wIGFueSBpbi1wcm9ncmVzcyBzb3VuZCBnZW5lcmF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tb3ZpbmdJblByb3BvcnRpb25Tb3VuZENsaXAuc3RvcCgpO1xyXG4gIH1cclxufVxyXG5cclxucmF0aW9BbmRQcm9wb3J0aW9uLnJlZ2lzdGVyKCAnTW92aW5nSW5Qcm9wb3J0aW9uU291bmRHZW5lcmF0b3InLCBNb3ZpbmdJblByb3BvcnRpb25Tb3VuZEdlbmVyYXRvciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW92aW5nSW5Qcm9wb3J0aW9uU291bmRHZW5lcmF0b3I7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxxQ0FBcUM7QUFDM0QsT0FBT0MsU0FBUyxNQUE0QiwwQ0FBMEM7QUFDdEYsT0FBT0Msa0JBQWtCLE1BQU0sZ0VBQWdFO0FBQy9GLE9BQU9DLGNBQWMsTUFBaUMsNERBQTREO0FBQ2xILE9BQU9DLCtCQUErQixNQUFNLDRFQUE0RTtBQUN4SCxPQUFPQywrQkFBK0IsTUFBTSw0RUFBNEU7QUFDeEgsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDO0FBRy9ELE1BQU1DLGdDQUFnQyxTQUFTSixjQUFjLENBQUM7RUFJckRLLFdBQVdBLENBQUVDLEtBQWUsRUFBRUMsZUFBdUMsRUFBRztJQUU3RSxNQUFNQyxPQUFPLEdBQUdWLFNBQVMsQ0FBMEMsQ0FBQyxDQUFFO01BQ3BFVyxrQkFBa0IsRUFBRTtJQUN0QixDQUFDLEVBQUVGLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFQyxPQUFRLENBQUM7SUFFaEIsSUFBSSxDQUFDRSwyQkFBMkIsR0FBRyxJQUFJWCxrQkFBa0IsQ0FBRSxDQUN6RDtNQUNFWSxLQUFLLEVBQUVWLCtCQUErQjtNQUN0Q08sT0FBTyxFQUFFO1FBQ1BJLElBQUksRUFBRSxJQUFJO1FBQ1ZDLFdBQVcsRUFBRTtNQUNmO0lBQ0YsQ0FBQyxFQUNEO01BQ0VGLEtBQUssRUFBRVQsK0JBQStCO01BQ3RDTSxPQUFPLEVBQUU7UUFDUEksSUFBSSxFQUFFLElBQUk7UUFDVkgsa0JBQWtCLEVBQUUsR0FBRztRQUN2QkksV0FBVyxFQUFFO01BQ2Y7SUFDRixDQUFDLENBQ0QsQ0FBQztJQUNILElBQUksQ0FBQ0gsMkJBQTJCLENBQUNJLE9BQU8sQ0FBRSxJQUFJLENBQUNDLHNCQUF1QixDQUFDO0lBRXZFbEIsU0FBUyxDQUFDbUIsU0FBUyxDQUFFLENBQ25CVixLQUFLLENBQUNXLEtBQUssQ0FBQ0MseUJBQXlCLEVBQ3JDWixLQUFLLENBQUNhLG9CQUFvQixFQUMxQmIsS0FBSyxDQUFDVyxLQUFLLENBQUNHLGFBQWEsRUFDekJkLEtBQUssQ0FBQ2Usb0JBQW9CLENBQzNCLEVBQUUsQ0FBRUMsaUJBQWlCLEVBQUVDLFlBQVksRUFBRUMsS0FBSyxFQUFFQyxZQUFZLEtBQU07TUFDN0QsSUFBS0gsaUJBQWlCO01BQUk7TUFDckIsQ0FBQ2hCLEtBQUssQ0FBQ29CLDZCQUE2QixDQUFDLENBQUM7TUFBSTtNQUMxQ0gsWUFBWTtNQUFJO01BQ2hCLENBQUNqQixLQUFLLENBQUNxQix1QkFBdUIsQ0FBQyxDQUFDLENBQUU7TUFBQSxFQUNyQztRQUNBLElBQUksQ0FBQ2pCLDJCQUEyQixDQUFDa0IsY0FBYyxDQUFFLENBQUMsRUFBRSxHQUFJLENBQUM7UUFDekQsQ0FBQyxJQUFJLENBQUNsQiwyQkFBMkIsQ0FBQ21CLFNBQVMsSUFBSSxJQUFJLENBQUNuQiwyQkFBMkIsQ0FBQ29CLElBQUksQ0FBQyxDQUFDO01BQ3hGLENBQUMsTUFDSTtRQUNILElBQUksQ0FBQ3BCLDJCQUEyQixDQUFDa0IsY0FBYyxDQUFFLENBQUMsRUFBRSxHQUFJLENBQUM7TUFDM0Q7SUFDRixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7RUFDU0csS0FBS0EsQ0FBQSxFQUFTO0lBQ25CLElBQUksQ0FBQ3JCLDJCQUEyQixDQUFDc0IsSUFBSSxDQUFDLENBQUM7RUFDekM7QUFDRjtBQUVBN0Isa0JBQWtCLENBQUM4QixRQUFRLENBQUUsa0NBQWtDLEVBQUU3QixnQ0FBaUMsQ0FBQztBQUVuRyxlQUFlQSxnQ0FBZ0MifQ==