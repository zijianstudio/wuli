// Copyright 2016-2023, University of Colorado Boulder

/**
 * Model for the 'Shopping Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import apple_png from '../../../images/apple_png.js';
import carrot_png from '../../../images/carrot_png.js';
import purpleCandy_png from '../../../images/purpleCandy_png.js';
import Rate from '../../common/model/Rate.js';
import CandyScene from '../../shopping/model/CandyScene.js';
import FruitScene from '../../shopping/model/FruitScene.js';
import ShoppingCategory from '../../shopping/model/ShoppingCategory.js';
import ShoppingItemData from '../../shopping/model/ShoppingItemData.js';
import ShoppingModel from '../../shopping/model/ShoppingModel.js';
import VegetableScene from '../../shopping/model/VegetableScene.js';
import unitRates from '../../unitRates.js';
export default class ShoppingLabModel extends ShoppingModel {
  constructor() {
    super({
      // unlike the 'Shopping' screen, each category in 'Shopping Lab' has only 1 associated item
      categories: [
      // fruits
      new ShoppingCategory(apple_png, [new FruitScene(ShoppingItemData.Fruit.APPLES, {
        rate: new Rate(1, 1),
        denominatorOptions: {
          pickerColor: 'red'
        }
      })]),
      // vegetables
      new ShoppingCategory(carrot_png, [new VegetableScene(ShoppingItemData.Vegetable.CARROTS, {
        rate: new Rate(3, 4),
        denominatorOptions: {
          pickerColor: 'orange'
        }
      })]),
      // candies
      new ShoppingCategory(purpleCandy_png, [new CandyScene(ShoppingItemData.Candy.PURPLE_CANDY, {
        rate: new Rate(3, 2),
        denominatorOptions: {
          pickerColor: 'purple'
        }
      })])]
    });
  }
}
unitRates.register('ShoppingLabModel', ShoppingLabModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcHBsZV9wbmciLCJjYXJyb3RfcG5nIiwicHVycGxlQ2FuZHlfcG5nIiwiUmF0ZSIsIkNhbmR5U2NlbmUiLCJGcnVpdFNjZW5lIiwiU2hvcHBpbmdDYXRlZ29yeSIsIlNob3BwaW5nSXRlbURhdGEiLCJTaG9wcGluZ01vZGVsIiwiVmVnZXRhYmxlU2NlbmUiLCJ1bml0UmF0ZXMiLCJTaG9wcGluZ0xhYk1vZGVsIiwiY29uc3RydWN0b3IiLCJjYXRlZ29yaWVzIiwiRnJ1aXQiLCJBUFBMRVMiLCJyYXRlIiwiZGVub21pbmF0b3JPcHRpb25zIiwicGlja2VyQ29sb3IiLCJWZWdldGFibGUiLCJDQVJST1RTIiwiQ2FuZHkiLCJQVVJQTEVfQ0FORFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNob3BwaW5nTGFiTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSAnU2hvcHBpbmcgTGFiJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGFwcGxlX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvYXBwbGVfcG5nLmpzJztcclxuaW1wb3J0IGNhcnJvdF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NhcnJvdF9wbmcuanMnO1xyXG5pbXBvcnQgcHVycGxlQ2FuZHlfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXJwbGVDYW5keV9wbmcuanMnO1xyXG5pbXBvcnQgUmF0ZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUmF0ZS5qcyc7XHJcbmltcG9ydCBDYW5keVNjZW5lIGZyb20gJy4uLy4uL3Nob3BwaW5nL21vZGVsL0NhbmR5U2NlbmUuanMnO1xyXG5pbXBvcnQgRnJ1aXRTY2VuZSBmcm9tICcuLi8uLi9zaG9wcGluZy9tb2RlbC9GcnVpdFNjZW5lLmpzJztcclxuaW1wb3J0IFNob3BwaW5nQ2F0ZWdvcnkgZnJvbSAnLi4vLi4vc2hvcHBpbmcvbW9kZWwvU2hvcHBpbmdDYXRlZ29yeS5qcyc7XHJcbmltcG9ydCBTaG9wcGluZ0l0ZW1EYXRhIGZyb20gJy4uLy4uL3Nob3BwaW5nL21vZGVsL1Nob3BwaW5nSXRlbURhdGEuanMnO1xyXG5pbXBvcnQgU2hvcHBpbmdNb2RlbCBmcm9tICcuLi8uLi9zaG9wcGluZy9tb2RlbC9TaG9wcGluZ01vZGVsLmpzJztcclxuaW1wb3J0IFZlZ2V0YWJsZVNjZW5lIGZyb20gJy4uLy4uL3Nob3BwaW5nL21vZGVsL1ZlZ2V0YWJsZVNjZW5lLmpzJztcclxuaW1wb3J0IHVuaXRSYXRlcyBmcm9tICcuLi8uLi91bml0UmF0ZXMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvcHBpbmdMYWJNb2RlbCBleHRlbmRzIFNob3BwaW5nTW9kZWwge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG5cclxuICAgICAgLy8gdW5saWtlIHRoZSAnU2hvcHBpbmcnIHNjcmVlbiwgZWFjaCBjYXRlZ29yeSBpbiAnU2hvcHBpbmcgTGFiJyBoYXMgb25seSAxIGFzc29jaWF0ZWQgaXRlbVxyXG4gICAgICBjYXRlZ29yaWVzOiBbXHJcblxyXG4gICAgICAgIC8vIGZydWl0c1xyXG4gICAgICAgIG5ldyBTaG9wcGluZ0NhdGVnb3J5KCBhcHBsZV9wbmcsIFtcclxuICAgICAgICAgIG5ldyBGcnVpdFNjZW5lKCBTaG9wcGluZ0l0ZW1EYXRhLkZydWl0LkFQUExFUywge1xyXG4gICAgICAgICAgICByYXRlOiBuZXcgUmF0ZSggMSwgMSApLFxyXG4gICAgICAgICAgICBkZW5vbWluYXRvck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBwaWNrZXJDb2xvcjogJ3JlZCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApXHJcbiAgICAgICAgXSApLFxyXG5cclxuICAgICAgICAvLyB2ZWdldGFibGVzXHJcbiAgICAgICAgbmV3IFNob3BwaW5nQ2F0ZWdvcnkoIGNhcnJvdF9wbmcsIFtcclxuICAgICAgICAgIG5ldyBWZWdldGFibGVTY2VuZSggU2hvcHBpbmdJdGVtRGF0YS5WZWdldGFibGUuQ0FSUk9UUywge1xyXG4gICAgICAgICAgICByYXRlOiBuZXcgUmF0ZSggMywgNCApLFxyXG4gICAgICAgICAgICBkZW5vbWluYXRvck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBwaWNrZXJDb2xvcjogJ29yYW5nZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApXHJcbiAgICAgICAgXSApLFxyXG5cclxuICAgICAgICAvLyBjYW5kaWVzXHJcbiAgICAgICAgbmV3IFNob3BwaW5nQ2F0ZWdvcnkoIHB1cnBsZUNhbmR5X3BuZywgW1xyXG4gICAgICAgICAgbmV3IENhbmR5U2NlbmUoIFNob3BwaW5nSXRlbURhdGEuQ2FuZHkuUFVSUExFX0NBTkRZLCB7XHJcbiAgICAgICAgICAgIHJhdGU6IG5ldyBSYXRlKCAzLCAyICksXHJcbiAgICAgICAgICAgIGRlbm9taW5hdG9yT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIHBpY2tlckNvbG9yOiAncHVycGxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IClcclxuICAgICAgICBdIClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxudW5pdFJhdGVzLnJlZ2lzdGVyKCAnU2hvcHBpbmdMYWJNb2RlbCcsIFNob3BwaW5nTGFiTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLDhCQUE4QjtBQUNwRCxPQUFPQyxVQUFVLE1BQU0sK0JBQStCO0FBQ3RELE9BQU9DLGVBQWUsTUFBTSxvQ0FBb0M7QUFDaEUsT0FBT0MsSUFBSSxNQUFNLDRCQUE0QjtBQUM3QyxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsT0FBT0MsZ0JBQWdCLE1BQU0sMENBQTBDO0FBQ3ZFLE9BQU9DLGdCQUFnQixNQUFNLDBDQUEwQztBQUN2RSxPQUFPQyxhQUFhLE1BQU0sdUNBQXVDO0FBQ2pFLE9BQU9DLGNBQWMsTUFBTSx3Q0FBd0M7QUFDbkUsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUUxQyxlQUFlLE1BQU1DLGdCQUFnQixTQUFTSCxhQUFhLENBQUM7RUFFMURJLFdBQVdBLENBQUEsRUFBRztJQUVaLEtBQUssQ0FBRTtNQUVMO01BQ0FDLFVBQVUsRUFBRTtNQUVWO01BQ0EsSUFBSVAsZ0JBQWdCLENBQUVOLFNBQVMsRUFBRSxDQUMvQixJQUFJSyxVQUFVLENBQUVFLGdCQUFnQixDQUFDTyxLQUFLLENBQUNDLE1BQU0sRUFBRTtRQUM3Q0MsSUFBSSxFQUFFLElBQUliLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO1FBQ3RCYyxrQkFBa0IsRUFBRTtVQUNsQkMsV0FBVyxFQUFFO1FBQ2Y7TUFDRixDQUFFLENBQUMsQ0FDSCxDQUFDO01BRUg7TUFDQSxJQUFJWixnQkFBZ0IsQ0FBRUwsVUFBVSxFQUFFLENBQ2hDLElBQUlRLGNBQWMsQ0FBRUYsZ0JBQWdCLENBQUNZLFNBQVMsQ0FBQ0MsT0FBTyxFQUFFO1FBQ3RESixJQUFJLEVBQUUsSUFBSWIsSUFBSSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7UUFDdEJjLGtCQUFrQixFQUFFO1VBQ2xCQyxXQUFXLEVBQUU7UUFDZjtNQUNGLENBQUUsQ0FBQyxDQUNILENBQUM7TUFFSDtNQUNBLElBQUlaLGdCQUFnQixDQUFFSixlQUFlLEVBQUUsQ0FDckMsSUFBSUUsVUFBVSxDQUFFRyxnQkFBZ0IsQ0FBQ2MsS0FBSyxDQUFDQyxZQUFZLEVBQUU7UUFDbkROLElBQUksRUFBRSxJQUFJYixJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztRQUN0QmMsa0JBQWtCLEVBQUU7VUFDbEJDLFdBQVcsRUFBRTtRQUNmO01BQ0YsQ0FBRSxDQUFDLENBQ0gsQ0FBQztJQUVQLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQVIsU0FBUyxDQUFDYSxRQUFRLENBQUUsa0JBQWtCLEVBQUVaLGdCQUFpQixDQUFDIn0=