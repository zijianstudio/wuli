// Copyright 2018-2022, University of Colorado Boulder

/**
 * Describes a variable associated with a type of real-world object (sphere, apple, coin, dog, ...)
 * This is a specialization of Variable (which is a symbolic variable, e.g. 'x') that carries additional
 * information related to the real-world object.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import Variable from './Variable.js';
import equalityExplorer from '../../equalityExplorer.js';
import optionize from '../../../../phet-core/js/optionize.js';
import EqualityExplorerConstants from '../EqualityExplorerConstants.js';
export default class ObjectVariable extends Variable {
  constructor(providedOptions) {
    const options = optionize()({
      range: EqualityExplorerConstants.OBJECT_VARIABLE_RANGE
    }, providedOptions);

    // ObjectVariable does not have a visible symbol in the UI, and is instead represented as an image.
    // So use its tandem.name for the symbol.
    super(new StringProperty(options.tandem.name), options);
    this.image = options.image;
    this.shadow = options.shadow;
  }
  get symbol() {
    return this.symbolProperty.value;
  }
}
equalityExplorer.register('ObjectVariable', ObjectVariable);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIlZhcmlhYmxlIiwiZXF1YWxpdHlFeHBsb3JlciIsIm9wdGlvbml6ZSIsIkVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMiLCJPYmplY3RWYXJpYWJsZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJhbmdlIiwiT0JKRUNUX1ZBUklBQkxFX1JBTkdFIiwidGFuZGVtIiwibmFtZSIsImltYWdlIiwic2hhZG93Iiwic3ltYm9sIiwic3ltYm9sUHJvcGVydHkiLCJ2YWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiT2JqZWN0VmFyaWFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVzY3JpYmVzIGEgdmFyaWFibGUgYXNzb2NpYXRlZCB3aXRoIGEgdHlwZSBvZiByZWFsLXdvcmxkIG9iamVjdCAoc3BoZXJlLCBhcHBsZSwgY29pbiwgZG9nLCAuLi4pXHJcbiAqIFRoaXMgaXMgYSBzcGVjaWFsaXphdGlvbiBvZiBWYXJpYWJsZSAod2hpY2ggaXMgYSBzeW1ib2xpYyB2YXJpYWJsZSwgZS5nLiAneCcpIHRoYXQgY2FycmllcyBhZGRpdGlvbmFsXHJcbiAqIGluZm9ybWF0aW9uIHJlbGF0ZWQgdG8gdGhlIHJlYWwtd29ybGQgb2JqZWN0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFZhcmlhYmxlLCB7IFZhcmlhYmxlT3B0aW9ucyB9IGZyb20gJy4vVmFyaWFibGUuanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi8uLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMgZnJvbSAnLi4vRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50OyAvLyBpbWFnZSB0aGF0IHJlcHJlc2VudHMgdGhlIG9iamVjdFxyXG4gIHNoYWRvdzogSFRNTEltYWdlRWxlbWVudDsgLy8gc2hhZG93IHNob3duIHdoaWxlIGRyYWdnaW5nIHRoZSBvYmplY3RcclxufTtcclxuXHJcbnR5cGUgT2JqZWN0VmFyaWFibGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBWYXJpYWJsZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYmplY3RWYXJpYWJsZSBleHRlbmRzIFZhcmlhYmxlIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gIHB1YmxpYyByZWFkb25seSBzaGFkb3c6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBPYmplY3RWYXJpYWJsZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxPYmplY3RWYXJpYWJsZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBWYXJpYWJsZU9wdGlvbnM+KCkoIHtcclxuICAgICAgcmFuZ2U6IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuT0JKRUNUX1ZBUklBQkxFX1JBTkdFXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBPYmplY3RWYXJpYWJsZSBkb2VzIG5vdCBoYXZlIGEgdmlzaWJsZSBzeW1ib2wgaW4gdGhlIFVJLCBhbmQgaXMgaW5zdGVhZCByZXByZXNlbnRlZCBhcyBhbiBpbWFnZS5cclxuICAgIC8vIFNvIHVzZSBpdHMgdGFuZGVtLm5hbWUgZm9yIHRoZSBzeW1ib2wuXHJcbiAgICBzdXBlciggbmV3IFN0cmluZ1Byb3BlcnR5KCBvcHRpb25zLnRhbmRlbS5uYW1lICksIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmltYWdlID0gb3B0aW9ucy5pbWFnZTtcclxuICAgIHRoaXMuc2hhZG93ID0gb3B0aW9ucy5zaGFkb3c7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHN5bWJvbCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuc3ltYm9sUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnT2JqZWN0VmFyaWFibGUnLCBPYmplY3RWYXJpYWJsZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQTJCLGVBQWU7QUFDekQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBU3ZFLGVBQWUsTUFBTUMsY0FBYyxTQUFTSixRQUFRLENBQUM7RUFLNUNLLFdBQVdBLENBQUVDLGVBQXNDLEVBQUc7SUFFM0QsTUFBTUMsT0FBTyxHQUFHTCxTQUFTLENBQXNELENBQUMsQ0FBRTtNQUNoRk0sS0FBSyxFQUFFTCx5QkFBeUIsQ0FBQ007SUFDbkMsQ0FBQyxFQUFFSCxlQUFnQixDQUFDOztJQUVwQjtJQUNBO0lBQ0EsS0FBSyxDQUFFLElBQUlQLGNBQWMsQ0FBRVEsT0FBTyxDQUFDRyxNQUFNLENBQUNDLElBQUssQ0FBQyxFQUFFSixPQUFRLENBQUM7SUFFM0QsSUFBSSxDQUFDSyxLQUFLLEdBQUdMLE9BQU8sQ0FBQ0ssS0FBSztJQUMxQixJQUFJLENBQUNDLE1BQU0sR0FBR04sT0FBTyxDQUFDTSxNQUFNO0VBQzlCO0VBRUEsSUFBV0MsTUFBTUEsQ0FBQSxFQUFXO0lBQzFCLE9BQU8sSUFBSSxDQUFDQyxjQUFjLENBQUNDLEtBQUs7RUFDbEM7QUFDRjtBQUVBZixnQkFBZ0IsQ0FBQ2dCLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRWIsY0FBZSxDQUFDIn0=