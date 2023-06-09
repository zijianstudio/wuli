// Copyright 2015-2022, University of Colorado Boulder

/**
 * MOTHAViewProperties is the base class that defines Properties that are common to all screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
export default class MOTHAViewProperties {
  // is the Key accordion box expanded?

  // is the Spectrometer accordion box expanded?

  // are absorption wavelengths indicated on the wavelength slider?

  //TODO for prototyping
  // number of spectrometer snapshots
  constructor(providedOptions) {
    const options = providedOptions;
    this.keyExpandedProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('keyExpandedProperty')
    });
    this.spectrometerExpandedProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('spectrometerExpandedProperty')
    });
    this.absorptionWavelengthsVisibleProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('absorptionWavelengthsVisibleProperty')
    });
    this.numberOfSnapshotsProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('numberOfSnapshotsProperty')
    });
  }
  reset() {
    this.keyExpandedProperty.reset();
    this.spectrometerExpandedProperty.reset();
    this.absorptionWavelengthsVisibleProperty.reset();
    this.numberOfSnapshotsProperty.reset();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
}
modelsOfTheHydrogenAtom.register('MOTHAViewProperties', MOTHAViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tIiwiTU9USEFWaWV3UHJvcGVydGllcyIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImtleUV4cGFuZGVkUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzcGVjdHJvbWV0ZXJFeHBhbmRlZFByb3BlcnR5IiwiYWJzb3JwdGlvbldhdmVsZW5ndGhzVmlzaWJsZVByb3BlcnR5IiwibnVtYmVyT2ZTbmFwc2hvdHNQcm9wZXJ0eSIsInJlc2V0IiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTU9USEFWaWV3UHJvcGVydGllcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNT1RIQVZpZXdQcm9wZXJ0aWVzIGlzIHRoZSBiYXNlIGNsYXNzIHRoYXQgZGVmaW5lcyBQcm9wZXJ0aWVzIHRoYXQgYXJlIGNvbW1vbiB0byBhbGwgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCB0eXBlIE1PVEhBVmlld1Byb3BlcnRpZXNPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTU9USEFWaWV3UHJvcGVydGllcyB7XHJcblxyXG4gIC8vIGlzIHRoZSBLZXkgYWNjb3JkaW9uIGJveCBleHBhbmRlZD9cclxuICBwdWJsaWMgcmVhZG9ubHkga2V5RXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIGlzIHRoZSBTcGVjdHJvbWV0ZXIgYWNjb3JkaW9uIGJveCBleHBhbmRlZD9cclxuICBwdWJsaWMgcmVhZG9ubHkgc3BlY3Ryb21ldGVyRXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIGFyZSBhYnNvcnB0aW9uIHdhdmVsZW5ndGhzIGluZGljYXRlZCBvbiB0aGUgd2F2ZWxlbmd0aCBzbGlkZXI/XHJcbiAgcHVibGljIHJlYWRvbmx5IGFic29ycHRpb25XYXZlbGVuZ3Roc1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vVE9ETyBmb3IgcHJvdG90eXBpbmdcclxuICAvLyBudW1iZXIgb2Ygc3BlY3Ryb21ldGVyIHNuYXBzaG90c1xyXG4gIHB1YmxpYyByZWFkb25seSBudW1iZXJPZlNuYXBzaG90c1Byb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogTU9USEFWaWV3UHJvcGVydGllc09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHByb3ZpZGVkT3B0aW9ucztcclxuXHJcbiAgICB0aGlzLmtleUV4cGFuZGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAna2V5RXhwYW5kZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc3BlY3Ryb21ldGVyRXhwYW5kZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3BlY3Ryb21ldGVyRXhwYW5kZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWJzb3JwdGlvbldhdmVsZW5ndGhzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhYnNvcnB0aW9uV2F2ZWxlbmd0aHNWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm51bWJlck9mU25hcHNob3RzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJPZlNuYXBzaG90c1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmtleUV4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3BlY3Ryb21ldGVyRXhwYW5kZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hYnNvcnB0aW9uV2F2ZWxlbmd0aHNWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubnVtYmVyT2ZTbmFwc2hvdHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnTU9USEFWaWV3UHJvcGVydGllcycsIE1PVEhBVmlld1Byb3BlcnRpZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBS2xFLE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQU10RSxlQUFlLE1BQU1DLG1CQUFtQixDQUFDO0VBRXZDOztFQUdBOztFQUdBOztFQUdBO0VBQ0E7RUFHT0MsV0FBV0EsQ0FBRUMsZUFBMkMsRUFBRztJQUVoRSxNQUFNQyxPQUFPLEdBQUdELGVBQWU7SUFFL0IsSUFBSSxDQUFDRSxtQkFBbUIsR0FBRyxJQUFJUCxlQUFlLENBQUUsSUFBSSxFQUFFO01BQ3BEUSxNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUscUJBQXNCO0lBQzdELENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MsNEJBQTRCLEdBQUcsSUFBSVYsZUFBZSxDQUFFLEtBQUssRUFBRTtNQUM5RFEsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLDhCQUErQjtJQUN0RSxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNFLG9DQUFvQyxHQUFHLElBQUlYLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDdEVRLE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSxzQ0FBdUM7SUFDOUUsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDRyx5QkFBeUIsR0FBRyxJQUFJWCxjQUFjLENBQUUsQ0FBQyxFQUFFO01BQ3RETyxNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUsMkJBQTRCO0lBQ25FLENBQUUsQ0FBQztFQUNMO0VBRU9JLEtBQUtBLENBQUEsRUFBUztJQUNuQixJQUFJLENBQUNOLG1CQUFtQixDQUFDTSxLQUFLLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUNILDRCQUE0QixDQUFDRyxLQUFLLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUNGLG9DQUFvQyxDQUFDRSxLQUFLLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUNELHlCQUF5QixDQUFDQyxLQUFLLENBQUMsQ0FBQztFQUN4QztFQUVPQyxPQUFPQSxDQUFBLEVBQVM7SUFDckJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztFQUMzRjtBQUNGO0FBRUFiLHVCQUF1QixDQUFDYyxRQUFRLENBQUUscUJBQXFCLEVBQUViLG1CQUFvQixDQUFDIn0=