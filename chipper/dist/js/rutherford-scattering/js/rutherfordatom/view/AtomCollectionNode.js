// Copyright 2016-2022, University of Colorado Boulder

/**
 * Visual representation of a collection of rutherford atoms. This draws the actual nuclei and electron shells in the
 * "Atom" scene of the "Rutherford Atom" screen. The electron energy levels are represented by dashed
 * circles scaled by the Bohr energy for each level.
 *
 * @author Dave Schmitz (Schmitzware)
 * @author Jesse Greenberg
 */

import { Circle, Node, Path } from '../../../../scenery/js/imports.js';
import RSColors from '../../common/RSColors.js';
import RSQueryParameters from '../../common/RSQueryParameters.js';
import ParticleNodeFactory from '../../common/view/ParticleNodeFactory.js';
import rutherfordScattering from '../../rutherfordScattering.js';

// constants
const IONIZATION_ENERGY = 13.6; // energy required to ionize hydrogen, in eV
const RADIUS_SCALE = 5.95; // scale to make the radii visible in the space, chosen empirically
const ENERGY_LEVELS = 6; // number of energy levels/radii to show for the atom

class AtomCollectionNode extends Node {
  /**
   * @param {RutherfordAtomSpace} atomSpace - AtomSpace containing the atoms
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(atomSpace, modelViewTransform, options) {
    super(options);

    // @public (read-only) {null|HTMLImageElement} - This node will eventually be drawn with canvas with
    // context.drawImage. The image is created asynchronously in this constructor.
    this.image = null;

    // draw each atom in the space - called every time the color profile changes
    const drawAtomCollection = () => {
      // remove the all children
      this.removeAllChildren();
      atomSpace.atoms.forEach(atom => {
        // a small circle represents each nucleus
        const nucleusCircle = ParticleNodeFactory.createNucleus();
        nucleusCircle.center = modelViewTransform.modelToViewPosition(atom.position);
        this.addChild(nucleusCircle);

        // create the radii - concentric circles with dashed lines spaced proportionally to the Bohr
        // energies
        const getScaledRadius = index => {
          let radius = 0;

          // sum the Bohr energies up to this index
          for (let i = 1; i <= index; i++) {
            const bohrEnergy = IONIZATION_ENERGY / (i * i);
            radius += bohrEnergy; // radius will be scaled by this sum
          }

          return radius * RADIUS_SCALE;
        };

        // draw the radii
        for (let i = ENERGY_LEVELS; i > 0; i--) {
          const scaledRadius = getScaledRadius(i);
          const radius = new Circle(scaledRadius, {
            stroke: 'grey',
            lineDash: [5, 5],
            center: nucleusCircle.center
          });
          this.addChild(radius);
        }

        // draw the bounds of each nucleus
        if (RSQueryParameters.showDebugShapes) {
          const boundsRectangle = new Path(modelViewTransform.modelToViewShape(atom.boundingRect), {
            stroke: 'red'
          });
          this.addChild(boundsRectangle);
          const boundingCircle = new Path(modelViewTransform.modelToViewShape(atom.boundingCircle), {
            stroke: 'red'
          });
          this.addChild(boundingCircle);
        }
      });
    };

    // Draw to image whenever the color changes so this can be drawn to a CanvasNode. The only color that changes is
    // nucleusColorProperty (used in ParticleNodeFactory.createNucleus()) and we link directly to that color rather
    // than profileNameProperty so that we redraw the image if that color changes from
    // rutherford-scattering-colors.hmtl. No need to unlink, this instance exists for life of sim
    RSColors.nucleusColorProperty.link(() => {
      drawAtomCollection();

      // update the image
      this.image = this.toImage((image, x, y) => {
        this.image = image;
      });
    });
  }
}
rutherfordScattering.register('AtomCollectionNode', AtomCollectionNode);
export default AtomCollectionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaXJjbGUiLCJOb2RlIiwiUGF0aCIsIlJTQ29sb3JzIiwiUlNRdWVyeVBhcmFtZXRlcnMiLCJQYXJ0aWNsZU5vZGVGYWN0b3J5IiwicnV0aGVyZm9yZFNjYXR0ZXJpbmciLCJJT05JWkFUSU9OX0VORVJHWSIsIlJBRElVU19TQ0FMRSIsIkVORVJHWV9MRVZFTFMiLCJBdG9tQ29sbGVjdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsImF0b21TcGFjZSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJpbWFnZSIsImRyYXdBdG9tQ29sbGVjdGlvbiIsInJlbW92ZUFsbENoaWxkcmVuIiwiYXRvbXMiLCJmb3JFYWNoIiwiYXRvbSIsIm51Y2xldXNDaXJjbGUiLCJjcmVhdGVOdWNsZXVzIiwiY2VudGVyIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInBvc2l0aW9uIiwiYWRkQ2hpbGQiLCJnZXRTY2FsZWRSYWRpdXMiLCJpbmRleCIsInJhZGl1cyIsImkiLCJib2hyRW5lcmd5Iiwic2NhbGVkUmFkaXVzIiwic3Ryb2tlIiwibGluZURhc2giLCJzaG93RGVidWdTaGFwZXMiLCJib3VuZHNSZWN0YW5nbGUiLCJtb2RlbFRvVmlld1NoYXBlIiwiYm91bmRpbmdSZWN0IiwiYm91bmRpbmdDaXJjbGUiLCJudWNsZXVzQ29sb3JQcm9wZXJ0eSIsImxpbmsiLCJ0b0ltYWdlIiwieCIsInkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkF0b21Db2xsZWN0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaXN1YWwgcmVwcmVzZW50YXRpb24gb2YgYSBjb2xsZWN0aW9uIG9mIHJ1dGhlcmZvcmQgYXRvbXMuIFRoaXMgZHJhd3MgdGhlIGFjdHVhbCBudWNsZWkgYW5kIGVsZWN0cm9uIHNoZWxscyBpbiB0aGVcclxuICogXCJBdG9tXCIgc2NlbmUgb2YgdGhlIFwiUnV0aGVyZm9yZCBBdG9tXCIgc2NyZWVuLiBUaGUgZWxlY3Ryb24gZW5lcmd5IGxldmVscyBhcmUgcmVwcmVzZW50ZWQgYnkgZGFzaGVkXHJcbiAqIGNpcmNsZXMgc2NhbGVkIGJ5IHRoZSBCb2hyIGVuZXJneSBmb3IgZWFjaCBsZXZlbC5cclxuICpcclxuICogQGF1dGhvciBEYXZlIFNjaG1pdHogKFNjaG1pdHp3YXJlKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSU0NvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vUlNDb2xvcnMuanMnO1xyXG5pbXBvcnQgUlNRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL1JTUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlTm9kZUZhY3RvcnkgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUGFydGljbGVOb2RlRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBydXRoZXJmb3JkU2NhdHRlcmluZyBmcm9tICcuLi8uLi9ydXRoZXJmb3JkU2NhdHRlcmluZy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSU9OSVpBVElPTl9FTkVSR1kgPSAxMy42OyAvLyBlbmVyZ3kgcmVxdWlyZWQgdG8gaW9uaXplIGh5ZHJvZ2VuLCBpbiBlVlxyXG5jb25zdCBSQURJVVNfU0NBTEUgPSA1Ljk1OyAvLyBzY2FsZSB0byBtYWtlIHRoZSByYWRpaSB2aXNpYmxlIGluIHRoZSBzcGFjZSwgY2hvc2VuIGVtcGlyaWNhbGx5XHJcbmNvbnN0IEVORVJHWV9MRVZFTFMgPSA2OyAvLyBudW1iZXIgb2YgZW5lcmd5IGxldmVscy9yYWRpaSB0byBzaG93IGZvciB0aGUgYXRvbVxyXG5cclxuY2xhc3MgQXRvbUNvbGxlY3Rpb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UnV0aGVyZm9yZEF0b21TcGFjZX0gYXRvbVNwYWNlIC0gQXRvbVNwYWNlIGNvbnRhaW5pbmcgdGhlIGF0b21zXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGF0b21TcGFjZSwgbW9kZWxWaWV3VHJhbnNmb3JtLCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVsbHxIVE1MSW1hZ2VFbGVtZW50fSAtIFRoaXMgbm9kZSB3aWxsIGV2ZW50dWFsbHkgYmUgZHJhd24gd2l0aCBjYW52YXMgd2l0aFxyXG4gICAgLy8gY29udGV4dC5kcmF3SW1hZ2UuIFRoZSBpbWFnZSBpcyBjcmVhdGVkIGFzeW5jaHJvbm91c2x5IGluIHRoaXMgY29uc3RydWN0b3IuXHJcbiAgICB0aGlzLmltYWdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBkcmF3IGVhY2ggYXRvbSBpbiB0aGUgc3BhY2UgLSBjYWxsZWQgZXZlcnkgdGltZSB0aGUgY29sb3IgcHJvZmlsZSBjaGFuZ2VzXHJcbiAgICBjb25zdCBkcmF3QXRvbUNvbGxlY3Rpb24gPSAoKSA9PiB7XHJcblxyXG4gICAgICAvLyByZW1vdmUgdGhlIGFsbCBjaGlsZHJlblxyXG4gICAgICB0aGlzLnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgIGF0b21TcGFjZS5hdG9tcy5mb3JFYWNoKCBhdG9tID0+IHtcclxuXHJcbiAgICAgICAgLy8gYSBzbWFsbCBjaXJjbGUgcmVwcmVzZW50cyBlYWNoIG51Y2xldXNcclxuICAgICAgICBjb25zdCBudWNsZXVzQ2lyY2xlID0gUGFydGljbGVOb2RlRmFjdG9yeS5jcmVhdGVOdWNsZXVzKCk7XHJcbiAgICAgICAgbnVjbGV1c0NpcmNsZS5jZW50ZXIgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggYXRvbS5wb3NpdGlvbiApO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIG51Y2xldXNDaXJjbGUgKTtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIHRoZSByYWRpaSAtIGNvbmNlbnRyaWMgY2lyY2xlcyB3aXRoIGRhc2hlZCBsaW5lcyBzcGFjZWQgcHJvcG9ydGlvbmFsbHkgdG8gdGhlIEJvaHJcclxuICAgICAgICAvLyBlbmVyZ2llc1xyXG4gICAgICAgIGNvbnN0IGdldFNjYWxlZFJhZGl1cyA9IGluZGV4ID0+IHtcclxuICAgICAgICAgIGxldCByYWRpdXMgPSAwO1xyXG5cclxuICAgICAgICAgIC8vIHN1bSB0aGUgQm9ociBlbmVyZ2llcyB1cCB0byB0aGlzIGluZGV4XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPD0gaW5kZXg7IGkrKyApIHtcclxuICAgICAgICAgICAgY29uc3QgYm9ockVuZXJneSA9IElPTklaQVRJT05fRU5FUkdZIC8gKCBpICogaSApO1xyXG4gICAgICAgICAgICByYWRpdXMgKz0gYm9ockVuZXJneTsgLy8gcmFkaXVzIHdpbGwgYmUgc2NhbGVkIGJ5IHRoaXMgc3VtXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gcmFkaXVzICogUkFESVVTX1NDQUxFO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIGRyYXcgdGhlIHJhZGlpXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSBFTkVSR1lfTEVWRUxTOyBpID4gMDsgaS0tICkge1xyXG4gICAgICAgICAgY29uc3Qgc2NhbGVkUmFkaXVzID0gZ2V0U2NhbGVkUmFkaXVzKCBpICk7XHJcbiAgICAgICAgICBjb25zdCByYWRpdXMgPSBuZXcgQ2lyY2xlKCBzY2FsZWRSYWRpdXMsIHsgc3Ryb2tlOiAnZ3JleScsIGxpbmVEYXNoOiBbIDUsIDUgXSwgY2VudGVyOiBudWNsZXVzQ2lyY2xlLmNlbnRlciB9ICk7XHJcbiAgICAgICAgICB0aGlzLmFkZENoaWxkKCByYWRpdXMgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGRyYXcgdGhlIGJvdW5kcyBvZiBlYWNoIG51Y2xldXNcclxuICAgICAgICBpZiAoIFJTUXVlcnlQYXJhbWV0ZXJzLnNob3dEZWJ1Z1NoYXBlcyApIHtcclxuICAgICAgICAgIGNvbnN0IGJvdW5kc1JlY3RhbmdsZSA9IG5ldyBQYXRoKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggYXRvbS5ib3VuZGluZ1JlY3QgKSwgeyBzdHJva2U6ICdyZWQnIH0gKTtcclxuICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoIGJvdW5kc1JlY3RhbmdsZSApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGJvdW5kaW5nQ2lyY2xlID0gbmV3IFBhdGgoIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1NoYXBlKCBhdG9tLmJvdW5kaW5nQ2lyY2xlICksIHsgc3Ryb2tlOiAncmVkJyB9ICk7XHJcbiAgICAgICAgICB0aGlzLmFkZENoaWxkKCBib3VuZGluZ0NpcmNsZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBEcmF3IHRvIGltYWdlIHdoZW5ldmVyIHRoZSBjb2xvciBjaGFuZ2VzIHNvIHRoaXMgY2FuIGJlIGRyYXduIHRvIGEgQ2FudmFzTm9kZS4gVGhlIG9ubHkgY29sb3IgdGhhdCBjaGFuZ2VzIGlzXHJcbiAgICAvLyBudWNsZXVzQ29sb3JQcm9wZXJ0eSAodXNlZCBpbiBQYXJ0aWNsZU5vZGVGYWN0b3J5LmNyZWF0ZU51Y2xldXMoKSkgYW5kIHdlIGxpbmsgZGlyZWN0bHkgdG8gdGhhdCBjb2xvciByYXRoZXJcclxuICAgIC8vIHRoYW4gcHJvZmlsZU5hbWVQcm9wZXJ0eSBzbyB0aGF0IHdlIHJlZHJhdyB0aGUgaW1hZ2UgaWYgdGhhdCBjb2xvciBjaGFuZ2VzIGZyb21cclxuICAgIC8vIHJ1dGhlcmZvcmQtc2NhdHRlcmluZy1jb2xvcnMuaG10bC4gTm8gbmVlZCB0byB1bmxpbmssIHRoaXMgaW5zdGFuY2UgZXhpc3RzIGZvciBsaWZlIG9mIHNpbVxyXG4gICAgUlNDb2xvcnMubnVjbGV1c0NvbG9yUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBkcmF3QXRvbUNvbGxlY3Rpb24oKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgaW1hZ2VcclxuICAgICAgdGhpcy5pbWFnZSA9IHRoaXMudG9JbWFnZSggKCBpbWFnZSwgeCwgeSApID0+IHtcclxuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnJ1dGhlcmZvcmRTY2F0dGVyaW5nLnJlZ2lzdGVyKCAnQXRvbUNvbGxlY3Rpb25Ob2RlJywgQXRvbUNvbGxlY3Rpb25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEF0b21Db2xsZWN0aW9uTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDdEUsT0FBT0MsUUFBUSxNQUFNLDBCQUEwQjtBQUMvQyxPQUFPQyxpQkFBaUIsTUFBTSxtQ0FBbUM7QUFDakUsT0FBT0MsbUJBQW1CLE1BQU0sMENBQTBDO0FBQzFFLE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjs7QUFFaEU7QUFDQSxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNoQyxNQUFNQyxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDM0IsTUFBTUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUV6QixNQUFNQyxrQkFBa0IsU0FBU1QsSUFBSSxDQUFDO0VBRXBDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsV0FBV0EsQ0FBRUMsU0FBUyxFQUFF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