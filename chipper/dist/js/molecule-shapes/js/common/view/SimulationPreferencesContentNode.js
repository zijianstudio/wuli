// Copyright 2014-2022, University of Colorado Boulder

/**
 * Preferences controls for molecule-shapes that may change simulation representation or behavior.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesStrings from '../../MoleculeShapesStrings.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';
class SimulationPreferencesContentNode extends VBox {
  /**
   * @param {boolean} isBasicsVersion
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(isBasicsVersion, tandem, options) {
    const checkboxes = [];
    let label = null;
    if (!isBasicsVersion) {
      const showOuterLonePairsCheckboxTandem = tandem.createTandem('showOuterLonePairsCheckbox');
      label = new Text(MoleculeShapesStrings.options.showOuterLonePairsStringProperty, {
        font: PreferencesDialog.CONTENT_FONT,
        maxWidth: 350,
        tandem: showOuterLonePairsCheckboxTandem.createTandem('labelText')
      });
      checkboxes.push(new Checkbox(MoleculeShapesGlobals.showOuterLonePairsProperty, label, {
        tandem: showOuterLonePairsCheckboxTandem
      }));
    }

    // A VBox is used to easily add in more controls in the future.
    super({
      children: checkboxes,
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    });

    // @private {Array.<Node>}
    this.checkboxes = checkboxes;

    // @private {Node|null} - For disposal
    this.label = label;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.checkboxes.forEach(checkbox => checkbox.dispose());
    this.label && this.label.dispose();
    super.dispose();
  }
}
moleculeShapes.register('SimulationPreferencesContentNode', SimulationPreferencesContentNode);
export default SimulationPreferencesContentNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcmVmZXJlbmNlc0RpYWxvZyIsIlRleHQiLCJWQm94IiwiQ2hlY2tib3giLCJtb2xlY3VsZVNoYXBlcyIsIk1vbGVjdWxlU2hhcGVzU3RyaW5ncyIsIk1vbGVjdWxlU2hhcGVzR2xvYmFscyIsIlNpbXVsYXRpb25QcmVmZXJlbmNlc0NvbnRlbnROb2RlIiwiY29uc3RydWN0b3IiLCJpc0Jhc2ljc1ZlcnNpb24iLCJ0YW5kZW0iLCJvcHRpb25zIiwiY2hlY2tib3hlcyIsImxhYmVsIiwic2hvd091dGVyTG9uZVBhaXJzQ2hlY2tib3hUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzaG93T3V0ZXJMb25lUGFpcnNTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJDT05URU5UX0ZPTlQiLCJtYXhXaWR0aCIsInB1c2giLCJzaG93T3V0ZXJMb25lUGFpcnNQcm9wZXJ0eSIsImNoaWxkcmVuIiwic3BhY2luZyIsIkNPTlRFTlRfU1BBQ0lORyIsImFsaWduIiwiZGlzcG9zZSIsImZvckVhY2giLCJjaGVja2JveCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2ltdWxhdGlvblByZWZlcmVuY2VzQ29udGVudE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUHJlZmVyZW5jZXMgY29udHJvbHMgZm9yIG1vbGVjdWxlLXNoYXBlcyB0aGF0IG1heSBjaGFuZ2Ugc2ltdWxhdGlvbiByZXByZXNlbnRhdGlvbiBvciBiZWhhdmlvci5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc0RpYWxvZy5qcyc7XHJcbmltcG9ydCB7IFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IG1vbGVjdWxlU2hhcGVzIGZyb20gJy4uLy4uL21vbGVjdWxlU2hhcGVzLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlU2hhcGVzU3RyaW5ncyBmcm9tICcuLi8uLi9Nb2xlY3VsZVNoYXBlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNHbG9iYWxzIGZyb20gJy4uL01vbGVjdWxlU2hhcGVzR2xvYmFscy5qcyc7XHJcblxyXG5jbGFzcyBTaW11bGF0aW9uUHJlZmVyZW5jZXNDb250ZW50Tm9kZSBleHRlbmRzIFZCb3gge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNCYXNpY3NWZXJzaW9uXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaXNCYXNpY3NWZXJzaW9uLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgY2hlY2tib3hlcyA9IFtdO1xyXG4gICAgbGV0IGxhYmVsID0gbnVsbDtcclxuXHJcbiAgICBpZiAoICFpc0Jhc2ljc1ZlcnNpb24gKSB7XHJcbiAgICAgIGNvbnN0IHNob3dPdXRlckxvbmVQYWlyc0NoZWNrYm94VGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Nob3dPdXRlckxvbmVQYWlyc0NoZWNrYm94JyApO1xyXG5cclxuICAgICAgbGFiZWwgPSBuZXcgVGV4dCggTW9sZWN1bGVTaGFwZXNTdHJpbmdzLm9wdGlvbnMuc2hvd091dGVyTG9uZVBhaXJzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICBmb250OiBQcmVmZXJlbmNlc0RpYWxvZy5DT05URU5UX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IDM1MCxcclxuICAgICAgICB0YW5kZW06IHNob3dPdXRlckxvbmVQYWlyc0NoZWNrYm94VGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVGV4dCcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjaGVja2JveGVzLnB1c2goIG5ldyBDaGVja2JveCggTW9sZWN1bGVTaGFwZXNHbG9iYWxzLnNob3dPdXRlckxvbmVQYWlyc1Byb3BlcnR5LCBsYWJlbCwge1xyXG4gICAgICAgIHRhbmRlbTogc2hvd091dGVyTG9uZVBhaXJzQ2hlY2tib3hUYW5kZW1cclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQSBWQm94IGlzIHVzZWQgdG8gZWFzaWx5IGFkZCBpbiBtb3JlIGNvbnRyb2xzIGluIHRoZSBmdXR1cmUuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogY2hlY2tib3hlcyxcclxuICAgICAgc3BhY2luZzogUHJlZmVyZW5jZXNEaWFsb2cuQ09OVEVOVF9TUEFDSU5HLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxOb2RlPn1cclxuICAgIHRoaXMuY2hlY2tib3hlcyA9IGNoZWNrYm94ZXM7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV8bnVsbH0gLSBGb3IgZGlzcG9zYWxcclxuICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuY2hlY2tib3hlcy5mb3JFYWNoKCBjaGVja2JveCA9PiBjaGVja2JveC5kaXNwb3NlKCkgKTtcclxuICAgIHRoaXMubGFiZWwgJiYgdGhpcy5sYWJlbC5kaXNwb3NlKCk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdTaW11bGF0aW9uUHJlZmVyZW5jZXNDb250ZW50Tm9kZScsIFNpbXVsYXRpb25QcmVmZXJlbmNlc0NvbnRlbnROb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaW11bGF0aW9uUHJlZmVyZW5jZXNDb250ZW50Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsaUJBQWlCLE1BQU0sdURBQXVEO0FBQ3JGLFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUUvRCxNQUFNQyxnQ0FBZ0MsU0FBU0wsSUFBSSxDQUFDO0VBQ2xEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsZUFBZSxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUU5QyxNQUFNQyxVQUFVLEdBQUcsRUFBRTtJQUNyQixJQUFJQyxLQUFLLEdBQUcsSUFBSTtJQUVoQixJQUFLLENBQUNKLGVBQWUsRUFBRztNQUN0QixNQUFNSyxnQ0FBZ0MsR0FBR0osTUFBTSxDQUFDSyxZQUFZLENBQUUsNEJBQTZCLENBQUM7TUFFNUZGLEtBQUssR0FBRyxJQUFJWixJQUFJLENBQUVJLHFCQUFxQixDQUFDTSxPQUFPLENBQUNLLGdDQUFnQyxFQUFFO1FBQ2hGQyxJQUFJLEVBQUVqQixpQkFBaUIsQ0FBQ2tCLFlBQVk7UUFDcENDLFFBQVEsRUFBRSxHQUFHO1FBQ2JULE1BQU0sRUFBRUksZ0NBQWdDLENBQUNDLFlBQVksQ0FBRSxXQUFZO01BQ3JFLENBQUUsQ0FBQztNQUVISCxVQUFVLENBQUNRLElBQUksQ0FBRSxJQUFJakIsUUFBUSxDQUFFRyxxQkFBcUIsQ0FBQ2UsMEJBQTBCLEVBQUVSLEtBQUssRUFBRTtRQUN0RkgsTUFBTSxFQUFFSTtNQUNWLENBQUUsQ0FBRSxDQUFDO0lBQ1A7O0lBRUE7SUFDQSxLQUFLLENBQUU7TUFDTFEsUUFBUSxFQUFFVixVQUFVO01BQ3BCVyxPQUFPLEVBQUV2QixpQkFBaUIsQ0FBQ3dCLGVBQWU7TUFDMUNDLEtBQUssRUFBRTtJQUNULENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ2IsVUFBVSxHQUFHQSxVQUFVOztJQUU1QjtJQUNBLElBQUksQ0FBQ0MsS0FBSyxHQUFHQSxLQUFLO0VBQ3BCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VhLE9BQU9BLENBQUEsRUFBRztJQUNSLElBQUksQ0FBQ2QsVUFBVSxDQUFDZSxPQUFPLENBQUVDLFFBQVEsSUFBSUEsUUFBUSxDQUFDRixPQUFPLENBQUMsQ0FBRSxDQUFDO0lBQ3pELElBQUksQ0FBQ2IsS0FBSyxJQUFJLElBQUksQ0FBQ0EsS0FBSyxDQUFDYSxPQUFPLENBQUMsQ0FBQztJQUVsQyxLQUFLLENBQUNBLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQXRCLGNBQWMsQ0FBQ3lCLFFBQVEsQ0FBRSxrQ0FBa0MsRUFBRXRCLGdDQUFpQyxDQUFDO0FBRS9GLGVBQWVBLGdDQUFnQyJ9