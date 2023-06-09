// Copyright 2023, University of Colorado Boulder

import centerAndVariability from '../../centerAndVariability.js';
import Dialog from '../../../../sun/js/Dialog.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import VariabilityMeasure from '../model/VariabilityMeasure.js';
import RangeInfoNode from './RangeInfoNode.js';
import IQRInfoNode from './IQRInfoNode.js';
import MADInfoNode from './MADInfoNode.js';
export default class InfoDialog extends Dialog {
  constructor(model, sceneModel, options) {
    const content = new ToggleNode(model.selectedVariabilityProperty, [{
      value: VariabilityMeasure.RANGE,
      createNode: tandem => new RangeInfoNode(model, sceneModel, {
        tandem: tandem
      }),
      tandemName: 'rangeInfoNode'
    }, {
      value: VariabilityMeasure.IQR,
      createNode: tandem => new IQRInfoNode(model, sceneModel, {
        tandem: tandem
      }),
      tandemName: 'iqrInfoNode'
    }, {
      value: VariabilityMeasure.MAD,
      createNode: tandem => new MADInfoNode(model, sceneModel, {
        tandem: tandem
      }),
      tandemName: 'madInfoNode'
    }], {
      tandem: options.tandem.createTandem('infoNode')
    });
    super(content, {
      // TODO: It seems there are 2 ways to hide the dialog. Is there a better way?
      hideCallback: () => model.isInfoShowingProperty.set(false)
    });
  }
}
centerAndVariability.register('InfoDialog', InfoDialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIkRpYWxvZyIsIlRvZ2dsZU5vZGUiLCJWYXJpYWJpbGl0eU1lYXN1cmUiLCJSYW5nZUluZm9Ob2RlIiwiSVFSSW5mb05vZGUiLCJNQURJbmZvTm9kZSIsIkluZm9EaWFsb2ciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwic2NlbmVNb2RlbCIsIm9wdGlvbnMiLCJjb250ZW50Iiwic2VsZWN0ZWRWYXJpYWJpbGl0eVByb3BlcnR5IiwidmFsdWUiLCJSQU5HRSIsImNyZWF0ZU5vZGUiLCJ0YW5kZW0iLCJ0YW5kZW1OYW1lIiwiSVFSIiwiTUFEIiwiY3JlYXRlVGFuZGVtIiwiaGlkZUNhbGxiYWNrIiwiaXNJbmZvU2hvd2luZ1Byb3BlcnR5Iiwic2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbmZvRGlhbG9nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmltcG9ydCBjZW50ZXJBbmRWYXJpYWJpbGl0eSBmcm9tICcuLi8uLi9jZW50ZXJBbmRWYXJpYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBWYXJpYWJpbGl0eU1vZGVsIGZyb20gJy4uL21vZGVsL1ZhcmlhYmlsaXR5TW9kZWwuanMnO1xyXG5pbXBvcnQgRGlhbG9nIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9EaWFsb2cuanMnO1xyXG5pbXBvcnQgVG9nZ2xlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVG9nZ2xlTm9kZS5qcyc7XHJcbmltcG9ydCBWYXJpYWJpbGl0eU1lYXN1cmUgZnJvbSAnLi4vbW9kZWwvVmFyaWFiaWxpdHlNZWFzdXJlLmpzJztcclxuaW1wb3J0IFJhbmdlSW5mb05vZGUgZnJvbSAnLi9SYW5nZUluZm9Ob2RlLmpzJztcclxuaW1wb3J0IElRUkluZm9Ob2RlIGZyb20gJy4vSVFSSW5mb05vZGUuanMnO1xyXG5pbXBvcnQgTUFESW5mb05vZGUgZnJvbSAnLi9NQURJbmZvTm9kZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBWYXJpYWJpbGl0eVNjZW5lTW9kZWwgZnJvbSAnLi4vbW9kZWwvVmFyaWFiaWxpdHlTY2VuZU1vZGVsLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluZm9EaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFZhcmlhYmlsaXR5TW9kZWwsIHNjZW5lTW9kZWw6IFZhcmlhYmlsaXR5U2NlbmVNb2RlbCwgb3B0aW9uczogUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdCwgJ3RhbmRlbSc+ICkge1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgVG9nZ2xlTm9kZSggbW9kZWwuc2VsZWN0ZWRWYXJpYWJpbGl0eVByb3BlcnR5LCBbIHtcclxuICAgICAgdmFsdWU6IFZhcmlhYmlsaXR5TWVhc3VyZS5SQU5HRSxcclxuICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBSYW5nZUluZm9Ob2RlKCBtb2RlbCwgc2NlbmVNb2RlbCwgeyB0YW5kZW06IHRhbmRlbSB9ICksXHJcbiAgICAgIHRhbmRlbU5hbWU6ICdyYW5nZUluZm9Ob2RlJ1xyXG4gICAgfSwge1xyXG4gICAgICB2YWx1ZTogVmFyaWFiaWxpdHlNZWFzdXJlLklRUixcclxuICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBJUVJJbmZvTm9kZSggbW9kZWwsIHNjZW5lTW9kZWwsIHsgdGFuZGVtOiB0YW5kZW0gfSApLFxyXG4gICAgICB0YW5kZW1OYW1lOiAnaXFySW5mb05vZGUnXHJcbiAgICB9LCB7XHJcbiAgICAgIHZhbHVlOiBWYXJpYWJpbGl0eU1lYXN1cmUuTUFELFxyXG4gICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IE1BREluZm9Ob2RlKCBtb2RlbCwgc2NlbmVNb2RlbCwgeyB0YW5kZW06IHRhbmRlbSB9ICksXHJcbiAgICAgIHRhbmRlbU5hbWU6ICdtYWRJbmZvTm9kZSdcclxuICAgIH0gXSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2luZm9Ob2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnQsIHtcclxuXHJcbiAgICAgIC8vIFRPRE86IEl0IHNlZW1zIHRoZXJlIGFyZSAyIHdheXMgdG8gaGlkZSB0aGUgZGlhbG9nLiBJcyB0aGVyZSBhIGJldHRlciB3YXk/XHJcbiAgICAgIGhpZGVDYWxsYmFjazogKCkgPT4gbW9kZWwuaXNJbmZvU2hvd2luZ1Byb3BlcnR5LnNldCggZmFsc2UgKVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuY2VudGVyQW5kVmFyaWFiaWxpdHkucmVnaXN0ZXIoICdJbmZvRGlhbG9nJywgSW5mb0RpYWxvZyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0Esb0JBQW9CLE1BQU0sK0JBQStCO0FBRWhFLE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxrQkFBa0IsTUFBTSxnQ0FBZ0M7QUFDL0QsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFLMUMsZUFBZSxNQUFNQyxVQUFVLFNBQVNOLE1BQU0sQ0FBQztFQUN0Q08sV0FBV0EsQ0FBRUMsS0FBdUIsRUFBRUMsVUFBaUMsRUFBRUMsT0FBNkMsRUFBRztJQUU5SCxNQUFNQyxPQUFPLEdBQUcsSUFBSVYsVUFBVSxDQUFFTyxLQUFLLENBQUNJLDJCQUEyQixFQUFFLENBQUU7TUFDbkVDLEtBQUssRUFBRVgsa0JBQWtCLENBQUNZLEtBQUs7TUFDL0JDLFVBQVUsRUFBRUMsTUFBTSxJQUFJLElBQUliLGFBQWEsQ0FBRUssS0FBSyxFQUFFQyxVQUFVLEVBQUU7UUFBRU8sTUFBTSxFQUFFQTtNQUFPLENBQUUsQ0FBQztNQUNoRkMsVUFBVSxFQUFFO0lBQ2QsQ0FBQyxFQUFFO01BQ0RKLEtBQUssRUFBRVgsa0JBQWtCLENBQUNnQixHQUFHO01BQzdCSCxVQUFVLEVBQUVDLE1BQU0sSUFBSSxJQUFJWixXQUFXLENBQUVJLEtBQUssRUFBRUMsVUFBVSxFQUFFO1FBQUVPLE1BQU0sRUFBRUE7TUFBTyxDQUFFLENBQUM7TUFDOUVDLFVBQVUsRUFBRTtJQUNkLENBQUMsRUFBRTtNQUNESixLQUFLLEVBQUVYLGtCQUFrQixDQUFDaUIsR0FBRztNQUM3QkosVUFBVSxFQUFFQyxNQUFNLElBQUksSUFBSVgsV0FBVyxDQUFFRyxLQUFLLEVBQUVDLFVBQVUsRUFBRTtRQUFFTyxNQUFNLEVBQUVBO01BQU8sQ0FBRSxDQUFDO01BQzlFQyxVQUFVLEVBQUU7SUFDZCxDQUFDLENBQUUsRUFBRTtNQUNIRCxNQUFNLEVBQUVOLE9BQU8sQ0FBQ00sTUFBTSxDQUFDSSxZQUFZLENBQUUsVUFBVztJQUNsRCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVULE9BQU8sRUFBRTtNQUVkO01BQ0FVLFlBQVksRUFBRUEsQ0FBQSxLQUFNYixLQUFLLENBQUNjLHFCQUFxQixDQUFDQyxHQUFHLENBQUUsS0FBTTtJQUM3RCxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUF4QixvQkFBb0IsQ0FBQ3lCLFFBQVEsQ0FBRSxZQUFZLEVBQUVsQixVQUFXLENBQUMifQ==