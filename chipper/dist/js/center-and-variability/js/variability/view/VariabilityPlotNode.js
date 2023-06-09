// Copyright 2023, University of Colorado Boulder

/**
 * Shows the dot plot or line plot on the "Mean & Median" Screen, including the legends/readouts to the left.
 * The plot is non-interactive.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import { Node } from '../../../../scenery/js/imports.js';
import RangeNode from './RangeNode.js';
import IQRNode from './IQRNode.js';
import MADNode from './MADNode.js';
import VariabilityMeasure from '../model/VariabilityMeasure.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
export default class VariabilityPlotNode extends Node {
  constructor(model, sceneModel, providedOptions) {
    super(providedOptions);
    const toggleNode = new ToggleNode(model.selectedVariabilityProperty, [{
      createNode: tandem => new RangeNode(model, sceneModel, {
        parentContext: 'accordion',
        tandem: tandem.createTandem('rangeNode')
      }),
      tandemName: 'rangeNode',
      value: VariabilityMeasure.RANGE
    }, {
      createNode: tandem => new IQRNode(model, sceneModel, {
        parentContext: 'accordion',
        tandem: tandem.createTandem('iqrNode')
      }),
      tandemName: 'iqrNode',
      value: VariabilityMeasure.IQR
    }, {
      createNode: tandem => new MADNode(model, sceneModel, {
        parentContext: 'accordion',
        tandem: tandem.createTandem('madNode')
      }),
      tandemName: 'madNode',
      value: VariabilityMeasure.MAD
    }], {
      tandem: providedOptions.tandem.createTandem('toggleNode')
    });
    this.addChild(toggleNode);
    toggleNode.moveToBack();
  }
}
centerAndVariability.register('VariabilityPlotNode', VariabilityPlotNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIk5vZGUiLCJSYW5nZU5vZGUiLCJJUVJOb2RlIiwiTUFETm9kZSIsIlZhcmlhYmlsaXR5TWVhc3VyZSIsIlRvZ2dsZU5vZGUiLCJWYXJpYWJpbGl0eVBsb3ROb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInNjZW5lTW9kZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJ0b2dnbGVOb2RlIiwic2VsZWN0ZWRWYXJpYWJpbGl0eVByb3BlcnR5IiwiY3JlYXRlTm9kZSIsInRhbmRlbSIsInBhcmVudENvbnRleHQiLCJjcmVhdGVUYW5kZW0iLCJ0YW5kZW1OYW1lIiwidmFsdWUiLCJSQU5HRSIsIklRUiIsIk1BRCIsImFkZENoaWxkIiwibW92ZVRvQmFjayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmFyaWFiaWxpdHlQbG90Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2hvd3MgdGhlIGRvdCBwbG90IG9yIGxpbmUgcGxvdCBvbiB0aGUgXCJNZWFuICYgTWVkaWFuXCIgU2NyZWVuLCBpbmNsdWRpbmcgdGhlIGxlZ2VuZHMvcmVhZG91dHMgdG8gdGhlIGxlZnQuXHJcbiAqIFRoZSBwbG90IGlzIG5vbi1pbnRlcmFjdGl2ZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjZW50ZXJBbmRWYXJpYWJpbGl0eSBmcm9tICcuLi8uLi9jZW50ZXJBbmRWYXJpYWJpbGl0eS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFZhcmlhYmlsaXR5TW9kZWwgZnJvbSAnLi4vbW9kZWwvVmFyaWFiaWxpdHlNb2RlbC5qcyc7XHJcbmltcG9ydCBSYW5nZU5vZGUgZnJvbSAnLi9SYW5nZU5vZGUuanMnO1xyXG5pbXBvcnQgSVFSTm9kZSBmcm9tICcuL0lRUk5vZGUuanMnO1xyXG5pbXBvcnQgTUFETm9kZSBmcm9tICcuL01BRE5vZGUuanMnO1xyXG5pbXBvcnQgVmFyaWFiaWxpdHlNZWFzdXJlIGZyb20gJy4uL21vZGVsL1ZhcmlhYmlsaXR5TWVhc3VyZS5qcyc7XHJcbmltcG9ydCBUb2dnbGVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9Ub2dnbGVOb2RlLmpzJztcclxuaW1wb3J0IFZhcmlhYmlsaXR5U2NlbmVNb2RlbCBmcm9tICcuLi9tb2RlbC9WYXJpYWJpbGl0eVNjZW5lTW9kZWwuanMnO1xyXG5cclxuZXhwb3J0IHR5cGUgQ0FWUGxvdE9wdGlvbnMgPSBOb2RlT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFyaWFiaWxpdHlQbG90Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBWYXJpYWJpbGl0eU1vZGVsLCBzY2VuZU1vZGVsOiBWYXJpYWJpbGl0eVNjZW5lTW9kZWwsIHByb3ZpZGVkT3B0aW9uczogQ0FWUGxvdE9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdG9nZ2xlTm9kZSA9IG5ldyBUb2dnbGVOb2RlKCBtb2RlbC5zZWxlY3RlZFZhcmlhYmlsaXR5UHJvcGVydHksIFsge1xyXG4gICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IFJhbmdlTm9kZSggbW9kZWwsIHNjZW5lTW9kZWwsIHtcclxuICAgICAgICBwYXJlbnRDb250ZXh0OiAnYWNjb3JkaW9uJyxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyYW5nZU5vZGUnIClcclxuICAgICAgfSApLFxyXG4gICAgICB0YW5kZW1OYW1lOiAncmFuZ2VOb2RlJyxcclxuICAgICAgdmFsdWU6IFZhcmlhYmlsaXR5TWVhc3VyZS5SQU5HRVxyXG4gICAgfSwge1xyXG4gICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IElRUk5vZGUoIG1vZGVsLCBzY2VuZU1vZGVsLCB7XHJcbiAgICAgICAgcGFyZW50Q29udGV4dDogJ2FjY29yZGlvbicsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXFyTm9kZScgKVxyXG4gICAgICB9ICksXHJcbiAgICAgIHRhbmRlbU5hbWU6ICdpcXJOb2RlJyxcclxuICAgICAgdmFsdWU6IFZhcmlhYmlsaXR5TWVhc3VyZS5JUVJcclxuICAgIH0sIHtcclxuICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBNQUROb2RlKCBtb2RlbCwgc2NlbmVNb2RlbCwge1xyXG4gICAgICAgIHBhcmVudENvbnRleHQ6ICdhY2NvcmRpb24nLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hZE5vZGUnIClcclxuICAgICAgfSApLFxyXG4gICAgICB0YW5kZW1OYW1lOiAnbWFkTm9kZScsXHJcbiAgICAgIHZhbHVlOiBWYXJpYWJpbGl0eU1lYXN1cmUuTUFEXHJcbiAgICB9IF0sIHtcclxuICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RvZ2dsZU5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRvZ2dsZU5vZGUgKTtcclxuICAgIHRvZ2dsZU5vZGUubW92ZVRvQmFjaygpO1xyXG4gIH1cclxufVxyXG5cclxuY2VudGVyQW5kVmFyaWFiaWxpdHkucmVnaXN0ZXIoICdWYXJpYWJpbGl0eVBsb3ROb2RlJywgVmFyaWFiaWxpdHlQbG90Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esb0JBQW9CLE1BQU0sK0JBQStCO0FBQ2hFLFNBQVNDLElBQUksUUFBcUIsbUNBQW1DO0FBR3JFLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDO0FBQy9ELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFLekQsZUFBZSxNQUFNQyxtQkFBbUIsU0FBU04sSUFBSSxDQUFDO0VBRTdDTyxXQUFXQSxDQUFFQyxLQUF1QixFQUFFQyxVQUFpQyxFQUFFQyxlQUErQixFQUFHO0lBQ2hILEtBQUssQ0FBRUEsZUFBZ0IsQ0FBQztJQUV4QixNQUFNQyxVQUFVLEdBQUcsSUFBSU4sVUFBVSxDQUFFRyxLQUFLLENBQUNJLDJCQUEyQixFQUFFLENBQUU7TUFDdEVDLFVBQVUsRUFBRUMsTUFBTSxJQUFJLElBQUliLFNBQVMsQ0FBRU8sS0FBSyxFQUFFQyxVQUFVLEVBQUU7UUFDdERNLGFBQWEsRUFBRSxXQUFXO1FBQzFCRCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLFdBQVk7TUFDM0MsQ0FBRSxDQUFDO01BQ0hDLFVBQVUsRUFBRSxXQUFXO01BQ3ZCQyxLQUFLLEVBQUVkLGtCQUFrQixDQUFDZTtJQUM1QixDQUFDLEVBQUU7TUFDRE4sVUFBVSxFQUFFQyxNQUFNLElBQUksSUFBSVosT0FBTyxDQUFFTSxLQUFLLEVBQUVDLFVBQVUsRUFBRTtRQUNwRE0sYUFBYSxFQUFFLFdBQVc7UUFDMUJELE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsU0FBVTtNQUN6QyxDQUFFLENBQUM7TUFDSEMsVUFBVSxFQUFFLFNBQVM7TUFDckJDLEtBQUssRUFBRWQsa0JBQWtCLENBQUNnQjtJQUM1QixDQUFDLEVBQUU7TUFDRFAsVUFBVSxFQUFFQyxNQUFNLElBQUksSUFBSVgsT0FBTyxDQUFFSyxLQUFLLEVBQUVDLFVBQVUsRUFBRTtRQUNwRE0sYUFBYSxFQUFFLFdBQVc7UUFDMUJELE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsU0FBVTtNQUN6QyxDQUFFLENBQUM7TUFDSEMsVUFBVSxFQUFFLFNBQVM7TUFDckJDLEtBQUssRUFBRWQsa0JBQWtCLENBQUNpQjtJQUM1QixDQUFDLENBQUUsRUFBRTtNQUNIUCxNQUFNLEVBQUVKLGVBQWUsQ0FBQ0ksTUFBTSxDQUFDRSxZQUFZLENBQUUsWUFBYTtJQUM1RCxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNNLFFBQVEsQ0FBRVgsVUFBVyxDQUFDO0lBQzNCQSxVQUFVLENBQUNZLFVBQVUsQ0FBQyxDQUFDO0VBQ3pCO0FBQ0Y7QUFFQXhCLG9CQUFvQixDQUFDeUIsUUFBUSxDQUFFLHFCQUFxQixFQUFFbEIsbUJBQW9CLENBQUMifQ==