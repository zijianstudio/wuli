// Copyright 2015-2022, University of Colorado Boulder

/**
 * EnergyLevelsModel is the model for the 'Energy Levels' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import BohrModel from '../../common/model/BohrModel.js';
import DeBroglieModel from '../../common/model/DeBroglieModel.js';
import MOTHAModel from '../../common/model/MOTHAModel.js';
import SchrodingerModel from '../../common/model/SchrodingerModel.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ZoomedInBox from '../../common/model/ZoomedInBox.js';
import MOTHAConstants from '../../common/MOTHAConstants.js';
export default class EnergyLevelsModel extends MOTHAModel {
  // predictive models supported by this screen

  constructor(providedOptions) {
    const options = optionize()({
      //TODO default values for options
    }, providedOptions);
    const zoomedInBox = new ZoomedInBox(MOTHAConstants.ZOOMED_IN_BOX_MODEL_SIZE);
    const bohrModel = new BohrModel(zoomedInBox, {
      tandem: options.tandem.createTandem('bohrModel')
    });
    const deBroglieModel = new DeBroglieModel(zoomedInBox, {
      tandem: options.tandem.createTandem('deBroglieModel')
    });
    const schrodingerModel = new SchrodingerModel(zoomedInBox, {
      tandem: options.tandem.createTandem('schrodingerModel')
    });

    // Predictive models supported by this screen, in the order that they will appear in the UI
    const predictiveModels = [bohrModel, deBroglieModel, schrodingerModel];

    //TODO address this with an interface?
    assert && assert(_.every(predictiveModels, model => model.hasTransitionWavelengths), 'all models in this screen must include the concept of transition wavelengths');
    super(zoomedInBox, predictiveModels, bohrModel, options);
    this.bohrModel = bohrModel;
    this.deBroglieModel = deBroglieModel;
    this.schrodingerModel = schrodingerModel;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('EnergyLevelsModel', EnergyLevelsModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJCb2hyTW9kZWwiLCJEZUJyb2dsaWVNb2RlbCIsIk1PVEhBTW9kZWwiLCJTY2hyb2Rpbmdlck1vZGVsIiwibW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20iLCJab29tZWRJbkJveCIsIk1PVEhBQ29uc3RhbnRzIiwiRW5lcmd5TGV2ZWxzTW9kZWwiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ6b29tZWRJbkJveCIsIlpPT01FRF9JTl9CT1hfTU9ERUxfU0laRSIsImJvaHJNb2RlbCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImRlQnJvZ2xpZU1vZGVsIiwic2Nocm9kaW5nZXJNb2RlbCIsInByZWRpY3RpdmVNb2RlbHMiLCJhc3NlcnQiLCJfIiwiZXZlcnkiLCJtb2RlbCIsImhhc1RyYW5zaXRpb25XYXZlbGVuZ3RocyIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneUxldmVsc01vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVuZXJneUxldmVsc01vZGVsIGlzIHRoZSBtb2RlbCBmb3IgdGhlICdFbmVyZ3kgTGV2ZWxzJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBCb2hyTW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0JvaHJNb2RlbC5qcyc7XHJcbmltcG9ydCBEZUJyb2dsaWVNb2RlbCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRGVCcm9nbGllTW9kZWwuanMnO1xyXG5pbXBvcnQgTU9USEFNb2RlbCwgeyBNT1RIQU1vZGVsT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9NT1RIQU1vZGVsLmpzJztcclxuaW1wb3J0IFNjaHJvZGluZ2VyTW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NjaHJvZGluZ2VyTW9kZWwuanMnO1xyXG5pbXBvcnQgbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20gZnJvbSAnLi4vLi4vbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgWm9vbWVkSW5Cb3ggZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1pvb21lZEluQm94LmpzJztcclxuaW1wb3J0IE1PVEhBQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9NT1RIQUNvbnN0YW50cy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgRW5lcmd5TGV2ZWxzTW9kZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBNT1RIQU1vZGVsT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuZXJneUxldmVsc01vZGVsIGV4dGVuZHMgTU9USEFNb2RlbCB7XHJcblxyXG4gIC8vIHByZWRpY3RpdmUgbW9kZWxzIHN1cHBvcnRlZCBieSB0aGlzIHNjcmVlblxyXG4gIHB1YmxpYyByZWFkb25seSBib2hyTW9kZWw6IEJvaHJNb2RlbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgZGVCcm9nbGllTW9kZWw6IERlQnJvZ2xpZU1vZGVsO1xyXG4gIHB1YmxpYyByZWFkb25seSBzY2hyb2Rpbmdlck1vZGVsOiBTY2hyb2Rpbmdlck1vZGVsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogRW5lcmd5TGV2ZWxzTW9kZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RW5lcmd5TGV2ZWxzTW9kZWxPcHRpb25zLCBTZWxmT3B0aW9ucywgTU9USEFNb2RlbE9wdGlvbnM+KCkoIHtcclxuICAgICAgLy9UT0RPIGRlZmF1bHQgdmFsdWVzIGZvciBvcHRpb25zXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB6b29tZWRJbkJveCA9IG5ldyBab29tZWRJbkJveCggTU9USEFDb25zdGFudHMuWk9PTUVEX0lOX0JPWF9NT0RFTF9TSVpFICk7XHJcblxyXG4gICAgY29uc3QgYm9ock1vZGVsID0gbmV3IEJvaHJNb2RlbCggem9vbWVkSW5Cb3gsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdib2hyTW9kZWwnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBkZUJyb2dsaWVNb2RlbCA9IG5ldyBEZUJyb2dsaWVNb2RlbCggem9vbWVkSW5Cb3gsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkZUJyb2dsaWVNb2RlbCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNjaHJvZGluZ2VyTW9kZWwgPSBuZXcgU2Nocm9kaW5nZXJNb2RlbCggem9vbWVkSW5Cb3gsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzY2hyb2Rpbmdlck1vZGVsJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUHJlZGljdGl2ZSBtb2RlbHMgc3VwcG9ydGVkIGJ5IHRoaXMgc2NyZWVuLCBpbiB0aGUgb3JkZXIgdGhhdCB0aGV5IHdpbGwgYXBwZWFyIGluIHRoZSBVSVxyXG4gICAgY29uc3QgcHJlZGljdGl2ZU1vZGVscyA9IFtcclxuICAgICAgYm9ock1vZGVsLFxyXG4gICAgICBkZUJyb2dsaWVNb2RlbCxcclxuICAgICAgc2Nocm9kaW5nZXJNb2RlbFxyXG4gICAgXTtcclxuXHJcbiAgICAvL1RPRE8gYWRkcmVzcyB0aGlzIHdpdGggYW4gaW50ZXJmYWNlP1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggcHJlZGljdGl2ZU1vZGVscywgbW9kZWwgPT4gbW9kZWwuaGFzVHJhbnNpdGlvbldhdmVsZW5ndGhzICksXHJcbiAgICAgICdhbGwgbW9kZWxzIGluIHRoaXMgc2NyZWVuIG11c3QgaW5jbHVkZSB0aGUgY29uY2VwdCBvZiB0cmFuc2l0aW9uIHdhdmVsZW5ndGhzJyApO1xyXG5cclxuICAgIHN1cGVyKCB6b29tZWRJbkJveCwgcHJlZGljdGl2ZU1vZGVscywgYm9ock1vZGVsLCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5ib2hyTW9kZWwgPSBib2hyTW9kZWw7XHJcbiAgICB0aGlzLmRlQnJvZ2xpZU1vZGVsID0gZGVCcm9nbGllTW9kZWw7XHJcbiAgICB0aGlzLnNjaHJvZGluZ2VyTW9kZWwgPSBzY2hyb2Rpbmdlck1vZGVsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnRW5lcmd5TGV2ZWxzTW9kZWwnLCBFbmVyZ3lMZXZlbHNNb2RlbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUNuRixPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsVUFBVSxNQUE2QixrQ0FBa0M7QUFDaEYsT0FBT0MsZ0JBQWdCLE1BQU0sd0NBQXdDO0FBQ3JFLE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLGNBQWMsTUFBTSxnQ0FBZ0M7QUFNM0QsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU0wsVUFBVSxDQUFDO0VBRXhEOztFQUtPTSxXQUFXQSxDQUFFQyxlQUF5QyxFQUFHO0lBRTlELE1BQU1DLE9BQU8sR0FBR1gsU0FBUyxDQUEyRCxDQUFDLENBQUU7TUFDckY7SUFBQSxDQUNELEVBQUVVLGVBQWdCLENBQUM7SUFFcEIsTUFBTUUsV0FBVyxHQUFHLElBQUlOLFdBQVcsQ0FBRUMsY0FBYyxDQUFDTSx3QkFBeUIsQ0FBQztJQUU5RSxNQUFNQyxTQUFTLEdBQUcsSUFBSWIsU0FBUyxDQUFFVyxXQUFXLEVBQUU7TUFDNUNHLE1BQU0sRUFBRUosT0FBTyxDQUFDSSxNQUFNLENBQUNDLFlBQVksQ0FBRSxXQUFZO0lBQ25ELENBQUUsQ0FBQztJQUVILE1BQU1DLGNBQWMsR0FBRyxJQUFJZixjQUFjLENBQUVVLFdBQVcsRUFBRTtNQUN0REcsTUFBTSxFQUFFSixPQUFPLENBQUNJLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGdCQUFpQjtJQUN4RCxDQUFFLENBQUM7SUFFSCxNQUFNRSxnQkFBZ0IsR0FBRyxJQUFJZCxnQkFBZ0IsQ0FBRVEsV0FBVyxFQUFFO01BQzFERyxNQUFNLEVBQUVKLE9BQU8sQ0FBQ0ksTUFBTSxDQUFDQyxZQUFZLENBQUUsa0JBQW1CO0lBQzFELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1HLGdCQUFnQixHQUFHLENBQ3ZCTCxTQUFTLEVBQ1RHLGNBQWMsRUFDZEMsZ0JBQWdCLENBQ2pCOztJQUVEO0lBQ0FFLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxDQUFDLENBQUNDLEtBQUssQ0FBRUgsZ0JBQWdCLEVBQUVJLEtBQUssSUFBSUEsS0FBSyxDQUFDQyx3QkFBeUIsQ0FBQyxFQUNwRiw4RUFBK0UsQ0FBQztJQUVsRixLQUFLLENBQUVaLFdBQVcsRUFBRU8sZ0JBQWdCLEVBQUVMLFNBQVMsRUFBRUgsT0FBUSxDQUFDO0lBRTFELElBQUksQ0FBQ0csU0FBUyxHQUFHQSxTQUFTO0lBQzFCLElBQUksQ0FBQ0csY0FBYyxHQUFHQSxjQUFjO0lBQ3BDLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUdBLGdCQUFnQjtFQUMxQztFQUVnQk8sT0FBT0EsQ0FBQSxFQUFTO0lBQzlCTCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDSyxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFwQix1QkFBdUIsQ0FBQ3FCLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRWxCLGlCQUFrQixDQUFDIn0=