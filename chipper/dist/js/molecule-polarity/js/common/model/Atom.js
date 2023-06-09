// Copyright 2014-2022, University of Colorado Boulder

/**
 * Atom is a make-believe atom whose electronegativity is mutable.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import moleculePolarity from '../../moleculePolarity.js';
import MPConstants from '../MPConstants.js';
export default class Atom extends PhetioObject {
  constructor(labelStringProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      diameter: MPConstants.ATOM_DIAMETER,
      color: 'white',
      position: new Vector2(0, 0),
      electronegativity: MPConstants.ELECTRONEGATIVITY_RANGE.min,
      // PhetioObjectOptions
      phetioState: false
    }, providedOptions);
    super(options);
    this.labelStringProperty = labelStringProperty;
    this.diameter = options.diameter;
    this.color = options.color;
    this.positionProperty = new Vector2Property(options.position, {
      tandem: options.tandem.createTandem('positionProperty'),
      phetioDocumentation: 'The position of this atom. (0,0) is at the upper-LEFT, +x is to the right, and +y is DOWN.',
      phetioReadOnly: true // because position is constrained by molecule structure
    });

    this.electronegativityProperty = new NumberProperty(options.electronegativity, {
      range: MPConstants.ELECTRONEGATIVITY_RANGE,
      tandem: options.tandem.createTandem('electronegativityProperty')
    });

    // partial charge is zero until this atom participates in a bond
    this.partialChargeProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('partialChargeProperty'),
      phetioDocumentation: 'qualitative scalar representation of the partial charge, computed as the electronegativity difference',
      phetioReadOnly: true // because this is computed based on electronegativity of atoms in a molecule
    });
  }

  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.electronegativityProperty.reset();
    // Do not reset positionProperty and partialChargeProperty. They will be reset by their parent molecule.
  }
}

moleculePolarity.register('Atom', Atom);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJvcHRpb25pemUiLCJQaGV0aW9PYmplY3QiLCJtb2xlY3VsZVBvbGFyaXR5IiwiTVBDb25zdGFudHMiLCJBdG9tIiwiY29uc3RydWN0b3IiLCJsYWJlbFN0cmluZ1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImRpYW1ldGVyIiwiQVRPTV9ESUFNRVRFUiIsImNvbG9yIiwicG9zaXRpb24iLCJlbGVjdHJvbmVnYXRpdml0eSIsIkVMRUNUUk9ORUdBVElWSVRZX1JBTkdFIiwibWluIiwicGhldGlvU3RhdGUiLCJwb3NpdGlvblByb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb1JlYWRPbmx5IiwiZWxlY3Ryb25lZ2F0aXZpdHlQcm9wZXJ0eSIsInJhbmdlIiwicGFydGlhbENoYXJnZVByb3BlcnR5IiwiZGlzcG9zZSIsImFzc2VydCIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBdG9tLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEF0b20gaXMgYSBtYWtlLWJlbGlldmUgYXRvbSB3aG9zZSBlbGVjdHJvbmVnYXRpdml0eSBpcyBtdXRhYmxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IG1vbGVjdWxlUG9sYXJpdHkgZnJvbSAnLi4vLi4vbW9sZWN1bGVQb2xhcml0eS5qcyc7XHJcbmltcG9ydCBNUENvbnN0YW50cyBmcm9tICcuLi9NUENvbnN0YW50cy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGRpYW1ldGVyPzogbnVtYmVyOyAvLyB0aGUgYXRvbSdzIGRpYW1ldGVyXHJcbiAgY29sb3I/OiBUQ29sb3I7IC8vIGJhc2UgY29sb3Igb2YgdGhlIGF0b21cclxuICBwb3NpdGlvbj86IFZlY3RvcjI7IC8vIGluaXRpYWwgcG9zaXRpb25cclxuICBlbGVjdHJvbmVnYXRpdml0eT86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgQXRvbU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdG9tIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGxhYmVsU3RyaW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcbiAgcHVibGljIHJlYWRvbmx5IGRpYW1ldGVyOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbG9yOiBUQ29sb3I7XHJcbiAgcHVibGljIHJlYWRvbmx5IHBvc2l0aW9uUHJvcGVydHk6IFRQcm9wZXJ0eTxWZWN0b3IyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgZWxlY3Ryb25lZ2F0aXZpdHlQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcbiAgcHVibGljIHJlYWRvbmx5IHBhcnRpYWxDaGFyZ2VQcm9wZXJ0eTogVFByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGFiZWxTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgcHJvdmlkZWRPcHRpb25zOiBBdG9tT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEF0b21PcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgZGlhbWV0ZXI6IE1QQ29uc3RhbnRzLkFUT01fRElBTUVURVIsXHJcbiAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICAgICAgZWxlY3Ryb25lZ2F0aXZpdHk6IE1QQ29uc3RhbnRzLkVMRUNUUk9ORUdBVElWSVRZX1JBTkdFLm1pbixcclxuXHJcbiAgICAgIC8vIFBoZXRpb09iamVjdE9wdGlvbnNcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMubGFiZWxTdHJpbmdQcm9wZXJ0eSA9IGxhYmVsU3RyaW5nUHJvcGVydHk7XHJcbiAgICB0aGlzLmRpYW1ldGVyID0gb3B0aW9ucy5kaWFtZXRlcjtcclxuICAgIHRoaXMuY29sb3IgPSBvcHRpb25zLmNvbG9yO1xyXG5cclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG9wdGlvbnMucG9zaXRpb24sIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIHBvc2l0aW9uIG9mIHRoaXMgYXRvbS4gKDAsMCkgaXMgYXQgdGhlIHVwcGVyLUxFRlQsICt4IGlzIHRvIHRoZSByaWdodCwgYW5kICt5IGlzIERPV04uJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUgLy8gYmVjYXVzZSBwb3NpdGlvbiBpcyBjb25zdHJhaW5lZCBieSBtb2xlY3VsZSBzdHJ1Y3R1cmVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uZWdhdGl2aXR5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuZWxlY3Ryb25lZ2F0aXZpdHksIHtcclxuICAgICAgcmFuZ2U6IE1QQ29uc3RhbnRzLkVMRUNUUk9ORUdBVElWSVRZX1JBTkdFLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cm9uZWdhdGl2aXR5UHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwYXJ0aWFsIGNoYXJnZSBpcyB6ZXJvIHVudGlsIHRoaXMgYXRvbSBwYXJ0aWNpcGF0ZXMgaW4gYSBib25kXHJcbiAgICB0aGlzLnBhcnRpYWxDaGFyZ2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhcnRpYWxDaGFyZ2VQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3F1YWxpdGF0aXZlIHNjYWxhciByZXByZXNlbnRhdGlvbiBvZiB0aGUgcGFydGlhbCBjaGFyZ2UsIGNvbXB1dGVkIGFzIHRoZSBlbGVjdHJvbmVnYXRpdml0eSBkaWZmZXJlbmNlJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUgLy8gYmVjYXVzZSB0aGlzIGlzIGNvbXB1dGVkIGJhc2VkIG9uIGVsZWN0cm9uZWdhdGl2aXR5IG9mIGF0b21zIGluIGEgbW9sZWN1bGVcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmVsZWN0cm9uZWdhdGl2aXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIC8vIERvIG5vdCByZXNldCBwb3NpdGlvblByb3BlcnR5IGFuZCBwYXJ0aWFsQ2hhcmdlUHJvcGVydHkuIFRoZXkgd2lsbCBiZSByZXNldCBieSB0aGVpciBwYXJlbnQgbW9sZWN1bGUuXHJcbiAgfVxyXG59XHJcblxyXG5tb2xlY3VsZVBvbGFyaXR5LnJlZ2lzdGVyKCAnQXRvbScsIEF0b20gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUdsRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUc3RCxPQUFPQyxZQUFZLE1BQStCLHVDQUF1QztBQUN6RixPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQVczQyxlQUFlLE1BQU1DLElBQUksU0FBU0gsWUFBWSxDQUFDO0VBU3RDSSxXQUFXQSxDQUFFQyxtQkFBOEMsRUFBRUMsZUFBNEIsRUFBRztJQUVqRyxNQUFNQyxPQUFPLEdBQUdSLFNBQVMsQ0FBZ0QsQ0FBQyxDQUFFO01BRTFFO01BQ0FTLFFBQVEsRUFBRU4sV0FBVyxDQUFDTyxhQUFhO01BQ25DQyxLQUFLLEVBQUUsT0FBTztNQUNkQyxRQUFRLEVBQUUsSUFBSWQsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDN0JlLGlCQUFpQixFQUFFVixXQUFXLENBQUNXLHVCQUF1QixDQUFDQyxHQUFHO01BRTFEO01BQ0FDLFdBQVcsRUFBRTtJQUNmLENBQUMsRUFBRVQsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVDLE9BQVEsQ0FBQztJQUVoQixJQUFJLENBQUNGLG1CQUFtQixHQUFHQSxtQkFBbUI7SUFDOUMsSUFBSSxDQUFDRyxRQUFRLEdBQUdELE9BQU8sQ0FBQ0MsUUFBUTtJQUNoQyxJQUFJLENBQUNFLEtBQUssR0FBR0gsT0FBTyxDQUFDRyxLQUFLO0lBRTFCLElBQUksQ0FBQ00sZ0JBQWdCLEdBQUcsSUFBSWxCLGVBQWUsQ0FBRVMsT0FBTyxDQUFDSSxRQUFRLEVBQUU7TUFDN0RNLE1BQU0sRUFBRVYsT0FBTyxDQUFDVSxNQUFNLENBQUNDLFlBQVksQ0FBRSxrQkFBbUIsQ0FBQztNQUN6REMsbUJBQW1CLEVBQUUsNEZBQTRGO01BQ2pIQyxjQUFjLEVBQUUsSUFBSSxDQUFDO0lBQ3ZCLENBQUUsQ0FBQzs7SUFFSCxJQUFJLENBQUNDLHlCQUF5QixHQUFHLElBQUl6QixjQUFjLENBQUVXLE9BQU8sQ0FBQ0ssaUJBQWlCLEVBQUU7TUFDOUVVLEtBQUssRUFBRXBCLFdBQVcsQ0FBQ1csdUJBQXVCO01BQzFDSSxNQUFNLEVBQUVWLE9BQU8sQ0FBQ1UsTUFBTSxDQUFDQyxZQUFZLENBQUUsMkJBQTRCO0lBQ25FLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ0sscUJBQXFCLEdBQUcsSUFBSTNCLGNBQWMsQ0FBRSxDQUFDLEVBQUU7TUFDbERxQixNQUFNLEVBQUVWLE9BQU8sQ0FBQ1UsTUFBTSxDQUFDQyxZQUFZLENBQUUsdUJBQXdCLENBQUM7TUFDOURDLG1CQUFtQixFQUFFLHVHQUF1RztNQUM1SEMsY0FBYyxFQUFFLElBQUksQ0FBQztJQUN2QixDQUFFLENBQUM7RUFDTDs7RUFFZ0JJLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7RUFFT0UsS0FBS0EsQ0FBQSxFQUFTO0lBQ25CLElBQUksQ0FBQ0wseUJBQXlCLENBQUNLLEtBQUssQ0FBQyxDQUFDO0lBQ3RDO0VBQ0Y7QUFDRjs7QUFFQXpCLGdCQUFnQixDQUFDMEIsUUFBUSxDQUFFLE1BQU0sRUFBRXhCLElBQUssQ0FBQyJ9