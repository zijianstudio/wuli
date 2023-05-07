// Copyright 2016-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import GravityForceLabKeyboardHelpContent from '../../gravity-force-lab/js/view/GravityForceLabKeyboardHelpContent.js';
import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import GFLBConstants from './GFLBConstants.js';
import GravityForceLabBasicsStrings from './GravityForceLabBasicsStrings.js';
import GFLBModel from './model/GFLBModel.js';
import GFLBScreenView from './view/GFLBScreenView.js';

// constants
const tandem = Tandem.ROOT;
const gravityForceLabBasicsTitleStringProperty = GravityForceLabBasicsStrings['gravity-force-lab-basics'].titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Amy Rouinfar',
    softwareDevelopment: 'Michael Barlow, John Blanco, Jesse Greenberg, Michael Kauzmann',
    team: 'Ariel Paul, Kathy Perkins, Emily B. Moore, Taliesin Smith, Brianna Tomlinson',
    qualityAssurance: 'Logan Bray, Steele Dalton, Megan Lai, Brooklyn Lash, Emily Miller, Liam Mulhall, Laura Rea, Jacob Romero, Nancy Salpepi, and Kathryn Woessner',
    graphicArts: 'Mariah Hermsmeyer',
    soundDesign: 'Ashton Morris',
    thanks: ''
  }
};
simLauncher.launch(() => {
  const gravityForceLabBasicsScreenTandem = tandem.createTandem('gravityForceLabBasicsScreen');
  const sim = new Sim(gravityForceLabBasicsTitleStringProperty, [new Screen(() => new GFLBModel(gravityForceLabBasicsScreenTandem.createTandem('model')), model => new GFLBScreenView(model, gravityForceLabBasicsScreenTandem.createTandem('view')), {
    backgroundColorProperty: GFLBConstants.BACKGROUND_COLOR_PROPERTY,
    tandem: gravityForceLabBasicsScreenTandem,
    createKeyboardHelpNode: () => new GravityForceLabKeyboardHelpContent({
      isBasics: true // in basics, there is no way to change the mass in smaller steps
    })
  })], simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHcmF2aXR5Rm9yY2VMYWJLZXlib2FyZEhlbHBDb250ZW50IiwiU2NyZWVuIiwiU2ltIiwic2ltTGF1bmNoZXIiLCJUYW5kZW0iLCJHRkxCQ29uc3RhbnRzIiwiR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5ncyIsIkdGTEJNb2RlbCIsIkdGTEJTY3JlZW5WaWV3IiwidGFuZGVtIiwiUk9PVCIsImdyYXZpdHlGb3JjZUxhYkJhc2ljc1RpdGxlU3RyaW5nUHJvcGVydHkiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5Iiwic2ltT3B0aW9ucyIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJxdWFsaXR5QXNzdXJhbmNlIiwiZ3JhcGhpY0FydHMiLCJzb3VuZERlc2lnbiIsInRoYW5rcyIsImxhdW5jaCIsImdyYXZpdHlGb3JjZUxhYkJhc2ljc1NjcmVlblRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInNpbSIsIm1vZGVsIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJCQUNLR1JPVU5EX0NPTE9SX1BST1BFUlRZIiwiY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSIsImlzQmFzaWNzIiwic3RhcnQiXSwic291cmNlcyI6WyJncmF2aXR5LWZvcmNlLWxhYi1iYXNpY3MtbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciB0aGUgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBHcmF2aXR5Rm9yY2VMYWJLZXlib2FyZEhlbHBDb250ZW50IGZyb20gJy4uLy4uL2dyYXZpdHktZm9yY2UtbGFiL2pzL3ZpZXcvR3Jhdml0eUZvcmNlTGFiS2V5Ym9hcmRIZWxwQ29udGVudC5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgR0ZMQkNvbnN0YW50cyBmcm9tICcuL0dGTEJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5ncyBmcm9tICcuL0dyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgR0ZMQk1vZGVsIGZyb20gJy4vbW9kZWwvR0ZMQk1vZGVsLmpzJztcclxuaW1wb3J0IEdGTEJTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9HRkxCU2NyZWVuVmlldy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgdGFuZGVtID0gVGFuZGVtLlJPT1Q7XHJcblxyXG5jb25zdCBncmF2aXR5Rm9yY2VMYWJCYXNpY3NUaXRsZVN0cmluZ1Byb3BlcnR5ID0gR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5nc1sgJ2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcycgXS50aXRsZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3Qgc2ltT3B0aW9ucyA9IHtcclxuICBjcmVkaXRzOiB7XHJcbiAgICBsZWFkRGVzaWduOiAnQW15IFJvdWluZmFyJyxcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdNaWNoYWVsIEJhcmxvdywgSm9obiBCbGFuY28sIEplc3NlIEdyZWVuYmVyZywgTWljaGFlbCBLYXV6bWFubicsXHJcbiAgICB0ZWFtOiAnQXJpZWwgUGF1bCwgS2F0aHkgUGVya2lucywgRW1pbHkgQi4gTW9vcmUsIFRhbGllc2luIFNtaXRoLCBCcmlhbm5hIFRvbWxpbnNvbicsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOiAnTG9nYW4gQnJheSwgU3RlZWxlIERhbHRvbiwgTWVnYW4gTGFpLCBCcm9va2x5biBMYXNoLCBFbWlseSBNaWxsZXIsIExpYW0gTXVsaGFsbCwgTGF1cmEgUmVhLCBKYWNvYiBSb21lcm8sIE5hbmN5IFNhbHBlcGksIGFuZCBLYXRocnluIFdvZXNzbmVyJyxcclxuICAgIGdyYXBoaWNBcnRzOiAnTWFyaWFoIEhlcm1zbWV5ZXInLFxyXG4gICAgc291bmREZXNpZ246ICdBc2h0b24gTW9ycmlzJyxcclxuICAgIHRoYW5rczogJydcclxuICB9XHJcbn07XHJcblxyXG5zaW1MYXVuY2hlci5sYXVuY2goICgpID0+IHtcclxuXHJcbiAgY29uc3QgZ3Jhdml0eUZvcmNlTGFiQmFzaWNzU2NyZWVuVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXZpdHlGb3JjZUxhYkJhc2ljc1NjcmVlbicgKTtcclxuXHJcbiAgY29uc3Qgc2ltID0gbmV3IFNpbSggZ3Jhdml0eUZvcmNlTGFiQmFzaWNzVGl0bGVTdHJpbmdQcm9wZXJ0eSxcclxuICAgIFsgbmV3IFNjcmVlbihcclxuICAgICAgKCkgPT4gbmV3IEdGTEJNb2RlbCggZ3Jhdml0eUZvcmNlTGFiQmFzaWNzU2NyZWVuVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vZGVsJyApICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBHRkxCU2NyZWVuVmlldyggbW9kZWwsIGdyYXZpdHlGb3JjZUxhYkJhc2ljc1NjcmVlblRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApICksXHJcbiAgICAgIHtcclxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogR0ZMQkNvbnN0YW50cy5CQUNLR1JPVU5EX0NPTE9SX1BST1BFUlRZLFxyXG4gICAgICAgIHRhbmRlbTogZ3Jhdml0eUZvcmNlTGFiQmFzaWNzU2NyZWVuVGFuZGVtLFxyXG4gICAgICAgIGNyZWF0ZUtleWJvYXJkSGVscE5vZGU6ICgpID0+IG5ldyBHcmF2aXR5Rm9yY2VMYWJLZXlib2FyZEhlbHBDb250ZW50KCB7XHJcbiAgICAgICAgICBpc0Jhc2ljczogdHJ1ZSAvLyBpbiBiYXNpY3MsIHRoZXJlIGlzIG5vIHdheSB0byBjaGFuZ2UgdGhlIG1hc3MgaW4gc21hbGxlciBzdGVwc1xyXG4gICAgICAgIH0gKVxyXG4gICAgICB9XHJcbiAgICApXHJcbiAgICBdLCBzaW1PcHRpb25zICk7XHJcbiAgc2ltLnN0YXJ0KCk7XHJcblxyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGtDQUFrQyxNQUFNLHVFQUF1RTtBQUN0SCxPQUFPQyxNQUFNLE1BQU0sMEJBQTBCO0FBQzdDLE9BQU9DLEdBQUcsTUFBTSx1QkFBdUI7QUFDdkMsT0FBT0MsV0FBVyxNQUFNLCtCQUErQjtBQUN2RCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsNEJBQTRCLE1BQU0sbUNBQW1DO0FBQzVFLE9BQU9DLFNBQVMsTUFBTSxzQkFBc0I7QUFDNUMsT0FBT0MsY0FBYyxNQUFNLDBCQUEwQjs7QUFFckQ7QUFDQSxNQUFNQyxNQUFNLEdBQUdMLE1BQU0sQ0FBQ00sSUFBSTtBQUUxQixNQUFNQyx3Q0FBd0MsR0FBR0wsNEJBQTRCLENBQUUsMEJBQTBCLENBQUUsQ0FBQ00sbUJBQW1CO0FBRS9ILE1BQU1DLFVBQVUsR0FBRztFQUNqQkMsT0FBTyxFQUFFO0lBQ1BDLFVBQVUsRUFBRSxjQUFjO0lBQzFCQyxtQkFBbUIsRUFBRSxnRUFBZ0U7SUFDckZDLElBQUksRUFBRSw4RUFBOEU7SUFDcEZDLGdCQUFnQixFQUFFLCtJQUErSTtJQUNqS0MsV0FBVyxFQUFFLG1CQUFtQjtJQUNoQ0MsV0FBVyxFQUFFLGVBQWU7SUFDNUJDLE1BQU0sRUFBRTtFQUNWO0FBQ0YsQ0FBQztBQUVEbEIsV0FBVyxDQUFDbUIsTUFBTSxDQUFFLE1BQU07RUFFeEIsTUFBTUMsaUNBQWlDLEdBQUdkLE1BQU0sQ0FBQ2UsWUFBWSxDQUFFLDZCQUE4QixDQUFDO0VBRTlGLE1BQU1DLEdBQUcsR0FBRyxJQUFJdkIsR0FBRyxDQUFFUyx3Q0FBd0MsRUFDM0QsQ0FBRSxJQUFJVixNQUFNLENBQ1YsTUFBTSxJQUFJTSxTQUFTLENBQUVnQixpQ0FBaUMsQ0FBQ0MsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQ2hGRSxLQUFLLElBQUksSUFBSWxCLGNBQWMsQ0FBRWtCLEtBQUssRUFBRUgsaUNBQWlDLENBQUNDLFlBQVksQ0FBRSxNQUFPLENBQUUsQ0FBQyxFQUM5RjtJQUNFRyx1QkFBdUIsRUFBRXRCLGFBQWEsQ0FBQ3VCLHlCQUF5QjtJQUNoRW5CLE1BQU0sRUFBRWMsaUNBQWlDO0lBQ3pDTSxzQkFBc0IsRUFBRUEsQ0FBQSxLQUFNLElBQUk3QixrQ0FBa0MsQ0FBRTtNQUNwRThCLFFBQVEsRUFBRSxJQUFJLENBQUM7SUFDakIsQ0FBRTtFQUNKLENBQ0YsQ0FBQyxDQUNBLEVBQUVqQixVQUFXLENBQUM7RUFDakJZLEdBQUcsQ0FBQ00sS0FBSyxDQUFDLENBQUM7QUFFYixDQUFFLENBQUMifQ==