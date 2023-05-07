// Copyright 2021-2022, University of Colorado Boulder

/**
 * Demonstrates using PhET Enumerations
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import wilder from '../../wilder.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
class WilderEnumerationPatterns {
  constructor(providedOptions) {
    /************************************************************************
     * The primary enumeration pattern.
     */
    class MammalType extends EnumerationValue {
      static PUPPY = new MammalType();
      static KITTY = new MammalType();

      // Gets a list of keys, values and mapping between them.  For use in EnumerationProperty and PhET-iO
      static enumeration = new Enumeration(MammalType, {
        phetioDocumentation: 'Describes the type of the mammal.'
      });
      sayHello() {
        console.log('hello');
      }
    }
    const mammalTypeProperty = new EnumerationProperty(MammalType.KITTY, {
      tandem: providedOptions.tandem.createTandem('mammalTypeProperty')
    });
    mammalTypeProperty.link(x => x.sayHello());
    mammalTypeProperty.value = MammalType.KITTY;
    console.log(MammalType.KITTY.name);

    // p3.value = MammalType.WRONG; // type error
    // p3.value = 'left';  // type error

    /************************************************************************
     * Example: Augmenting an enumeration.
     * Use this only when you need to create a new enumeration that takes all the values of another enumeration and adds
     * more values. This should be rarely used.
     */
    class TreeType extends EnumerationValue {
      static ASH = new TreeType();
      static BIRCH = new TreeType();
      static enumeration = new Enumeration(TreeType);
    }
    class SpecialTreeType extends TreeType {
      static CEDAR = new SpecialTreeType();
      static enumeration = new Enumeration(SpecialTreeType, {
        // Match any static member of SpecialTreeType that is instanceof TreeType, so it will include the existing ASH, BIRCH and also the new value CEDAR
        instanceType: TreeType
      });
    }
    console.log(SpecialTreeType.enumeration.values); // Prints ASH, BIRCH, CEDAR

    /************************************************************************
     * String union type.
     * Use this when you need a type, but not values or phet-io support. You may see this more in legacy code,
     * or in APIs where it is preferable for options or parameters to be plain strings.
     * For example: new HBox( { align:'top' } );
     */
    // export default PetChoice;
    // sample usage
    const x = 'DOG';
    // const y: PetChoice = 'PARROT'; // Error
    console.log(x);
    const favoritePet = choice => {
      console.log('my favorite pet is:', choice);
    };
    favoritePet('CAT');

    /************************************************************************
     * Union type WITH runtime values.
     * Typically it will be preferable to use "The primary enumeration pattern." from above, but
     * special cases may require string union with runtime values.
     * Filename = AnimalChoice.ts
     */

    const AnimalChoiceValues = ['PANDA', 'TIGER']; // The values

    // Type

    // Then...
    // register the AnimalChoiceValues with the namespace
    // export { AnimalChoiceValues };
    // export default AnimalChoice;
    console.log(AnimalChoiceValues); // ['PANDA','TIGER']
    const testFunction = a => {
      console.log('hello: ' + a);
    };
    testFunction('PANDA');
  }
}
wilder.register('WilderEnumerationPatterns', WilderEnumerationPatterns);
export default WilderEnumerationPatterns;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3aWxkZXIiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwiV2lsZGVyRW51bWVyYXRpb25QYXR0ZXJucyIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiTWFtbWFsVHlwZSIsIlBVUFBZIiwiS0lUVFkiLCJlbnVtZXJhdGlvbiIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJzYXlIZWxsbyIsImNvbnNvbGUiLCJsb2ciLCJtYW1tYWxUeXBlUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJsaW5rIiwieCIsInZhbHVlIiwibmFtZSIsIlRyZWVUeXBlIiwiQVNIIiwiQklSQ0giLCJTcGVjaWFsVHJlZVR5cGUiLCJDRURBUiIsImluc3RhbmNlVHlwZSIsInZhbHVlcyIsImZhdm9yaXRlUGV0IiwiY2hvaWNlIiwiQW5pbWFsQ2hvaWNlVmFsdWVzIiwidGVzdEZ1bmN0aW9uIiwiYSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2lsZGVyRW51bWVyYXRpb25QYXR0ZXJucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vbnN0cmF0ZXMgdXNpbmcgUGhFVCBFbnVtZXJhdGlvbnNcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB3aWxkZXIgZnJvbSAnLi4vLi4vd2lsZGVyLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuXHJcbnR5cGUgV2lsZGVyRW51bWVyYXRpb25QYXR0ZXJuc09wdGlvbnMgPSB7XHJcbiAgdGFuZGVtOiBUYW5kZW07XHJcbn07XHJcblxyXG5jbGFzcyBXaWxkZXJFbnVtZXJhdGlvblBhdHRlcm5zIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogV2lsZGVyRW51bWVyYXRpb25QYXR0ZXJuc09wdGlvbnMgKSB7XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogVGhlIHByaW1hcnkgZW51bWVyYXRpb24gcGF0dGVybi5cclxuICAgICAqL1xyXG4gICAgY2xhc3MgTWFtbWFsVHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gICAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBVUFBZID0gbmV3IE1hbW1hbFR5cGUoKTtcclxuICAgICAgcHVibGljIHN0YXRpYyByZWFkb25seSBLSVRUWSA9IG5ldyBNYW1tYWxUeXBlKCk7XHJcblxyXG4gICAgICAvLyBHZXRzIGEgbGlzdCBvZiBrZXlzLCB2YWx1ZXMgYW5kIG1hcHBpbmcgYmV0d2VlbiB0aGVtLiAgRm9yIHVzZSBpbiBFbnVtZXJhdGlvblByb3BlcnR5IGFuZCBQaEVULWlPXHJcbiAgICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIE1hbW1hbFR5cGUsIHtcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRGVzY3JpYmVzIHRoZSB0eXBlIG9mIHRoZSBtYW1tYWwuJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBwdWJsaWMgc2F5SGVsbG8oKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coICdoZWxsbycgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1hbW1hbFR5cGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBNYW1tYWxUeXBlLktJVFRZLCB7XHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYW1tYWxUeXBlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIG1hbW1hbFR5cGVQcm9wZXJ0eS5saW5rKCB4ID0+IHguc2F5SGVsbG8oKSApO1xyXG4gICAgbWFtbWFsVHlwZVByb3BlcnR5LnZhbHVlID0gTWFtbWFsVHlwZS5LSVRUWTtcclxuICAgIGNvbnNvbGUubG9nKCBNYW1tYWxUeXBlLktJVFRZLm5hbWUgKTtcclxuXHJcbiAgICAvLyBwMy52YWx1ZSA9IE1hbW1hbFR5cGUuV1JPTkc7IC8vIHR5cGUgZXJyb3JcclxuICAgIC8vIHAzLnZhbHVlID0gJ2xlZnQnOyAgLy8gdHlwZSBlcnJvclxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIEV4YW1wbGU6IEF1Z21lbnRpbmcgYW4gZW51bWVyYXRpb24uXHJcbiAgICAgKiBVc2UgdGhpcyBvbmx5IHdoZW4geW91IG5lZWQgdG8gY3JlYXRlIGEgbmV3IGVudW1lcmF0aW9uIHRoYXQgdGFrZXMgYWxsIHRoZSB2YWx1ZXMgb2YgYW5vdGhlciBlbnVtZXJhdGlvbiBhbmQgYWRkc1xyXG4gICAgICogbW9yZSB2YWx1ZXMuIFRoaXMgc2hvdWxkIGJlIHJhcmVseSB1c2VkLlxyXG4gICAgICovXHJcbiAgICBjbGFzcyBUcmVlVHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gICAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFTSCA9IG5ldyBUcmVlVHlwZSgpO1xyXG4gICAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJJUkNIID0gbmV3IFRyZWVUeXBlKCk7XHJcblxyXG4gICAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBUcmVlVHlwZSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYXNzIFNwZWNpYWxUcmVlVHlwZSBleHRlbmRzIFRyZWVUeXBlIHtcclxuICAgICAgcHVibGljIHN0YXRpYyByZWFkb25seSBDRURBUiA9IG5ldyBTcGVjaWFsVHJlZVR5cGUoKTtcclxuXHJcbiAgICAgIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIFNwZWNpYWxUcmVlVHlwZSwge1xyXG5cclxuICAgICAgICAvLyBNYXRjaCBhbnkgc3RhdGljIG1lbWJlciBvZiBTcGVjaWFsVHJlZVR5cGUgdGhhdCBpcyBpbnN0YW5jZW9mIFRyZWVUeXBlLCBzbyBpdCB3aWxsIGluY2x1ZGUgdGhlIGV4aXN0aW5nIEFTSCwgQklSQ0ggYW5kIGFsc28gdGhlIG5ldyB2YWx1ZSBDRURBUlxyXG4gICAgICAgIGluc3RhbmNlVHlwZTogVHJlZVR5cGVcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKCBTcGVjaWFsVHJlZVR5cGUuZW51bWVyYXRpb24udmFsdWVzICk7IC8vIFByaW50cyBBU0gsIEJJUkNILCBDRURBUlxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIFN0cmluZyB1bmlvbiB0eXBlLlxyXG4gICAgICogVXNlIHRoaXMgd2hlbiB5b3UgbmVlZCBhIHR5cGUsIGJ1dCBub3QgdmFsdWVzIG9yIHBoZXQtaW8gc3VwcG9ydC4gWW91IG1heSBzZWUgdGhpcyBtb3JlIGluIGxlZ2FjeSBjb2RlLFxyXG4gICAgICogb3IgaW4gQVBJcyB3aGVyZSBpdCBpcyBwcmVmZXJhYmxlIGZvciBvcHRpb25zIG9yIHBhcmFtZXRlcnMgdG8gYmUgcGxhaW4gc3RyaW5ncy5cclxuICAgICAqIEZvciBleGFtcGxlOiBuZXcgSEJveCggeyBhbGlnbjondG9wJyB9ICk7XHJcbiAgICAgKi9cclxuXHJcbiAgICB0eXBlIFBldENob2ljZSA9ICdET0cnIHwgJ0NBVCc7XHJcbiAgICAvLyBleHBvcnQgZGVmYXVsdCBQZXRDaG9pY2U7XHJcblxyXG4gICAgLy8gc2FtcGxlIHVzYWdlXHJcbiAgICBjb25zdCB4OiBQZXRDaG9pY2UgPSAnRE9HJztcclxuICAgIC8vIGNvbnN0IHk6IFBldENob2ljZSA9ICdQQVJST1QnOyAvLyBFcnJvclxyXG4gICAgY29uc29sZS5sb2coIHggKTtcclxuICAgIGNvbnN0IGZhdm9yaXRlUGV0ID0gKCBjaG9pY2U6IFBldENob2ljZSApID0+IHtcclxuICAgICAgY29uc29sZS5sb2coICdteSBmYXZvcml0ZSBwZXQgaXM6JywgY2hvaWNlICk7XHJcbiAgICB9O1xyXG4gICAgZmF2b3JpdGVQZXQoICdDQVQnICk7XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogVW5pb24gdHlwZSBXSVRIIHJ1bnRpbWUgdmFsdWVzLlxyXG4gICAgICogVHlwaWNhbGx5IGl0IHdpbGwgYmUgcHJlZmVyYWJsZSB0byB1c2UgXCJUaGUgcHJpbWFyeSBlbnVtZXJhdGlvbiBwYXR0ZXJuLlwiIGZyb20gYWJvdmUsIGJ1dFxyXG4gICAgICogc3BlY2lhbCBjYXNlcyBtYXkgcmVxdWlyZSBzdHJpbmcgdW5pb24gd2l0aCBydW50aW1lIHZhbHVlcy5cclxuICAgICAqIEZpbGVuYW1lID0gQW5pbWFsQ2hvaWNlLnRzXHJcbiAgICAgKi9cclxuXHJcbiAgICBjb25zdCBBbmltYWxDaG9pY2VWYWx1ZXMgPSBbICdQQU5EQScsICdUSUdFUicgXSBhcyBjb25zdDsgLy8gVGhlIHZhbHVlc1xyXG4gICAgdHlwZSBBbmltYWxDaG9pY2UgPSB0eXBlb2YgQW5pbWFsQ2hvaWNlVmFsdWVzW251bWJlcl07IC8vIFR5cGVcclxuXHJcbiAgICAvLyBUaGVuLi4uXHJcbiAgICAvLyByZWdpc3RlciB0aGUgQW5pbWFsQ2hvaWNlVmFsdWVzIHdpdGggdGhlIG5hbWVzcGFjZVxyXG4gICAgLy8gZXhwb3J0IHsgQW5pbWFsQ2hvaWNlVmFsdWVzIH07XHJcbiAgICAvLyBleHBvcnQgZGVmYXVsdCBBbmltYWxDaG9pY2U7XHJcblxyXG4gICAgY29uc29sZS5sb2coIEFuaW1hbENob2ljZVZhbHVlcyApOy8vIFsnUEFOREEnLCdUSUdFUiddXHJcbiAgICBjb25zdCB0ZXN0RnVuY3Rpb24gPSAoIGE6IEFuaW1hbENob2ljZSApID0+IHtcclxuICAgICAgY29uc29sZS5sb2coICdoZWxsbzogJyArIGEgKTtcclxuICAgIH07XHJcbiAgICB0ZXN0RnVuY3Rpb24oICdQQU5EQScgKTtcclxuICB9XHJcbn1cclxuXHJcbndpbGRlci5yZWdpc3RlciggJ1dpbGRlckVudW1lcmF0aW9uUGF0dGVybnMnLCBXaWxkZXJFbnVtZXJhdGlvblBhdHRlcm5zICk7XHJcbmV4cG9ydCBkZWZhdWx0IFdpbGRlckVudW1lcmF0aW9uUGF0dGVybnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGlCQUFpQjtBQUNwQyxPQUFPQyxtQkFBbUIsTUFBTSw0Q0FBNEM7QUFFNUUsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFNM0UsTUFBTUMseUJBQXlCLENBQUM7RUFDdkJDLFdBQVdBLENBQUVDLGVBQWlELEVBQUc7SUFFdEU7QUFDSjtBQUNBO0lBQ0ksTUFBTUMsVUFBVSxTQUFTSixnQkFBZ0IsQ0FBQztNQUN4QyxPQUF1QkssS0FBSyxHQUFHLElBQUlELFVBQVUsQ0FBQyxDQUFDO01BQy9DLE9BQXVCRSxLQUFLLEdBQUcsSUFBSUYsVUFBVSxDQUFDLENBQUM7O01BRS9DO01BQ0EsT0FBdUJHLFdBQVcsR0FBRyxJQUFJUixXQUFXLENBQUVLLFVBQVUsRUFBRTtRQUNoRUksbUJBQW1CLEVBQUU7TUFDdkIsQ0FBRSxDQUFDO01BRUlDLFFBQVFBLENBQUEsRUFBUztRQUN0QkMsT0FBTyxDQUFDQyxHQUFHLENBQUUsT0FBUSxDQUFDO01BQ3hCO0lBQ0Y7SUFFQSxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJZCxtQkFBbUIsQ0FBRU0sVUFBVSxDQUFDRSxLQUFLLEVBQUU7TUFDcEVPLE1BQU0sRUFBRVYsZUFBZSxDQUFDVSxNQUFNLENBQUNDLFlBQVksQ0FBRSxvQkFBcUI7SUFDcEUsQ0FBRSxDQUFDO0lBQ0hGLGtCQUFrQixDQUFDRyxJQUFJLENBQUVDLENBQUMsSUFBSUEsQ0FBQyxDQUFDUCxRQUFRLENBQUMsQ0FBRSxDQUFDO0lBQzVDRyxrQkFBa0IsQ0FBQ0ssS0FBSyxHQUFHYixVQUFVLENBQUNFLEtBQUs7SUFDM0NJLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFUCxVQUFVLENBQUNFLEtBQUssQ0FBQ1ksSUFBSyxDQUFDOztJQUVwQztJQUNBOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7SUFDSSxNQUFNQyxRQUFRLFNBQVNuQixnQkFBZ0IsQ0FBQztNQUN0QyxPQUF1Qm9CLEdBQUcsR0FBRyxJQUFJRCxRQUFRLENBQUMsQ0FBQztNQUMzQyxPQUF1QkUsS0FBSyxHQUFHLElBQUlGLFFBQVEsQ0FBQyxDQUFDO01BRTdDLE9BQXVCWixXQUFXLEdBQUcsSUFBSVIsV0FBVyxDQUFFb0IsUUFBUyxDQUFDO0lBQ2xFO0lBRUEsTUFBTUcsZUFBZSxTQUFTSCxRQUFRLENBQUM7TUFDckMsT0FBdUJJLEtBQUssR0FBRyxJQUFJRCxlQUFlLENBQUMsQ0FBQztNQUVwRCxPQUFnQ2YsV0FBVyxHQUFHLElBQUlSLFdBQVcsQ0FBRXVCLGVBQWUsRUFBRTtRQUU5RTtRQUNBRSxZQUFZLEVBQUVMO01BQ2hCLENBQUUsQ0FBQztJQUNMO0lBRUFULE9BQU8sQ0FBQ0MsR0FBRyxDQUFFVyxlQUFlLENBQUNmLFdBQVcsQ0FBQ2tCLE1BQU8sQ0FBQyxDQUFDLENBQUM7O0lBRW5EO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUdJO0lBRUE7SUFDQSxNQUFNVCxDQUFZLEdBQUcsS0FBSztJQUMxQjtJQUNBTixPQUFPLENBQUNDLEdBQUcsQ0FBRUssQ0FBRSxDQUFDO0lBQ2hCLE1BQU1VLFdBQVcsR0FBS0MsTUFBaUIsSUFBTTtNQUMzQ2pCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLHFCQUFxQixFQUFFZ0IsTUFBTyxDQUFDO0lBQzlDLENBQUM7SUFDREQsV0FBVyxDQUFFLEtBQU0sQ0FBQzs7SUFFcEI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztJQUVJLE1BQU1FLGtCQUFrQixHQUFHLENBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBVyxDQUFDLENBQUM7O0lBQ0g7O0lBRXZEO0lBQ0E7SUFDQTtJQUNBO0lBRUFsQixPQUFPLENBQUNDLEdBQUcsQ0FBRWlCLGtCQUFtQixDQUFDLENBQUM7SUFDbEMsTUFBTUMsWUFBWSxHQUFLQyxDQUFlLElBQU07TUFDMUNwQixPQUFPLENBQUNDLEdBQUcsQ0FBRSxTQUFTLEdBQUdtQixDQUFFLENBQUM7SUFDOUIsQ0FBQztJQUNERCxZQUFZLENBQUUsT0FBUSxDQUFDO0VBQ3pCO0FBQ0Y7QUFFQWhDLE1BQU0sQ0FBQ2tDLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRTlCLHlCQUEwQixDQUFDO0FBQ3pFLGVBQWVBLHlCQUF5QiJ9