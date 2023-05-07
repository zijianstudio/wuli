// Copyright 2014-2023, University of Colorado Boulder

/**
 * A substance is a participant in a chemical reaction.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
export default class Substance {
  // substance's coefficient in the reaction equation, mutable to support 'Custom' sandwich

  // how much of the substance we have

  // visual representation of the substance, mutable to support the 'Custom' sandwich

  /**
   * @param coefficient - substance's coefficient in the reaction equation
   * @param symbol - used in reaction equation
   * @param icon - visual representation of the substance
   * @param [quantity] - how much of a substance we have, defaults to zero
   */
  constructor(coefficient, symbol, icon, quantity = 0) {
    assert && assert(coefficient >= 0);
    assert && assert(quantity >= 0);
    this.symbol = symbol;
    this.coefficientProperty = new NumberProperty(coefficient, {
      numberType: 'Integer'
    });
    this.quantityProperty = new NumberProperty(quantity, {
      numberType: 'Integer'
    });
    this.iconProperty = new Property(icon);
  }
  reset() {
    this.coefficientProperty.reset();
    this.quantityProperty.reset();
    this.iconProperty.reset();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }

  /*
   * Are 2 substances the same? AXON.Property observers are not considered.
   */
  equals(substance) {
    return this.symbol === substance.symbol && this.coefficientProperty.value === substance.coefficientProperty.value && this.iconProperty.value === substance.iconProperty.value && this.quantityProperty.value === substance.quantityProperty.value;
  }

  /**
   * Creates a shallow copy of this Substance. AXON.Property observers are not copied.
   * @param quantity - optional quantity, to override this.quantityProperty.value
   */
  clone(quantity) {
    return new Substance(this.coefficientProperty.value, this.symbol, this.iconProperty.value, quantity === undefined ? this.quantityProperty.value : 0);
  }
}
reactantsProductsAndLeftovers.register('Substance', Substance);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwicmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMiLCJTdWJzdGFuY2UiLCJjb25zdHJ1Y3RvciIsImNvZWZmaWNpZW50Iiwic3ltYm9sIiwiaWNvbiIsInF1YW50aXR5IiwiYXNzZXJ0IiwiY29lZmZpY2llbnRQcm9wZXJ0eSIsIm51bWJlclR5cGUiLCJxdWFudGl0eVByb3BlcnR5IiwiaWNvblByb3BlcnR5IiwicmVzZXQiLCJkaXNwb3NlIiwiZXF1YWxzIiwic3Vic3RhbmNlIiwidmFsdWUiLCJjbG9uZSIsInVuZGVmaW5lZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3Vic3RhbmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgc3Vic3RhbmNlIGlzIGEgcGFydGljaXBhbnQgaW4gYSBjaGVtaWNhbCByZWFjdGlvbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCByZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycyBmcm9tICcuLi8uLi9yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdWJzdGFuY2Uge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgc3ltYm9sOiBzdHJpbmc7XHJcblxyXG4gIC8vIHN1YnN0YW5jZSdzIGNvZWZmaWNpZW50IGluIHRoZSByZWFjdGlvbiBlcXVhdGlvbiwgbXV0YWJsZSB0byBzdXBwb3J0ICdDdXN0b20nIHNhbmR3aWNoXHJcbiAgcHVibGljIHJlYWRvbmx5IGNvZWZmaWNpZW50UHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIGhvdyBtdWNoIG9mIHRoZSBzdWJzdGFuY2Ugd2UgaGF2ZVxyXG4gIHB1YmxpYyByZWFkb25seSBxdWFudGl0eVByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvLyB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIHN1YnN0YW5jZSwgbXV0YWJsZSB0byBzdXBwb3J0IHRoZSAnQ3VzdG9tJyBzYW5kd2ljaFxyXG4gIHB1YmxpYyByZWFkb25seSBpY29uUHJvcGVydHk6IFByb3BlcnR5PE5vZGU+O1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gY29lZmZpY2llbnQgLSBzdWJzdGFuY2UncyBjb2VmZmljaWVudCBpbiB0aGUgcmVhY3Rpb24gZXF1YXRpb25cclxuICAgKiBAcGFyYW0gc3ltYm9sIC0gdXNlZCBpbiByZWFjdGlvbiBlcXVhdGlvblxyXG4gICAqIEBwYXJhbSBpY29uIC0gdmlzdWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzdWJzdGFuY2VcclxuICAgKiBAcGFyYW0gW3F1YW50aXR5XSAtIGhvdyBtdWNoIG9mIGEgc3Vic3RhbmNlIHdlIGhhdmUsIGRlZmF1bHRzIHRvIHplcm9cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvZWZmaWNpZW50OiBudW1iZXIsIHN5bWJvbDogc3RyaW5nLCBpY29uOiBOb2RlLCBxdWFudGl0eSA9IDAgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29lZmZpY2llbnQgPj0gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcXVhbnRpdHkgPj0gMCApO1xyXG5cclxuICAgIHRoaXMuc3ltYm9sID0gc3ltYm9sO1xyXG5cclxuICAgIHRoaXMuY29lZmZpY2llbnRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggY29lZmZpY2llbnQsIHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5xdWFudGl0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBxdWFudGl0eSwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmljb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggaWNvbiApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jb2VmZmljaWVudFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnF1YW50aXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaWNvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBBcmUgMiBzdWJzdGFuY2VzIHRoZSBzYW1lPyBBWE9OLlByb3BlcnR5IG9ic2VydmVycyBhcmUgbm90IGNvbnNpZGVyZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGVxdWFscyggc3Vic3RhbmNlOiBTdWJzdGFuY2UgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKCB0aGlzLnN5bWJvbCA9PT0gc3Vic3RhbmNlLnN5bWJvbCAmJlxyXG4gICAgICAgICAgICAgdGhpcy5jb2VmZmljaWVudFByb3BlcnR5LnZhbHVlID09PSBzdWJzdGFuY2UuY29lZmZpY2llbnRQcm9wZXJ0eS52YWx1ZSAmJlxyXG4gICAgICAgICAgICAgdGhpcy5pY29uUHJvcGVydHkudmFsdWUgPT09IHN1YnN0YW5jZS5pY29uUHJvcGVydHkudmFsdWUgJiZcclxuICAgICAgICAgICAgIHRoaXMucXVhbnRpdHlQcm9wZXJ0eS52YWx1ZSA9PT0gc3Vic3RhbmNlLnF1YW50aXR5UHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBzaGFsbG93IGNvcHkgb2YgdGhpcyBTdWJzdGFuY2UuIEFYT04uUHJvcGVydHkgb2JzZXJ2ZXJzIGFyZSBub3QgY29waWVkLlxyXG4gICAqIEBwYXJhbSBxdWFudGl0eSAtIG9wdGlvbmFsIHF1YW50aXR5LCB0byBvdmVycmlkZSB0aGlzLnF1YW50aXR5UHJvcGVydHkudmFsdWVcclxuICAgKi9cclxuICBwdWJsaWMgY2xvbmUoIHF1YW50aXR5PzogbnVtYmVyICk6IFN1YnN0YW5jZSB7XHJcbiAgICByZXR1cm4gbmV3IFN1YnN0YW5jZSggdGhpcy5jb2VmZmljaWVudFByb3BlcnR5LnZhbHVlLCB0aGlzLnN5bWJvbCwgdGhpcy5pY29uUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICggcXVhbnRpdHkgPT09IHVuZGVmaW5lZCApID8gdGhpcy5xdWFudGl0eVByb3BlcnR5LnZhbHVlIDogMCApO1xyXG4gIH1cclxufVxyXG5cclxucmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMucmVnaXN0ZXIoICdTdWJzdGFuY2UnLCBTdWJzdGFuY2UgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLDZCQUE2QixNQUFNLHdDQUF3QztBQUVsRixlQUFlLE1BQU1DLFNBQVMsQ0FBQztFQUk3Qjs7RUFHQTs7RUFHQTs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0MsV0FBV0EsQ0FBRUMsV0FBbUIsRUFBRUMsTUFBYyxFQUFFQyxJQUFVLEVBQUVDLFFBQVEsR0FBRyxDQUFDLEVBQUc7SUFFbEZDLE1BQU0sSUFBSUEsTUFBTSxDQUFFSixXQUFXLElBQUksQ0FBRSxDQUFDO0lBQ3BDSSxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsUUFBUSxJQUFJLENBQUUsQ0FBQztJQUVqQyxJQUFJLENBQUNGLE1BQU0sR0FBR0EsTUFBTTtJQUVwQixJQUFJLENBQUNJLG1CQUFtQixHQUFHLElBQUlWLGNBQWMsQ0FBRUssV0FBVyxFQUFFO01BQzFETSxVQUFVLEVBQUU7SUFDZCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLGdCQUFnQixHQUFHLElBQUlaLGNBQWMsQ0FBRVEsUUFBUSxFQUFFO01BQ3BERyxVQUFVLEVBQUU7SUFDZCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNFLFlBQVksR0FBRyxJQUFJWixRQUFRLENBQUVNLElBQUssQ0FBQztFQUMxQztFQUVPTyxLQUFLQSxDQUFBLEVBQVM7SUFDbkIsSUFBSSxDQUFDSixtQkFBbUIsQ0FBQ0ksS0FBSyxDQUFDLENBQUM7SUFDaEMsSUFBSSxDQUFDRixnQkFBZ0IsQ0FBQ0UsS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDRCxZQUFZLENBQUNDLEtBQUssQ0FBQyxDQUFDO0VBQzNCO0VBRU9DLE9BQU9BLENBQUEsRUFBUztJQUNyQk4sTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0VBQzNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNTTyxNQUFNQSxDQUFFQyxTQUFvQixFQUFZO0lBQzdDLE9BQVMsSUFBSSxDQUFDWCxNQUFNLEtBQUtXLFNBQVMsQ0FBQ1gsTUFBTSxJQUNoQyxJQUFJLENBQUNJLG1CQUFtQixDQUFDUSxLQUFLLEtBQUtELFNBQVMsQ0FBQ1AsbUJBQW1CLENBQUNRLEtBQUssSUFDdEUsSUFBSSxDQUFDTCxZQUFZLENBQUNLLEtBQUssS0FBS0QsU0FBUyxDQUFDSixZQUFZLENBQUNLLEtBQUssSUFDeEQsSUFBSSxDQUFDTixnQkFBZ0IsQ0FBQ00sS0FBSyxLQUFLRCxTQUFTLENBQUNMLGdCQUFnQixDQUFDTSxLQUFLO0VBQzNFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NDLEtBQUtBLENBQUVYLFFBQWlCLEVBQWM7SUFDM0MsT0FBTyxJQUFJTCxTQUFTLENBQUUsSUFBSSxDQUFDTyxtQkFBbUIsQ0FBQ1EsS0FBSyxFQUFFLElBQUksQ0FBQ1osTUFBTSxFQUFFLElBQUksQ0FBQ08sWUFBWSxDQUFDSyxLQUFLLEVBQ3RGVixRQUFRLEtBQUtZLFNBQVMsR0FBSyxJQUFJLENBQUNSLGdCQUFnQixDQUFDTSxLQUFLLEdBQUcsQ0FBRSxDQUFDO0VBQ2xFO0FBQ0Y7QUFFQWhCLDZCQUE2QixDQUFDbUIsUUFBUSxDQUFFLFdBQVcsRUFBRWxCLFNBQVUsQ0FBQyJ9