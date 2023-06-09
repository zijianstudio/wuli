// Copyright 2021, University of Colorado Boulder

/**
 * Class that represents a single atom of oxygen in the model.  I hate to name a class "O", but it is necessary for
 * consistency with other molecules names.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import greenhouseEffect from '../../../greenhouseEffect.js';
import Atom from '../atoms/Atom.js';
import Molecule from '../Molecule.js';
class O extends Molecule {
  /**
   * Constructor for a single atom of oxygen.
   *
   * @param {Object} [options]
   */
  constructor(options) {
    // Supertype constructor
    super(options);

    // Instance Data
    // @private
    this.oxygenAtom = Atom.oxygen();

    // Configure the base class.
    this.addAtom(this.oxygenAtom);

    // Set the initial offsets.
    this.initializeAtomOffsets();
  }

  /**
   * Initialize and set the center of gravity offsets for the position of this Oxygen atom.
   * @private
   */
  initializeAtomOffsets() {
    this.addInitialAtomCogOffset(this.oxygenAtom, new Vector2(0, 0));
    this.updateAtomPositions();
  }
}
greenhouseEffect.register('O', O);
export default O;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkF0b20iLCJNb2xlY3VsZSIsIk8iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJveHlnZW5BdG9tIiwib3h5Z2VuIiwiYWRkQXRvbSIsImluaXRpYWxpemVBdG9tT2Zmc2V0cyIsImFkZEluaXRpYWxBdG9tQ29nT2Zmc2V0IiwidXBkYXRlQXRvbVBvc2l0aW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ2xhc3MgdGhhdCByZXByZXNlbnRzIGEgc2luZ2xlIGF0b20gb2Ygb3h5Z2VuIGluIHRoZSBtb2RlbC4gIEkgaGF0ZSB0byBuYW1lIGEgY2xhc3MgXCJPXCIsIGJ1dCBpdCBpcyBuZWNlc3NhcnkgZm9yXHJcbiAqIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgbW9sZWN1bGVzIG5hbWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgZ3JlZW5ob3VzZUVmZmVjdCBmcm9tICcuLi8uLi8uLi9ncmVlbmhvdXNlRWZmZWN0LmpzJztcclxuaW1wb3J0IEF0b20gZnJvbSAnLi4vYXRvbXMvQXRvbS5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZSBmcm9tICcuLi9Nb2xlY3VsZS5qcyc7XHJcblxyXG5jbGFzcyBPIGV4dGVuZHMgTW9sZWN1bGUge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgYSBzaW5nbGUgYXRvbSBvZiBveHlnZW4uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gU3VwZXJ0eXBlIGNvbnN0cnVjdG9yXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEluc3RhbmNlIERhdGFcclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm94eWdlbkF0b20gPSBBdG9tLm94eWdlbigpO1xyXG5cclxuICAgIC8vIENvbmZpZ3VyZSB0aGUgYmFzZSBjbGFzcy5cclxuICAgIHRoaXMuYWRkQXRvbSggdGhpcy5veHlnZW5BdG9tICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBpbml0aWFsIG9mZnNldHMuXHJcbiAgICB0aGlzLmluaXRpYWxpemVBdG9tT2Zmc2V0cygpO1xyXG5cclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIGFuZCBzZXQgdGhlIGNlbnRlciBvZiBncmF2aXR5IG9mZnNldHMgZm9yIHRoZSBwb3NpdGlvbiBvZiB0aGlzIE94eWdlbiBhdG9tLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZUF0b21PZmZzZXRzKCkge1xyXG4gICAgdGhpcy5hZGRJbml0aWFsQXRvbUNvZ09mZnNldCggdGhpcy5veHlnZW5BdG9tLCBuZXcgVmVjdG9yMiggMCwgMCApICk7XHJcbiAgICB0aGlzLnVwZGF0ZUF0b21Qb3NpdGlvbnMoKTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdPJywgTyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsZ0JBQWdCLE1BQU0sOEJBQThCO0FBQzNELE9BQU9DLElBQUksTUFBTSxrQkFBa0I7QUFDbkMsT0FBT0MsUUFBUSxNQUFNLGdCQUFnQjtBQUVyQyxNQUFNQyxDQUFDLFNBQVNELFFBQVEsQ0FBQztFQUV2QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQjtJQUNBLEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJQUVoQjtJQUNBO0lBQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUdMLElBQUksQ0FBQ00sTUFBTSxDQUFDLENBQUM7O0lBRS9CO0lBQ0EsSUFBSSxDQUFDQyxPQUFPLENBQUUsSUFBSSxDQUFDRixVQUFXLENBQUM7O0lBRS9CO0lBQ0EsSUFBSSxDQUFDRyxxQkFBcUIsQ0FBQyxDQUFDO0VBRTlCOztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VBLHFCQUFxQkEsQ0FBQSxFQUFHO0lBQ3RCLElBQUksQ0FBQ0MsdUJBQXVCLENBQUUsSUFBSSxDQUFDSixVQUFVLEVBQUUsSUFBSVAsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUUsQ0FBQztJQUNwRSxJQUFJLENBQUNZLG1CQUFtQixDQUFDLENBQUM7RUFDNUI7QUFDRjtBQUVBWCxnQkFBZ0IsQ0FBQ1ksUUFBUSxDQUFFLEdBQUcsRUFBRVQsQ0FBRSxDQUFDO0FBRW5DLGVBQWVBLENBQUMifQ==