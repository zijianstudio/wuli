// Copyright 2017-2022, University of Colorado Boulder

/**
 * Assists "changing" options for types of nodes where the node does not support modifying the option.
 * This will create a new copy of the node whenever the options change, and will swap it into place.
 *
 * Given a type that has an option that can only be provided on construction (e.g. 'color' option for NumberPicker),
 * MutableOptionsNode can act like a mutable form of that Node. For example, if you have a color property:
 *
 * var colorProperty = new Property( 'red' );
 *
 * You can create a NumberPicker equivalent:
 *
 * var pickerContainer = new MutableOptionsNode( NumberPicker, [ arg1, arg2 ], {
 *   font: new PhetFont( 30 ) // normal properties that are passed in directly
 * }, {
 *   color: colorProperty // values wrapped with Property. When these change, a new NumberPicker is created and swapped.
 * }, {
 *   // Options passed to the wrapper node.
 * } );
 *
 * Now pickerContainer will have a child that is a NumberPicker, and pickerContainer.nodeProperty will point to the
 * current NumberPicker instance. The NumberPicker above will be created with like:
 *
 * new NumberPicker( arg1, arg2, {
 *   font: new PhetFont( 30 ),
 *   color: colorProperty.value
 * } )
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Multilink from '../../axon/js/Multilink.js';
import Property from '../../axon/js/Property.js';
import merge from '../../phet-core/js/merge.js';
import { Node } from '../../scenery/js/imports.js';
import sun from './sun.js';

/**
 * @deprecated Not a good fit for PhET-iO. Please design your component so that the item is mutable.
 */
class MutableOptionsNode extends Node {
  /**
   * @param {Function} nodeSubtype - The type of the node that we'll be constructing copies of.
   * @param {Array.<*>} parameters - Arbitrary initial parameters that will be passed to the type's constructor
   * @param {Object} staticOptions - Options passed in that won't change (will not unwrap properties)
   * @param {Object} dynamicOptions - Options passed in that will change. Should be a map from key names to
   *                                  Property.<*> values.
   * @param {Object} [wrapperOptions] - Node options passed to MutableOptionsNode itself (the wrapper).
   */
  constructor(nodeSubtype, parameters, staticOptions, dynamicOptions, wrapperOptions) {
    super();

    // @public {Property.<Node|null>} [read-only] - Holds our current copy of the node (or null, so we don't have a
    //                                              specific initial value).
    this.nodeProperty = new Property(null);

    // @private {function} - The constructor for our custom subtype, unwraps the Properties in dynamicOptions.
    this._constructInstance = () => Reflect.construct(nodeSubtype, [...parameters, merge(_.mapValues(dynamicOptions, property => property.value), staticOptions) // options
    ]);

    // @private {Multilink} - Make a copy, and replace it when one of our dyanmic options changes.
    this.multilink = Multilink.multilink(_.values(dynamicOptions), this.replaceCopy.bind(this));

    // Apply any options that make more sense on the wrapper (typically like positioning)
    this.mutate(wrapperOptions);
  }

  /**
   * Creates a copy of our type of node, and replaces any existing copy.
   * @private
   */
  replaceCopy() {
    const newCopy = this._constructInstance();
    const oldCopy = this.nodeProperty.value;
    this.nodeProperty.value = newCopy;

    // Add first, so that there's a good chance we won't change bounds (depending on the type)
    this.addChild(newCopy);
    if (oldCopy) {
      this.removeChild(oldCopy);
      this.disposeCopy(oldCopy);
    }
  }

  /**
   * Attempt to dispose an instance of our node.
   * @private
   *
   * @param {Node} copy
   */
  disposeCopy(copy) {
    copy.dispose && copy.dispose();
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.multilink.dispose();
    this.disposeCopy(this.nodeProperty.value);
    this.nodeProperty.dispose();
    super.dispose();
  }
}
sun.register('MutableOptionsNode', MutableOptionsNode);
export default MutableOptionsNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIm1lcmdlIiwiTm9kZSIsInN1biIsIk11dGFibGVPcHRpb25zTm9kZSIsImNvbnN0cnVjdG9yIiwibm9kZVN1YnR5cGUiLCJwYXJhbWV0ZXJzIiwic3RhdGljT3B0aW9ucyIsImR5bmFtaWNPcHRpb25zIiwid3JhcHBlck9wdGlvbnMiLCJub2RlUHJvcGVydHkiLCJfY29uc3RydWN0SW5zdGFuY2UiLCJSZWZsZWN0IiwiY29uc3RydWN0IiwiXyIsIm1hcFZhbHVlcyIsInByb3BlcnR5IiwidmFsdWUiLCJtdWx0aWxpbmsiLCJ2YWx1ZXMiLCJyZXBsYWNlQ29weSIsImJpbmQiLCJtdXRhdGUiLCJuZXdDb3B5Iiwib2xkQ29weSIsImFkZENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlQ29weSIsImNvcHkiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNdXRhYmxlT3B0aW9uc05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQXNzaXN0cyBcImNoYW5naW5nXCIgb3B0aW9ucyBmb3IgdHlwZXMgb2Ygbm9kZXMgd2hlcmUgdGhlIG5vZGUgZG9lcyBub3Qgc3VwcG9ydCBtb2RpZnlpbmcgdGhlIG9wdGlvbi5cclxuICogVGhpcyB3aWxsIGNyZWF0ZSBhIG5ldyBjb3B5IG9mIHRoZSBub2RlIHdoZW5ldmVyIHRoZSBvcHRpb25zIGNoYW5nZSwgYW5kIHdpbGwgc3dhcCBpdCBpbnRvIHBsYWNlLlxyXG4gKlxyXG4gKiBHaXZlbiBhIHR5cGUgdGhhdCBoYXMgYW4gb3B0aW9uIHRoYXQgY2FuIG9ubHkgYmUgcHJvdmlkZWQgb24gY29uc3RydWN0aW9uIChlLmcuICdjb2xvcicgb3B0aW9uIGZvciBOdW1iZXJQaWNrZXIpLFxyXG4gKiBNdXRhYmxlT3B0aW9uc05vZGUgY2FuIGFjdCBsaWtlIGEgbXV0YWJsZSBmb3JtIG9mIHRoYXQgTm9kZS4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIGEgY29sb3IgcHJvcGVydHk6XHJcbiAqXHJcbiAqIHZhciBjb2xvclByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAncmVkJyApO1xyXG4gKlxyXG4gKiBZb3UgY2FuIGNyZWF0ZSBhIE51bWJlclBpY2tlciBlcXVpdmFsZW50OlxyXG4gKlxyXG4gKiB2YXIgcGlja2VyQ29udGFpbmVyID0gbmV3IE11dGFibGVPcHRpb25zTm9kZSggTnVtYmVyUGlja2VyLCBbIGFyZzEsIGFyZzIgXSwge1xyXG4gKiAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMzAgKSAvLyBub3JtYWwgcHJvcGVydGllcyB0aGF0IGFyZSBwYXNzZWQgaW4gZGlyZWN0bHlcclxuICogfSwge1xyXG4gKiAgIGNvbG9yOiBjb2xvclByb3BlcnR5IC8vIHZhbHVlcyB3cmFwcGVkIHdpdGggUHJvcGVydHkuIFdoZW4gdGhlc2UgY2hhbmdlLCBhIG5ldyBOdW1iZXJQaWNrZXIgaXMgY3JlYXRlZCBhbmQgc3dhcHBlZC5cclxuICogfSwge1xyXG4gKiAgIC8vIE9wdGlvbnMgcGFzc2VkIHRvIHRoZSB3cmFwcGVyIG5vZGUuXHJcbiAqIH0gKTtcclxuICpcclxuICogTm93IHBpY2tlckNvbnRhaW5lciB3aWxsIGhhdmUgYSBjaGlsZCB0aGF0IGlzIGEgTnVtYmVyUGlja2VyLCBhbmQgcGlja2VyQ29udGFpbmVyLm5vZGVQcm9wZXJ0eSB3aWxsIHBvaW50IHRvIHRoZVxyXG4gKiBjdXJyZW50IE51bWJlclBpY2tlciBpbnN0YW5jZS4gVGhlIE51bWJlclBpY2tlciBhYm92ZSB3aWxsIGJlIGNyZWF0ZWQgd2l0aCBsaWtlOlxyXG4gKlxyXG4gKiBuZXcgTnVtYmVyUGlja2VyKCBhcmcxLCBhcmcyLCB7XHJcbiAqICAgZm9udDogbmV3IFBoZXRGb250KCAzMCApLFxyXG4gKiAgIGNvbG9yOiBjb2xvclByb3BlcnR5LnZhbHVlXHJcbiAqIH0gKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XHJcblxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgTm90IGEgZ29vZCBmaXQgZm9yIFBoRVQtaU8uIFBsZWFzZSBkZXNpZ24geW91ciBjb21wb25lbnQgc28gdGhhdCB0aGUgaXRlbSBpcyBtdXRhYmxlLlxyXG4gKi9cclxuY2xhc3MgTXV0YWJsZU9wdGlvbnNOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5vZGVTdWJ0eXBlIC0gVGhlIHR5cGUgb2YgdGhlIG5vZGUgdGhhdCB3ZSdsbCBiZSBjb25zdHJ1Y3RpbmcgY29waWVzIG9mLlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPCo+fSBwYXJhbWV0ZXJzIC0gQXJiaXRyYXJ5IGluaXRpYWwgcGFyYW1ldGVycyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB0eXBlJ3MgY29uc3RydWN0b3JcclxuICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGljT3B0aW9ucyAtIE9wdGlvbnMgcGFzc2VkIGluIHRoYXQgd29uJ3QgY2hhbmdlICh3aWxsIG5vdCB1bndyYXAgcHJvcGVydGllcylcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZHluYW1pY09wdGlvbnMgLSBPcHRpb25zIHBhc3NlZCBpbiB0aGF0IHdpbGwgY2hhbmdlLiBTaG91bGQgYmUgYSBtYXAgZnJvbSBrZXkgbmFtZXMgdG9cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcm9wZXJ0eS48Kj4gdmFsdWVzLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbd3JhcHBlck9wdGlvbnNdIC0gTm9kZSBvcHRpb25zIHBhc3NlZCB0byBNdXRhYmxlT3B0aW9uc05vZGUgaXRzZWxmICh0aGUgd3JhcHBlcikuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG5vZGVTdWJ0eXBlLCBwYXJhbWV0ZXJzLCBzdGF0aWNPcHRpb25zLCBkeW5hbWljT3B0aW9ucywgd3JhcHBlck9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxOb2RlfG51bGw+fSBbcmVhZC1vbmx5XSAtIEhvbGRzIG91ciBjdXJyZW50IGNvcHkgb2YgdGhlIG5vZGUgKG9yIG51bGwsIHNvIHdlIGRvbid0IGhhdmUgYVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY2lmaWMgaW5pdGlhbCB2YWx1ZSkuXHJcbiAgICB0aGlzLm5vZGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn0gLSBUaGUgY29uc3RydWN0b3IgZm9yIG91ciBjdXN0b20gc3VidHlwZSwgdW53cmFwcyB0aGUgUHJvcGVydGllcyBpbiBkeW5hbWljT3B0aW9ucy5cclxuICAgIHRoaXMuX2NvbnN0cnVjdEluc3RhbmNlID0gKCkgPT4gUmVmbGVjdC5jb25zdHJ1Y3QoIG5vZGVTdWJ0eXBlLCBbXHJcbiAgICAgIC4uLnBhcmFtZXRlcnMsXHJcbiAgICAgIG1lcmdlKCBfLm1hcFZhbHVlcyggZHluYW1pY09wdGlvbnMsIHByb3BlcnR5ID0+IHByb3BlcnR5LnZhbHVlICksIHN0YXRpY09wdGlvbnMgKSAvLyBvcHRpb25zXHJcbiAgICBdICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge011bHRpbGlua30gLSBNYWtlIGEgY29weSwgYW5kIHJlcGxhY2UgaXQgd2hlbiBvbmUgb2Ygb3VyIGR5YW5taWMgb3B0aW9ucyBjaGFuZ2VzLlxyXG4gICAgdGhpcy5tdWx0aWxpbmsgPSBNdWx0aWxpbmsubXVsdGlsaW5rKCBfLnZhbHVlcyggZHluYW1pY09wdGlvbnMgKSwgdGhpcy5yZXBsYWNlQ29weS5iaW5kKCB0aGlzICkgKTtcclxuXHJcbiAgICAvLyBBcHBseSBhbnkgb3B0aW9ucyB0aGF0IG1ha2UgbW9yZSBzZW5zZSBvbiB0aGUgd3JhcHBlciAodHlwaWNhbGx5IGxpa2UgcG9zaXRpb25pbmcpXHJcbiAgICB0aGlzLm11dGF0ZSggd3JhcHBlck9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIG91ciB0eXBlIG9mIG5vZGUsIGFuZCByZXBsYWNlcyBhbnkgZXhpc3RpbmcgY29weS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlcGxhY2VDb3B5KCkge1xyXG4gICAgY29uc3QgbmV3Q29weSA9IHRoaXMuX2NvbnN0cnVjdEluc3RhbmNlKCk7XHJcbiAgICBjb25zdCBvbGRDb3B5ID0gdGhpcy5ub2RlUHJvcGVydHkudmFsdWU7XHJcbiAgICB0aGlzLm5vZGVQcm9wZXJ0eS52YWx1ZSA9IG5ld0NvcHk7XHJcblxyXG4gICAgLy8gQWRkIGZpcnN0LCBzbyB0aGF0IHRoZXJlJ3MgYSBnb29kIGNoYW5jZSB3ZSB3b24ndCBjaGFuZ2UgYm91bmRzIChkZXBlbmRpbmcgb24gdGhlIHR5cGUpXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXdDb3B5ICk7XHJcbiAgICBpZiAoIG9sZENvcHkgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlQ2hpbGQoIG9sZENvcHkgKTtcclxuICAgICAgdGhpcy5kaXNwb3NlQ29weSggb2xkQ29weSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXR0ZW1wdCB0byBkaXNwb3NlIGFuIGluc3RhbmNlIG9mIG91ciBub2RlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge05vZGV9IGNvcHlcclxuICAgKi9cclxuICBkaXNwb3NlQ29weSggY29weSApIHtcclxuICAgIGNvcHkuZGlzcG9zZSAmJiBjb3B5LmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5tdWx0aWxpbmsuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5kaXNwb3NlQ29weSggdGhpcy5ub2RlUHJvcGVydHkudmFsdWUgKTtcclxuICAgIHRoaXMubm9kZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnN1bi5yZWdpc3RlciggJ011dGFibGVPcHRpb25zTm9kZScsIE11dGFibGVPcHRpb25zTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBNdXRhYmxlT3B0aW9uc05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSw0QkFBNEI7QUFDbEQsT0FBT0MsUUFBUSxNQUFNLDJCQUEyQjtBQUNoRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLFNBQVNDLElBQUksUUFBUSw2QkFBNkI7QUFDbEQsT0FBT0MsR0FBRyxNQUFNLFVBQVU7O0FBRTFCO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLGtCQUFrQixTQUFTRixJQUFJLENBQUM7RUFFcEM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxXQUFXLEVBQUVDLFVBQVUsRUFBRUMsYUFBYSxFQUFFQyxjQUFjLEVBQUVDLGNBQWMsRUFBRztJQUNwRixLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLEdBQUcsSUFBSVgsUUFBUSxDQUFFLElBQUssQ0FBQzs7SUFFeEM7SUFDQSxJQUFJLENBQUNZLGtCQUFrQixHQUFHLE1BQU1DLE9BQU8sQ0FBQ0MsU0FBUyxDQUFFUixXQUFXLEVBQUUsQ0FDOUQsR0FBR0MsVUFBVSxFQUNiTixLQUFLLENBQUVjLENBQUMsQ0FBQ0MsU0FBUyxDQUFFUCxjQUFjLEVBQUVRLFFBQVEsSUFBSUEsUUFBUSxDQUFDQyxLQUFNLENBQUMsRUFBRVYsYUFBYyxDQUFDLENBQUM7SUFBQSxDQUNsRixDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDVyxTQUFTLEdBQUdwQixTQUFTLENBQUNvQixTQUFTLENBQUVKLENBQUMsQ0FBQ0ssTUFBTSxDQUFFWCxjQUFlLENBQUMsRUFBRSxJQUFJLENBQUNZLFdBQVcsQ0FBQ0MsSUFBSSxDQUFFLElBQUssQ0FBRSxDQUFDOztJQUVqRztJQUNBLElBQUksQ0FBQ0MsTUFBTSxDQUFFYixjQUFlLENBQUM7RUFDL0I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBQSxFQUFHO0lBQ1osTUFBTUcsT0FBTyxHQUFHLElBQUksQ0FBQ1osa0JBQWtCLENBQUMsQ0FBQztJQUN6QyxNQUFNYSxPQUFPLEdBQUcsSUFBSSxDQUFDZCxZQUFZLENBQUNPLEtBQUs7SUFDdkMsSUFBSSxDQUFDUCxZQUFZLENBQUNPLEtBQUssR0FBR00sT0FBTzs7SUFFakM7SUFDQSxJQUFJLENBQUNFLFFBQVEsQ0FBRUYsT0FBUSxDQUFDO0lBQ3hCLElBQUtDLE9BQU8sRUFBRztNQUNiLElBQUksQ0FBQ0UsV0FBVyxDQUFFRixPQUFRLENBQUM7TUFDM0IsSUFBSSxDQUFDRyxXQUFXLENBQUVILE9BQVEsQ0FBQztJQUM3QjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxJQUFJLEVBQUc7SUFDbEJBLElBQUksQ0FBQ0MsT0FBTyxJQUFJRCxJQUFJLENBQUNDLE9BQU8sQ0FBQyxDQUFDO0VBQ2hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VBLE9BQU9BLENBQUEsRUFBRztJQUNSLElBQUksQ0FBQ1gsU0FBUyxDQUFDVyxPQUFPLENBQUMsQ0FBQztJQUN4QixJQUFJLENBQUNGLFdBQVcsQ0FBRSxJQUFJLENBQUNqQixZQUFZLENBQUNPLEtBQU0sQ0FBQztJQUMzQyxJQUFJLENBQUNQLFlBQVksQ0FBQ21CLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLEtBQUssQ0FBQ0EsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBM0IsR0FBRyxDQUFDNEIsUUFBUSxDQUFFLG9CQUFvQixFQUFFM0Isa0JBQW1CLENBQUM7QUFDeEQsZUFBZUEsa0JBQWtCIn0=