// Copyright 2023, University of Colorado Boulder

import centerAndVariability from '../../centerAndVariability.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CAVConstants from '../CAVConstants.js';
import Property from '../../../../axon/js/Property.js';
export default class CAVModel {
  // Screens 1-3
  // TODO: Should some of these should move to subclasses? https://github.com/phetsims/center-and-variability/issues/153
  // Screens 2-3
  // Screens 1-2
  // Screens 1-2
  constructor(sceneModels, options) {
    this.sceneModels = sceneModels;
    this.isShowingPlayAreaMeanProperty = new BooleanProperty(false, {
      tandem: options.instrumentMeanPredictionProperty ? options.tandem.createTandem('isShowingPlayAreaMeanProperty') : Tandem.OPT_OUT
    });
    this.isShowingPlayAreaMedianProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('isShowingPlayAreaMedianProperty')
    });
    this.isShowingMedianPredictionProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('isShowingMedianPredictionProperty')
    });
    this.medianPredictionProperty = new NumberProperty(1, {
      // Assumes all physical ranges are the same
      range: CAVConstants.PHYSICAL_RANGE,
      tandem: options.tandem.createTandem('medianPredictionProperty')
    });
    this.selectedSceneModelProperty = new Property(sceneModels[0], {
      validValues: sceneModels,
      tandem: options.tandem.createTandem('selectedSceneModelProperty')
    });
    this.selectedSceneModelProperty.link(selectedScene => {
      this.sceneModels.forEach(sceneModel => {
        sceneModel.isVisibleProperty.value = sceneModel === selectedScene;
      });
    });
    this.soccerBallHasBeenDraggedProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('soccerBallHasBeenDraggedProperty')
    });
  }
  step(dt) {
    // Override in subclasses

    this.selectedSceneModelProperty.value.step(dt);
  }
  reset() {
    this.medianPredictionProperty.reset();
    this.isShowingPlayAreaMeanProperty.reset();
    this.isShowingPlayAreaMedianProperty.reset();
    this.isShowingMedianPredictionProperty.reset();
    this.sceneModels.forEach(sceneModel => sceneModel.reset());
    this.selectedSceneModelProperty.reset();
    this.soccerBallHasBeenDraggedProperty.reset();
  }
}
centerAndVariability.register('CAVModel', CAVModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIk51bWJlclByb3BlcnR5IiwiQm9vbGVhblByb3BlcnR5IiwiVGFuZGVtIiwiQ0FWQ29uc3RhbnRzIiwiUHJvcGVydHkiLCJDQVZNb2RlbCIsImNvbnN0cnVjdG9yIiwic2NlbmVNb2RlbHMiLCJvcHRpb25zIiwiaXNTaG93aW5nUGxheUFyZWFNZWFuUHJvcGVydHkiLCJ0YW5kZW0iLCJpbnN0cnVtZW50TWVhblByZWRpY3Rpb25Qcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsIk9QVF9PVVQiLCJpc1Nob3dpbmdQbGF5QXJlYU1lZGlhblByb3BlcnR5IiwiaXNTaG93aW5nTWVkaWFuUHJlZGljdGlvblByb3BlcnR5IiwibWVkaWFuUHJlZGljdGlvblByb3BlcnR5IiwicmFuZ2UiLCJQSFlTSUNBTF9SQU5HRSIsInNlbGVjdGVkU2NlbmVNb2RlbFByb3BlcnR5IiwidmFsaWRWYWx1ZXMiLCJsaW5rIiwic2VsZWN0ZWRTY2VuZSIsImZvckVhY2giLCJzY2VuZU1vZGVsIiwiaXNWaXNpYmxlUHJvcGVydHkiLCJ2YWx1ZSIsInNvY2NlckJhbGxIYXNCZWVuRHJhZ2dlZFByb3BlcnR5Iiwic3RlcCIsImR0IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNBVk1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmltcG9ydCBjZW50ZXJBbmRWYXJpYWJpbGl0eSBmcm9tICcuLi8uLi9jZW50ZXJBbmRWYXJpYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBDQVZDb25zdGFudHMgZnJvbSAnLi4vQ0FWQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQ0FWU2NlbmVNb2RlbCBmcm9tICcuL0NBVlNjZW5lTW9kZWwuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICB0YW5kZW06IFRhbmRlbTtcclxuICBpbnN0cnVtZW50TWVhblByZWRpY3Rpb25Qcm9wZXJ0eTogYm9vbGVhbjtcclxufTtcclxuZXhwb3J0IHR5cGUgQ0FWTW9kZWxPcHRpb25zID0gU2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDQVZNb2RlbCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBpc1Nob3dpbmdQbGF5QXJlYU1lZGlhblByb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7IC8vIFNjcmVlbnMgMS0zXHJcblxyXG4gIC8vIFRPRE86IFNob3VsZCBzb21lIG9mIHRoZXNlIHNob3VsZCBtb3ZlIHRvIHN1YmNsYXNzZXM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jZW50ZXItYW5kLXZhcmlhYmlsaXR5L2lzc3Vlcy8xNTNcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNTaG93aW5nUGxheUFyZWFNZWFuUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTsgIC8vIFNjcmVlbnMgMi0zXHJcbiAgcHVibGljIHJlYWRvbmx5IGlzU2hvd2luZ01lZGlhblByZWRpY3Rpb25Qcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5OyAvLyBTY3JlZW5zIDEtMlxyXG4gIHB1YmxpYyByZWFkb25seSBtZWRpYW5QcmVkaWN0aW9uUHJvcGVydHk6IE51bWJlclByb3BlcnR5OyAvLyBTY3JlZW5zIDEtMlxyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2VsZWN0ZWRTY2VuZU1vZGVsUHJvcGVydHk6IFByb3BlcnR5PENBVlNjZW5lTW9kZWw+O1xyXG4gIHB1YmxpYyByZWFkb25seSBzb2NjZXJCYWxsSGFzQmVlbkRyYWdnZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHVibGljIHJlYWRvbmx5IHNjZW5lTW9kZWxzOiBDQVZTY2VuZU1vZGVsW10sIG9wdGlvbnM6IENBVk1vZGVsT3B0aW9ucyApIHtcclxuXHJcbiAgICB0aGlzLmlzU2hvd2luZ1BsYXlBcmVhTWVhblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLmluc3RydW1lbnRNZWFuUHJlZGljdGlvblByb3BlcnR5ID8gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNTaG93aW5nUGxheUFyZWFNZWFuUHJvcGVydHknICkgOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5pc1Nob3dpbmdQbGF5QXJlYU1lZGlhblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc1Nob3dpbmdQbGF5QXJlYU1lZGlhblByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pc1Nob3dpbmdNZWRpYW5QcmVkaWN0aW9uUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzU2hvd2luZ01lZGlhblByZWRpY3Rpb25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubWVkaWFuUHJlZGljdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLCB7XHJcblxyXG4gICAgICAvLyBBc3N1bWVzIGFsbCBwaHlzaWNhbCByYW5nZXMgYXJlIHRoZSBzYW1lXHJcbiAgICAgIHJhbmdlOiBDQVZDb25zdGFudHMuUEhZU0lDQUxfUkFOR0UsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVkaWFuUHJlZGljdGlvblByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZFNjZW5lTW9kZWxQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggc2NlbmVNb2RlbHNbIDAgXSwge1xyXG4gICAgICB2YWxpZFZhbHVlczogc2NlbmVNb2RlbHMsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2VsZWN0ZWRTY2VuZU1vZGVsUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkU2NlbmVNb2RlbFByb3BlcnR5LmxpbmsoIHNlbGVjdGVkU2NlbmUgPT4ge1xyXG4gICAgICB0aGlzLnNjZW5lTW9kZWxzLmZvckVhY2goIHNjZW5lTW9kZWwgPT4ge1xyXG4gICAgICAgIHNjZW5lTW9kZWwuaXNWaXNpYmxlUHJvcGVydHkudmFsdWUgPSBzY2VuZU1vZGVsID09PSBzZWxlY3RlZFNjZW5lO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zb2NjZXJCYWxsSGFzQmVlbkRyYWdnZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc29jY2VyQmFsbEhhc0JlZW5EcmFnZ2VkUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgLy8gT3ZlcnJpZGUgaW4gc3ViY2xhc3Nlc1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRTY2VuZU1vZGVsUHJvcGVydHkudmFsdWUuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMubWVkaWFuUHJlZGljdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgdGhpcy5pc1Nob3dpbmdQbGF5QXJlYU1lYW5Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc1Nob3dpbmdQbGF5QXJlYU1lZGlhblByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgdGhpcy5pc1Nob3dpbmdNZWRpYW5QcmVkaWN0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnNjZW5lTW9kZWxzLmZvckVhY2goIHNjZW5lTW9kZWwgPT4gc2NlbmVNb2RlbC5yZXNldCgpICk7XHJcbiAgICB0aGlzLnNlbGVjdGVkU2NlbmVNb2RlbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNvY2NlckJhbGxIYXNCZWVuRHJhZ2dlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5jZW50ZXJBbmRWYXJpYWJpbGl0eS5yZWdpc3RlciggJ0NBVk1vZGVsJywgQ0FWTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU9BLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBQzdDLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFTdEQsZUFBZSxNQUFNQyxRQUFRLENBQUM7RUFFc0M7RUFFbEU7RUFDaUU7RUFDRztFQUNWO0VBS25EQyxXQUFXQSxDQUFrQkMsV0FBNEIsRUFBRUMsT0FBd0IsRUFBRztJQUFBLEtBQXpERCxXQUE0QixHQUE1QkEsV0FBNEI7SUFFOUQsSUFBSSxDQUFDRSw2QkFBNkIsR0FBRyxJQUFJUixlQUFlLENBQUUsS0FBSyxFQUFFO01BQy9EUyxNQUFNLEVBQUVGLE9BQU8sQ0FB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