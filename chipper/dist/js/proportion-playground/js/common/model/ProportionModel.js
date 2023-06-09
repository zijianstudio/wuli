// Copyright 2016-2022, University of Colorado Boulder

/**
 * Model for the Explore Screen, which is also reused (with a flag) for the Predict Screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import proportionPlayground from '../../proportionPlayground.js';
import ProportionPlaygroundQueryParameters from '../ProportionPlaygroundQueryParameters.js';
import AppleScene from './apples/AppleScene.js';
import BilliardsScene from './billiards/BilliardsScene.js';
import NecklaceScene from './necklace/NecklaceScene.js';
import PaintScene from './paint/PaintScene.js';
import Scene from './Scene.js';
class ProportionModel {
  /**
   * @param {boolean} predictMode - true for the Predict Screen which has a reveal button
   * @param {Tandem} tandem
   */
  constructor(predictMode, tandem) {
    // @public (read-only) - the model for each scene
    this.necklaceScene = new NecklaceScene(predictMode, tandem.createTandem('necklaceScene'));
    this.paintScene = new PaintScene(predictMode, tandem.createTandem('paintScene'));
    this.billiardsScene = new BilliardsScene(predictMode, tandem.createTandem('billiardsScene'));
    this.appleScene = new AppleScene(predictMode, tandem.createTandem('appleScene'));

    // @private {Array.<Scene>} - List of all scenes in order (can be handled as a group)
    this.scenes = [this.necklaceScene, this.paintScene, this.billiardsScene, this.appleScene];

    // @public {Property.<Scene>} - Our currently-selected scene (can change with a query parameter)
    this.sceneProperty = new Property(this.scenes[ProportionPlaygroundQueryParameters.scene], {
      phetioValueType: ReferenceIO(Scene.SceneIO),
      tandem: tandem.createTandem('sceneProperty')
    });

    // @public (read-only) - for the Predict screen, show a reveal button
    this.predictMode = predictMode;
  }

  /**
   * Reset the model and all of the scenes.
   * @public
   */
  reset() {
    this.sceneProperty.reset();
    this.scenes.forEach(scene => {
      scene.reset();
    });
  }

  /**
   * Step forward in time by dt.
   * @public
   *
   * @param {number} dt - time passed in seconds
   */
  step(dt) {
    // Cap DT at the top level
    dt = Math.min(dt, 0.25);
    this.sceneProperty.value.step(dt);
  }
}
proportionPlayground.register('ProportionModel', ProportionModel);
export default ProportionModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJlZmVyZW5jZUlPIiwicHJvcG9ydGlvblBsYXlncm91bmQiLCJQcm9wb3J0aW9uUGxheWdyb3VuZFF1ZXJ5UGFyYW1ldGVycyIsIkFwcGxlU2NlbmUiLCJCaWxsaWFyZHNTY2VuZSIsIk5lY2tsYWNlU2NlbmUiLCJQYWludFNjZW5lIiwiU2NlbmUiLCJQcm9wb3J0aW9uTW9kZWwiLCJjb25zdHJ1Y3RvciIsInByZWRpY3RNb2RlIiwidGFuZGVtIiwibmVja2xhY2VTY2VuZSIsImNyZWF0ZVRhbmRlbSIsInBhaW50U2NlbmUiLCJiaWxsaWFyZHNTY2VuZSIsImFwcGxlU2NlbmUiLCJzY2VuZXMiLCJzY2VuZVByb3BlcnR5Iiwic2NlbmUiLCJwaGV0aW9WYWx1ZVR5cGUiLCJTY2VuZUlPIiwicmVzZXQiLCJmb3JFYWNoIiwic3RlcCIsImR0IiwiTWF0aCIsIm1pbiIsInZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcm9wb3J0aW9uTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSBFeHBsb3JlIFNjcmVlbiwgd2hpY2ggaXMgYWxzbyByZXVzZWQgKHdpdGggYSBmbGFnKSBmb3IgdGhlIFByZWRpY3QgU2NyZWVuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuaW1wb3J0IFByb3BvcnRpb25QbGF5Z3JvdW5kUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL1Byb3BvcnRpb25QbGF5Z3JvdW5kUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEFwcGxlU2NlbmUgZnJvbSAnLi9hcHBsZXMvQXBwbGVTY2VuZS5qcyc7XHJcbmltcG9ydCBCaWxsaWFyZHNTY2VuZSBmcm9tICcuL2JpbGxpYXJkcy9CaWxsaWFyZHNTY2VuZS5qcyc7XHJcbmltcG9ydCBOZWNrbGFjZVNjZW5lIGZyb20gJy4vbmVja2xhY2UvTmVja2xhY2VTY2VuZS5qcyc7XHJcbmltcG9ydCBQYWludFNjZW5lIGZyb20gJy4vcGFpbnQvUGFpbnRTY2VuZS5qcyc7XHJcbmltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lLmpzJztcclxuXHJcbmNsYXNzIFByb3BvcnRpb25Nb2RlbCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBwcmVkaWN0TW9kZSAtIHRydWUgZm9yIHRoZSBQcmVkaWN0IFNjcmVlbiB3aGljaCBoYXMgYSByZXZlYWwgYnV0dG9uXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwcmVkaWN0TW9kZSwgdGFuZGVtICkge1xyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIHRoZSBtb2RlbCBmb3IgZWFjaCBzY2VuZVxyXG4gICAgdGhpcy5uZWNrbGFjZVNjZW5lID0gbmV3IE5lY2tsYWNlU2NlbmUoIHByZWRpY3RNb2RlLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmVja2xhY2VTY2VuZScgKSApO1xyXG4gICAgdGhpcy5wYWludFNjZW5lID0gbmV3IFBhaW50U2NlbmUoIHByZWRpY3RNb2RlLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGFpbnRTY2VuZScgKSApO1xyXG4gICAgdGhpcy5iaWxsaWFyZHNTY2VuZSA9IG5ldyBCaWxsaWFyZHNTY2VuZSggcHJlZGljdE1vZGUsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiaWxsaWFyZHNTY2VuZScgKSApO1xyXG4gICAgdGhpcy5hcHBsZVNjZW5lID0gbmV3IEFwcGxlU2NlbmUoIHByZWRpY3RNb2RlLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXBwbGVTY2VuZScgKSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48U2NlbmU+fSAtIExpc3Qgb2YgYWxsIHNjZW5lcyBpbiBvcmRlciAoY2FuIGJlIGhhbmRsZWQgYXMgYSBncm91cClcclxuICAgIHRoaXMuc2NlbmVzID0gW1xyXG4gICAgICB0aGlzLm5lY2tsYWNlU2NlbmUsXHJcbiAgICAgIHRoaXMucGFpbnRTY2VuZSxcclxuICAgICAgdGhpcy5iaWxsaWFyZHNTY2VuZSxcclxuICAgICAgdGhpcy5hcHBsZVNjZW5lXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxTY2VuZT59IC0gT3VyIGN1cnJlbnRseS1zZWxlY3RlZCBzY2VuZSAoY2FuIGNoYW5nZSB3aXRoIGEgcXVlcnkgcGFyYW1ldGVyKVxyXG4gICAgdGhpcy5zY2VuZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0aGlzLnNjZW5lc1sgUHJvcG9ydGlvblBsYXlncm91bmRRdWVyeVBhcmFtZXRlcnMuc2NlbmUgXSwge1xyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IFJlZmVyZW5jZUlPKCBTY2VuZS5TY2VuZUlPICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NjZW5lUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gZm9yIHRoZSBQcmVkaWN0IHNjcmVlbiwgc2hvdyBhIHJldmVhbCBidXR0b25cclxuICAgIHRoaXMucHJlZGljdE1vZGUgPSBwcmVkaWN0TW9kZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBtb2RlbCBhbmQgYWxsIG9mIHRoZSBzY2VuZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zY2VuZVByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgdGhpcy5zY2VuZXMuZm9yRWFjaCggc2NlbmUgPT4ge1xyXG4gICAgICBzY2VuZS5yZXNldCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCBmb3J3YXJkIGluIHRpbWUgYnkgZHQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBwYXNzZWQgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgLy8gQ2FwIERUIGF0IHRoZSB0b3AgbGV2ZWxcclxuICAgIGR0ID0gTWF0aC5taW4oIGR0LCAwLjI1ICk7XHJcblxyXG4gICAgdGhpcy5zY2VuZVByb3BlcnR5LnZhbHVlLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG59XHJcblxyXG5wcm9wb3J0aW9uUGxheWdyb3VuZC5yZWdpc3RlciggJ1Byb3BvcnRpb25Nb2RlbCcsIFByb3BvcnRpb25Nb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUHJvcG9ydGlvbk1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBQ2hFLE9BQU9DLG1DQUFtQyxNQUFNLDJDQUEyQztBQUMzRixPQUFPQyxVQUFVLE1BQU0sd0JBQXdCO0FBQy9DLE9BQU9DLGNBQWMsTUFBTSwrQkFBK0I7QUFDMUQsT0FBT0MsYUFBYSxNQUFNLDZCQUE2QjtBQUN2RCxPQUFPQyxVQUFVLE1BQU0sdUJBQXVCO0FBQzlDLE9BQU9DLEtBQUssTUFBTSxZQUFZO0FBRTlCLE1BQU1DLGVBQWUsQ0FBQztFQUNwQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxXQUFXLEVBQUVDLE1BQU0sRUFBRztJQUNqQztJQUNBLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUlQLGFBQWEsQ0FBRUssV0FBVyxFQUFFQyxNQUFNLENBQUNFLFlBQVksQ0FBRSxlQUFnQixDQUFFLENBQUM7SUFDN0YsSUFBSSxDQUFDQyxVQUFVLEdBQUcsSUFBSVIsVUFBVSxDQUFFSSxXQUFXLEVBQUVDLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLFlBQWEsQ0FBRSxDQUFDO0lBQ3BGLElBQUksQ0FBQ0UsY0FBYyxHQUFHLElBQUlYLGNBQWMsQ0FBRU0sV0FBVyxFQUFFQyxNQUFNLENBQUNFLFlBQVksQ0FBRSxnQkFBaUIsQ0FBRSxDQUFDO0lBQ2hHLElBQUksQ0FBQ0csVUFBVSxHQUFHLElBQUliLFVBQVUsQ0FBRU8sV0FBVyxFQUFFQyxNQUFNLENBQUNFLFlBQVksQ0FBRSxZQUFhLENBQUUsQ0FBQzs7SUFFcEY7SUFDQSxJQUFJLENBQUNJLE1BQU0sR0FBRyxDQUNaLElBQUksQ0FBQ0wsYUFBYSxFQUNsQixJQUFJLENBQUNFLFVBQVUsRUFDZixJQUFJLENBQUNDLGNBQWMsRUFDbkIsSUFBSSxDQUFDQyxVQUFVLENBQ2hCOztJQUVEO0lBQ0EsSUFBSSxDQUFDRSxhQUFhLEdBQUcsSUFBSW5CLFFBQVEsQ0FBRSxJQUFJLENBQUNrQixNQUFNLENBQUVmLG1DQUFtQyxDQUFDaUIsS0FBSyxDQUFFLEVBQUU7TUFDM0ZDLGVBQWUsRUFBRXBCLFdBQVcsQ0FBRU8sS0FBSyxDQUFDYyxPQUFRLENBQUM7TUFDN0NWLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsZUFBZ0I7SUFDL0MsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDSCxXQUFXLEdBQUdBLFdBQVc7RUFDaEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRVksS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDSixhQUFhLENBQUNJLEtBQUssQ0FBQyxDQUFDO0lBRTFCLElBQUksQ0FBQ0wsTUFBTSxDQUFDTSxPQUFPLENBQUVKLEtBQUssSUFBSTtNQUM1QkEsS0FBSyxDQUFDRyxLQUFLLENBQUMsQ0FBQztJQUNmLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxJQUFJQSxDQUFFQyxFQUFFLEVBQUc7SUFDVDtJQUNBQSxFQUFFLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFRixFQUFFLEVBQUUsSUFBSyxDQUFDO0lBRXpCLElBQUksQ0FBQ1AsYUFBYSxDQUFDVSxLQUFLLENBQUNKLElBQUksQ0FBRUMsRUFBRyxDQUFDO0VBQ3JDO0FBQ0Y7QUFFQXhCLG9CQUFvQixDQUFDNEIsUUFBUSxDQUFFLGlCQUFpQixFQUFFckIsZUFBZ0IsQ0FBQztBQUVuRSxlQUFlQSxlQUFlIn0=