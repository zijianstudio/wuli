// Copyright 2014-2022, University of Colorado Boulder

/**
 * Hose
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
class Hose {
  /**
   * @param {number} height -- total vertical length of the hose
   * @param {number} angle rotated (in radians) by the spout, measured from a horizontal line. Initially this will be PI/2.
   */
  constructor(height, angle) {
    // Layout parameters for the Hose
    this.L1 = 6.3; // length of the horizontal portion of the hose from the tank hole
    this.H2 = 2.1; // length of the vertical/horizontal portion of the hose attached to the spout and nozzle (not including spout/nozzle)
    this.width = 1.5; // diameter of the hose
    this.hoseLengthX = 17.5; //the total width of the hose node

    this.elbowOuterX = 0; //position of the elbow in model co-ordinates
    this.elbowOuterY = 0;
    this.initialPosition = new Vector2(17, 22.8);
    this.angleWithVertical = Math.PI / 2 - angle;
    this.H3 = 3.5; // spout height

    // @public
    this.angleProperty = new Property(angle);

    // @public height increases downwards, decreases when the hose goes up. It will be negative when the hose is above the hole
    this.heightProperty = new Property(height);

    // @public emitted when the update function is called.
    this.updatedEmitter = new Emitter();
    this.update();
    Multilink.multilink([this.heightProperty, this.angleProperty], () => {
      this.update();
    });
  }

  /**
   * @private
   * Updates hose dependant variables
   */
  update() {
    const angle = this.angleProperty.get();
    this.angleWithVertical = Math.PI / 2 - angle;
    this.rotationPivotX = this.hoseLengthX;
    this.rotationPivotY = -this.heightProperty.value + this.H2;
    this.nozzleAttachmentOuterX = this.rotationPivotX - this.H3 * Math.cos(angle) + this.width / 2 * Math.sin(angle);
    this.nozzleAttachmentOuterY = this.rotationPivotY - this.H3 * Math.sin(angle) - this.width / 2 * Math.cos(angle);
    this.elbowOuterX = this.nozzleAttachmentOuterX - this.H2 * Math.cos(angle);
    this.elbowOuterY = this.nozzleAttachmentOuterY - this.H2 * Math.sin(angle);
    this.nozzleAttachmentInnerX = this.nozzleAttachmentOuterX - this.width * Math.sin(angle);
    this.nozzleAttachmentInnerY = this.nozzleAttachmentOuterY + this.width * Math.cos(angle);
    this.elbowInnerX = this.nozzleAttachmentInnerX - this.H2 * Math.cos(angle);
    this.elbowInnerY = this.nozzleAttachmentInnerY - this.H2 * Math.sin(angle);
    this.elbowLowerX = this.elbowOuterX - this.width * Math.sin(angle);
    this.elbowLowerY = this.elbowOuterY - (this.width - this.width * Math.cos(angle));
    this.updatedEmitter.emit();
  }

  /**
   * @public
   * reset the public model properties
   */
  reset() {
    this.angleProperty.reset();
    this.heightProperty.reset();
  }
}
fluidPressureAndFlow.register('Hose', Hose);
export default Hose;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiUHJvcGVydHkiLCJWZWN0b3IyIiwiZmx1aWRQcmVzc3VyZUFuZEZsb3ciLCJIb3NlIiwiY29uc3RydWN0b3IiLCJoZWlnaHQiLCJhbmdsZSIsIkwxIiwiSDIiLCJ3aWR0aCIsImhvc2VMZW5ndGhYIiwiZWxib3dPdXRlclgiLCJlbGJvd091dGVyWSIsImluaXRpYWxQb3NpdGlvbiIsImFuZ2xlV2l0aFZlcnRpY2FsIiwiTWF0aCIsIlBJIiwiSDMiLCJhbmdsZVByb3BlcnR5IiwiaGVpZ2h0UHJvcGVydHkiLCJ1cGRhdGVkRW1pdHRlciIsInVwZGF0ZSIsIm11bHRpbGluayIsImdldCIsInJvdGF0aW9uUGl2b3RYIiwicm90YXRpb25QaXZvdFkiLCJ2YWx1ZSIsIm5venpsZUF0dGFjaG1lbnRPdXRlclgiLCJjb3MiLCJzaW4iLCJub3p6bGVBdHRhY2htZW50T3V0ZXJZIiwibm96emxlQXR0YWNobWVudElubmVyWCIsIm5venpsZUF0dGFjaG1lbnRJbm5lclkiLCJlbGJvd0lubmVyWCIsImVsYm93SW5uZXJZIiwiZWxib3dMb3dlclgiLCJlbGJvd0xvd2VyWSIsImVtaXQiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSG9zZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIb3NlXHJcbiAqXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBmbHVpZFByZXNzdXJlQW5kRmxvdyBmcm9tICcuLi8uLi9mbHVpZFByZXNzdXJlQW5kRmxvdy5qcyc7XHJcblxyXG5jbGFzcyBIb3NlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtLSB0b3RhbCB2ZXJ0aWNhbCBsZW5ndGggb2YgdGhlIGhvc2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgcm90YXRlZCAoaW4gcmFkaWFucykgYnkgdGhlIHNwb3V0LCBtZWFzdXJlZCBmcm9tIGEgaG9yaXpvbnRhbCBsaW5lLiBJbml0aWFsbHkgdGhpcyB3aWxsIGJlIFBJLzIuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGhlaWdodCwgYW5nbGUgKSB7XHJcblxyXG4gICAgLy8gTGF5b3V0IHBhcmFtZXRlcnMgZm9yIHRoZSBIb3NlXHJcbiAgICB0aGlzLkwxID0gNi4zOyAvLyBsZW5ndGggb2YgdGhlIGhvcml6b250YWwgcG9ydGlvbiBvZiB0aGUgaG9zZSBmcm9tIHRoZSB0YW5rIGhvbGVcclxuICAgIHRoaXMuSDIgPSAyLjE7IC8vIGxlbmd0aCBvZiB0aGUgdmVydGljYWwvaG9yaXpvbnRhbCBwb3J0aW9uIG9mIHRoZSBob3NlIGF0dGFjaGVkIHRvIHRoZSBzcG91dCBhbmQgbm96emxlIChub3QgaW5jbHVkaW5nIHNwb3V0L25venpsZSlcclxuICAgIHRoaXMud2lkdGggPSAxLjU7IC8vIGRpYW1ldGVyIG9mIHRoZSBob3NlXHJcbiAgICB0aGlzLmhvc2VMZW5ndGhYID0gMTcuNTsgLy90aGUgdG90YWwgd2lkdGggb2YgdGhlIGhvc2Ugbm9kZVxyXG5cclxuICAgIHRoaXMuZWxib3dPdXRlclggPSAwOyAvL3Bvc2l0aW9uIG9mIHRoZSBlbGJvdyBpbiBtb2RlbCBjby1vcmRpbmF0ZXNcclxuICAgIHRoaXMuZWxib3dPdXRlclkgPSAwO1xyXG4gICAgdGhpcy5pbml0aWFsUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggMTcsIDIyLjggKTtcclxuICAgIHRoaXMuYW5nbGVXaXRoVmVydGljYWwgPSBNYXRoLlBJIC8gMiAtIGFuZ2xlO1xyXG5cclxuICAgIHRoaXMuSDMgPSAzLjU7IC8vIHNwb3V0IGhlaWdodFxyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggYW5nbGUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIGhlaWdodCBpbmNyZWFzZXMgZG93bndhcmRzLCBkZWNyZWFzZXMgd2hlbiB0aGUgaG9zZSBnb2VzIHVwLiBJdCB3aWxsIGJlIG5lZ2F0aXZlIHdoZW4gdGhlIGhvc2UgaXMgYWJvdmUgdGhlIGhvbGVcclxuICAgIHRoaXMuaGVpZ2h0UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGhlaWdodCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgZW1pdHRlZCB3aGVuIHRoZSB1cGRhdGUgZnVuY3Rpb24gaXMgY2FsbGVkLlxyXG4gICAgdGhpcy51cGRhdGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHRoaXMuaGVpZ2h0UHJvcGVydHksIHRoaXMuYW5nbGVQcm9wZXJ0eSBdLCAoKSA9PiB7IHRoaXMudXBkYXRlKCk7IH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogVXBkYXRlcyBob3NlIGRlcGVuZGFudCB2YXJpYWJsZXNcclxuICAgKi9cclxuICB1cGRhdGUoKSB7XHJcblxyXG4gICAgY29uc3QgYW5nbGUgPSB0aGlzLmFuZ2xlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgdGhpcy5hbmdsZVdpdGhWZXJ0aWNhbCA9IE1hdGguUEkgLyAyIC0gYW5nbGU7XHJcbiAgICB0aGlzLnJvdGF0aW9uUGl2b3RYID0gdGhpcy5ob3NlTGVuZ3RoWDtcclxuICAgIHRoaXMucm90YXRpb25QaXZvdFkgPSAtdGhpcy5oZWlnaHRQcm9wZXJ0eS52YWx1ZSArIHRoaXMuSDI7XHJcbiAgICB0aGlzLm5venpsZUF0dGFjaG1lbnRPdXRlclggPSB0aGlzLnJvdGF0aW9uUGl2b3RYIC0gdGhpcy5IMyAqIE1hdGguY29zKCBhbmdsZSApICsgdGhpcy53aWR0aCAvIDIgKiBNYXRoLnNpbiggYW5nbGUgKTtcclxuICAgIHRoaXMubm96emxlQXR0YWNobWVudE91dGVyWSA9IHRoaXMucm90YXRpb25QaXZvdFkgLSB0aGlzLkgzICogTWF0aC5zaW4oIGFuZ2xlICkgLSB0aGlzLndpZHRoIC8gMiAqIE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgdGhpcy5lbGJvd091dGVyWCA9IHRoaXMubm96emxlQXR0YWNobWVudE91dGVyWCAtIHRoaXMuSDIgKiBNYXRoLmNvcyggYW5nbGUgKTtcclxuICAgIHRoaXMuZWxib3dPdXRlclkgPSB0aGlzLm5venpsZUF0dGFjaG1lbnRPdXRlclkgLSB0aGlzLkgyICogTWF0aC5zaW4oIGFuZ2xlICk7XHJcbiAgICB0aGlzLm5venpsZUF0dGFjaG1lbnRJbm5lclggPSB0aGlzLm5venpsZUF0dGFjaG1lbnRPdXRlclggLSB0aGlzLndpZHRoICogTWF0aC5zaW4oIGFuZ2xlICk7XHJcbiAgICB0aGlzLm5venpsZUF0dGFjaG1lbnRJbm5lclkgPSB0aGlzLm5venpsZUF0dGFjaG1lbnRPdXRlclkgKyB0aGlzLndpZHRoICogTWF0aC5jb3MoIGFuZ2xlICk7XHJcbiAgICB0aGlzLmVsYm93SW5uZXJYID0gdGhpcy5ub3p6bGVBdHRhY2htZW50SW5uZXJYIC0gdGhpcy5IMiAqIE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgdGhpcy5lbGJvd0lubmVyWSA9IHRoaXMubm96emxlQXR0YWNobWVudElubmVyWSAtIHRoaXMuSDIgKiBNYXRoLnNpbiggYW5nbGUgKTtcclxuICAgIHRoaXMuZWxib3dMb3dlclggPSB0aGlzLmVsYm93T3V0ZXJYIC0gdGhpcy53aWR0aCAqIE1hdGguc2luKCBhbmdsZSApO1xyXG4gICAgdGhpcy5lbGJvd0xvd2VyWSA9IHRoaXMuZWxib3dPdXRlclkgLSAoIHRoaXMud2lkdGggLSB0aGlzLndpZHRoICogTWF0aC5jb3MoIGFuZ2xlICkgKTtcclxuICAgIHRoaXMudXBkYXRlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIHJlc2V0IHRoZSBwdWJsaWMgbW9kZWwgcHJvcGVydGllc1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5hbmdsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmhlaWdodFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ0hvc2UnLCBIb3NlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEhvc2U7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBRWhFLE1BQU1DLElBQUksQ0FBQztFQUVUO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLE1BQU0sRUFBRUMsS0FBSyxFQUFHO0lBRTNCO0lBQ0EsSUFBSSxDQUFDQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDZixJQUFJLENBQUNDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksQ0FBQ0MsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDOztJ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