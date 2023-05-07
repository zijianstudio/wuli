// Copyright 2021-2023, University of Colorado Boulder

/**
 * Demonstrates using PhET Options patterns with inheritance and composition.
 * See https://github.com/phetsims/phet-info/blob/master/doc/phet-software-design-patterns.md#options-typescript
 * for additional description.
 *
 * The general structure of options is to define the Type of options that are defined at each level of the hierarchy,
 * as well as a Type for the public, providedOptions for the constructor. Optionize should do the rest for you. All
 * options that are defined for subtype X should be declared in a type called XSelfOptions. The public API options
 * should be called XOptions. `optionize` will take these as type parameters, as well as parent options and any keys
 * that you will use from the parent options in the subtype constructor. See examples below and feel free to ask
 * @zepumph and @samreid questions as you have them. *
 *
 * NOTE: Instead of overwriting "options", you need to define a new variable so that TypeScript can give it a separate Type.
 *
 * Structure and terminology of classes defined in this file:
 * class Person (supertype)
 * class Employee (subtype)
 * `new Employee` (usage)
 *
 * Constraints that PhET needs to support in its options pattern:
 * (0) Some providedOptions are required, others are optional
 * (1) At instantiation, specify options for supertype that are ignored by subtype (required (name) and optional (height))
 * (2) At instantiation, specify options for subtype that are unknown by supertype (required (isRequiredAwesome) and optional (isAwesome))
 * (3) An option defined in the supertype, where the subtype provides a different default
 * (4) An option defined in the supertype can be used in the subtype (personitude, age)
 * (5) Subtype omits a supertype option from providedOptions, subtype defines and passes to super ("attitude" option)
 * (6) Support for nested sub-options patterns throughout (like dogOptions)
 * (7) Parent has required parameters too
 * (8) Options as a parameter must support being optional, like `providedOptions?`
 * (9) The type checker indicates if you specified an unknown key
 * (10) IDE support navigates from usage sites to key declarations.
 *
 * Comments below annotate where these constraints are tested.
 *
 * In general, the pattern is to define that there are 3 different Types for a single options object in a class.
 * A. The type that you can pass in as options (the public one). This is anded with any and all supertype options.
 * This is the type of providedOptions, the constructor parameter.
 * B. The options that the specific type defines and uses. This is SubclassSelfOptions, the first generic parameter to
 * optionize.js.
 * C. The options that are available after optionize within the type (constructor or elsewhere), and always consist of
 * SubclassSelfOptions (B), but could also potentially consist of supertype options, but only if opting in.
 *
 * Variable naming:
 * - Because typescript now codifies the difference between config and options, there is no need to have anything but "options"
 * as the variable name. As a developer consensus, we no longer need to name any parameters "config" in typescript.
 * - We cannot override the value of a variable and also change its type, thus the options argument must be named differently from the
 * value returned from the `optionize` call. It is conventional to call the parameter "providedOptions" and the optionized object "options".
 *
 *
 * Current limitations of the options pattern:
 * (I) Optionize still struggles in a couple cases to know that defaults has filled in a value. Right now using an
 * option in the constructor when you have provided a default for it in optionize can still type as (X | undefined).
 * This occurs in the following cases:
 *    - providing defaults for required parameters from parent options
 *    - providing defaults for anything in nested options
 * (II) Using the third type parameter for nested options is not ideal. The "Required" piece isn't deep, so defaults aren't filled in as required.
 * (III) Factoring out defaults into "DEFAULT_*_OPTIONS" causes a type inference that doesn't occur when providing an
 * object literal as the "defaults" argument to optionize. This means that you must provide a type where you declare the
 * defaults variable in order to get type safety about the contents of those defaults.
 * (IV) narrowing the type of a single option in a subtype, but using the full type in its constructor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import optionize, { combineOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import merge from '../../../../phet-core/js/merge.js';
import wilder from '../../wilder.js';

////////////////////////////////////////////////////////////////////////////////////////////////
// Basic Examples that utilize common PhET options patterns.
// Here is a classic Super class implementation, let's call it Item
class Item {
  constructor(providedOptions) {
    // In the simplest case, optionize just takes the options that this class defines.
    const options = optionize()({
      children: [],
      x: 0,
      y: 0,
      size: 5
    }, providedOptions);
    this.children = options.children;
    this.x = options.x;
    this.y = options.y;
  }
  getChildren() {
    return this.children;
  }
}
const items = [];

////////
// Example One: Basic subtype creates options and uses supertype options:

// The convention is to name this private type "SelfOptions", though naming collisions below cause us to name them
// specific to each class.
class MyItem extends Item {
  constructor(providedOptions) {
    // Here optionize takes all options that it defines, and also its parent options so that those are allowed to be
    // passed through the super call. By default, optionize knows what the combined type of "providedOptions" (defaults
    // to SelfOptions & ParentOptions).
    const options = optionize()({
      mySpecialNumber: 2,
      x: 10,
      // @ts-expect-error INTENTIONAL - optionize knows what options from this class and the parent are allowed, and no others are accepted.
      blarg: false
    }, providedOptions);
    super(options);
    this.myItemTest(options.mySpecialNumber);
    this.myItemTest(options.x);

    // TODO: y?: number should behave like number|undefined, can we please have a @ts-expect-error on this?, https://github.com/phetsims/phet-core/issues/128
    //  this should most definitely be considered number|undefined, but for some reason `y?: number` is not wrong here.
    this.myItemTest(options.y);
    this.mySpecialNumber = options.mySpecialNumber;
  }
  myItemTest(hi) {
    console.log(hi);
  }
}
items.push(new MyItem());
items.push(new MyItem({
  mySpecialNumber: 4
}));
items.push(new MyItem({
  x: 100,
  y: 100
}));

////////
// Example Two: A Required parameter
class TreeItem extends Item {
  constructor(providedOptions) {
    const options = optionize()({}, providedOptions);
    super(options);
    this.treeType = options.treeType;
  }
}

// @ts-expect-error INTENTIONAL required parameter
items.push(new TreeItem());
items.push(new TreeItem({
  treeType: 'cedar'
}));
items.push(new TreeItem({
  treeType: 'pine',
  children: [new Item()]
}));

////////
// Example Three: nested options
class ItemContainer {
  constructor(providedOptions) {
    const options = optionize()({
      nodeOptions: {
        x: 5,
        y: 5
      }
    }, providedOptions);
    this.node = new Item(options.nodeOptions);
  }
}
const container = new ItemContainer({
  nodeOptions: {
    children: [new MyItem()]
  }
});
console.log(container);

////////
// Example Three Prime: nested options where you do not provide defaults for them.
class ItemContainer2 {
  constructor(providedOptions) {
    // TODO: Explicitly omit here until we can work out a way for optionize to detect nested options directly. https://github.com/phetsims/phet-core/issues/128
    const options = optionize()({}, providedOptions);
    this.node = new Item(options.nodeOptions);
  }
}
const container2 = new ItemContainer2({
  nodeOptions: {
    children: [new MyItem()]
  }
});
console.log(container2);

////////
// Example Four: Narrowing parent options' scope
// Another way to do this in this case would be Pick<ItemOptions, 'children'>, depending on opt-in/opt-out preference for narrowing API
class StationaryItem extends Item {
  constructor(providedOptions) {
    // Here, since there are no self options, and instead just modified parent options, pass the public options in as the parent options
    const options = optionize()({}, providedOptions);
    super(options);
  }
}
items.push(new StationaryItem());

// @ts-expect-error INTENTIONAL x is not in StationaryItemOptions
items.push(new StationaryItem({
  x: 6
}));

////////
// Example Five: Using a parent option in the subtype constructor
// It is a bit safer in common code to keep this alias, even when identical. This way, if you export your public
// options, you don't skip a level and need to do a global refactor if you want to add an option to this subtype.
class ChildrenAdapterItem extends Item {
  constructor(providedOptions) {
    // Adding the third argument makes sure that children is known to be defined, for usage later in the constructor
    const options = optionize()({
      children: [new MyItem()]
    }, providedOptions);

    // TODO: options.children should not be optional, https://github.com/phetsims/phet-core/issues/128
    // Without the 'children' type in optionize, typescript would think that options.children could be undefined
    options.children.push(new MyItem());
    super(options);
    this.hello(options.children);
  }
  hello(items) {
    console.log('hi', items);
  }
}
items.push(new ChildrenAdapterItem());
items.push(new ChildrenAdapterItem({
  children: [new MyItem()]
}));
items.push(new ChildrenAdapterItem({
  children: [new MyItem()],
  x: 10,
  y: 10
}));

////////
// Example Six: Using a DEFAULTS* variable instead of an object literal, please note this explains Limitation (III).

// Another way to do this in this case would be Pick<ItemOptions, 'children'>, depending on opt-in/opt-out preference for narrowing API
class OtherItem extends Item {
  constructor(providedOptions) {
    // NOTE: You must apply a type here in order to get "blarg" to error when uncommented
    const OTHER_ITEM_DEFAULTS = {
      thing: 10,
      stuff: 'some stuff',
      x: 10,
      y: 10,
      // @ts-expect-error INTENTIONAL - only known keys
      blarg: 'hi'
    };

    // Here, since there are no self options, and instead just modified parent options, pass the public options in as the parent options
    const options = optionize3()({}, OTHER_ITEM_DEFAULTS, providedOptions);
    super(options);
    this.test(options.x);
    this.test(options.thing);

    // TODO: this should be a @ts-expect-error INTENTIONAL - it can't think that non-provided options are not defined, likely unfixable but still, https://github.com/phetsims/phet-core/issues/128
    this.test2(options.size);

    // @ts-expect-error INTENTIONAL - even though x is defined, OptionizeDefaults doesn't know what ItemOptions were provided in
    // the object literal. This is an example of a ts-expect-error that may be nice to remove in the future, but
    // currently demonstrates the optionize behavior.
    this.test(OTHER_ITEM_DEFAULTS.x);

    // @ts-expect-error INTENTIONAL - could be undefined
    this.test2(OTHER_ITEM_DEFAULTS.size);
  }
  test(x) {
    console.log(x);
  }
  test2(x) {
    console.log(x);
  }
}
items.push(new OtherItem());

////////
// Example Seven: Everything is required

// Another way to do this in this case would be Pick<ItemOptions, 'children'>, depending on opt-in/opt-out preference for narrowing API
class RequiredThing {
  constructor(providedOptions) {
    // Here, since there are no self options, and instead just modified parent options, pass the public options in as the parent options
    const options = optionize()({
      // @ts-expect-error INTENTIONAL - this should error, it is required and shouldn't have a default
      requiredNumber: 10
    }, providedOptions);
    console.log(options.requiredNumber);
  }
}
console.log(new RequiredThing());

////////
// Example Eight: An option is generic

class MyGeneric {
  constructor(optionalThing) {
    this.optionalThing = optionalThing;
  }
}
class WrapType {
  constructor(providedOptions) {
    const options = optionize()({
      favoriteGeneric: new MyGeneric()
    }, providedOptions);
    this.favoriteGeneric = options.favoriteGeneric;
  }
  getFavoriteItemProperty() {
    return this.favoriteGeneric;
  }
}
console.log(new WrapType());
console.log(new WrapType({
  favoriteGeneric: new MyGeneric(true)
}));
console.log(new WrapType({
  favoriteGeneric: new MyGeneric()
}));

////////
// Example Nine: Supertype has a required option and subtype makes that option optional with a default.
class Super {
  constructor(providedOptions) {
    this.howSuper = providedOptions.howSuper;
  }
  isSuper() {
    return this.howSuper;
  }
}
class King extends Super {
  constructor(providedOptions) {
    const options = optionize()({
      howSuper: 'totally',
      hasGoodGroceries: true
    }, providedOptions);
    super(options);
  }
}
const kingSuper1 = new King({
  hasGoodGroceries: true,
  howSuper: 'a bit'
});
const kingSuper2 = new King({
  hasGoodGroceries: false
});
console.log(kingSuper1);
console.log(kingSuper2);

////////
// Example Ten: Defaults from your subtype AND from a common Constants object
// optionize currently only provides one argument to supply ALL defaults with, so you must merge them all into a
// variable (of type OptionizeDefaults<>) and pass that into optionize.
// TODO: improve on this pattern. Perhaps optionize can take two parameters sometimes and & them together to come up with the defaults? https://github.com/phetsims/phet-core/issues/128

const SIM_CONSTANTS = {
  ITEM_CONSTANTS: {
    x: 4,
    isSad: 'yes'
  }
};
class BlueItem extends Item {
  constructor(providedOptions) {
    // NOTE: isSad can be provided either via the SIM_CONSTANTS objec, or in the object literal, but TypeScript knows
    // if you leave it out entirely.
    const defaults = merge({}, SIM_CONSTANTS.ITEM_CONSTANTS, {
      y: 10,
      isSad: 'always'
    });
    const options = optionize3()({}, defaults, providedOptions);
    super(options);
    this.test(options.isSad);
  }
  test(isSad) {
    console.log(isSad);
  }
}
items.push(new BlueItem());

////////
// Example Eleven: demonstrating Limitation (IV)
class LargeItem extends Item {
  constructor(providedOptions) {
    const options = optionize()({
      // Limitation (IV), I cannot use the type from ItemOptions, but instead I'm internally limited to the public
      // narrowing API of just number.
      // size: 'veryLarge'
      size: 4 // TODO: delete this and use 'veryLarge' above instead, https://github.com/phetsims/phet-core/issues/128
    }, providedOptions);
    super(options);
  }
}

// items.push( new LargeItem( { size: 'veryLarge' } ) ); // fails, good!
items.push(new LargeItem({
  size: 7
}));

//////////////////////////////////
//////////////////////////////////
// Examples using combineOptions

/////////
// Example Twelve: Use combineOptions when passing options to a composed class (example also in design patterns doc)
class MemberOfComposedClass {
  constructor(providedOptions) {
    const options = optionize()({
      oneOption: false
    }, providedOptions);
    console.log(options);
  }
}
class ThingWithComposedClass {
  // childOptions are required, so no need to optionize. But that could easily be done if needed.
  constructor(providedOptions) {
    this.member = new MemberOfComposedClass(combineOptions({
      oneOption: true
    }, providedOptions.childOptions));
  }
}
console.log(new ThingWithComposedClass({
  childOptions: {}
}));

/////////
// Example Thirteen
//
// Use combineOptions in multiple ways to sprinkle in more options after the initial optionize call while keeping the
// same type from the optionize return type.
// 1. For nested options
// 2. For options that depend on other options
//
class Handle {
  constructor(providedOptions) {
    const options = optionize()({
      // @ts-expect-error length is required, so it shouldn't get a default
      length: 2
    }, providedOptions);
    this.length = options.length;
  }
}
class CoffeeCup {
  constructor(providedOptions) {
    // Feel free to name "initial" to house the type returned from optionize
    const initialOptions = optionize()({
      percentFilled: 30
    }, providedOptions);

    // combineOptions can be helpful when providing defaults to nestedOptions.
    initialOptions.handleOptions = combineOptions({
      length: 4 // CoffeeCups have larger handles
    }, initialOptions.handleOptions);

    // combineOptions can be used when you want to add in options that depend on other options
    const options = combineOptions({
      isABigCup: initialOptions.percentFilled > 50 // big cups start over half full
    });

    this.handle = new Handle(options.handleOptions);
  }
}
console.log(new CoffeeCup());

/////////
// Example Fourteen
//
// combineOptions can be a bit of a shortcut when you have enough context about the specific use case. Here combineOptions
// is used in a couple different ways where optionize may be more scalable or maintainable (like if in common code), but
// if needed combineOptions can be simpler.
class AnotherItem extends Item {
  constructor(providedOptions) {
    // AnotherItem options have the same type as ItemOptions. It just sets one default. This example doesn't make it easy
    // to add SelfOptions to AnotherItem, or to export AnotherItemOptions if needed elsewhere, but for a
    // modular/sim-specific case could be reasonable.
    const options = combineOptions({
      size: 'veryLarge'
    }, providedOptions);
    super(options);
  }
  static USE_AN_ITEM_OPTIONS = {
    anOption: true
  };
  static useAnItem(useAnItemOptions) {
    // In this case, there are no "defaults" and we don't need to prevent `anOption` from being undefined, so combineOptions
    // works well.
    const options = combineOptions({}, AnotherItem.USE_AN_ITEM_OPTIONS, useAnItemOptions);
    console.log(options.anOption);
  }
}
items.push(new AnotherItem({
  x: 5
}));

/////////
// Example Fifteen - omit required parent option and specify in defaults
//
class GalaxyClass {
  constructor(options) {
    this.topSpeed = options.warpSpeed;
  }
}
class EnterpriseC extends GalaxyClass {
  constructor(providedOptions) {
    // @ts-expect-error INTENTIONAL - warpSpeed is required, so you can't have it in the defaults
    const options = optionize()({

      // warpSpeed: 10 // a lack of this option shows that we don't have a value for a required options
    }, providedOptions);
    super(options);
  }
}
class EnterpriseD extends GalaxyClass {
  constructor(providedOptions) {
    const options = optionize()({
      warpSpeed: 10
    }, providedOptions);
    super(options);
  }
}
class EnterpriseE extends GalaxyClass {
  constructor(providedOptions) {
    const options = optionize()({
      // @ts-expect-error warpSpeed is required, so you can't have it in the defaults
      warpSpeed: 10
    }, providedOptions);
    super(options);
  }
}
console.log(new EnterpriseC());
console.log(new EnterpriseD());
console.log(new EnterpriseE({
  warpSpeed: 1
}));

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// Below is a class hierarchy meant to exercise the complete feature set (and limitation set) of the current options
// pattern. It is much more complicated, and it is recommended to start in the above examples.
class Dog {
  // Note that since there was no default, Typescript knows it must support undefined

  constructor(providedOptions) {
    const options = optionize()({
      age: 0,
      isGood: true
    }, providedOptions);
    this.age = options.age;
    this.name = options.name;
    this.isGood = options.isGood;
  }
  printAge() {
    console.log(this.age);
  }
}
// no parent options

class Person {
  constructor(providedOptions) {
    const options = optionize()({
      // (0) (7) New pattern doesn't use `required()` for non-optional options. (like for `name`)
      hasShirt: true,
      height: 7,
      // <-- I commented this out to see this ERROR
      attitude: '',
      personitude: 'very much so',
      age: 0,
      dogOptions: {
        isGood: false
      }
    }, providedOptions);
    options.dogOptions;
    options.age;
    options.hasShirt;

    // Limitation (I): note that isGood is not recognized as being filled in because our optionize doesn't know about nested options.
    options.dogOptions.isGood;

    // Limitation (I) Remove type cast because name should be known to come from providedOptions. Alternatively, you can specify as
    // part of PersonOptions that we must get dogOptions.name. This counteracts the `Partial` and lets it be known in
    // the Person constructor that dogOptions is complete at this point.
    this.dog = new Dog(options.dogOptions);
  }
}
class Employee extends Person {
  constructor(providedOptions) {
    // before optionize because it is required
    console.log(providedOptions.isRequiredAwesome);

    // Not real code, just for the ts-expect-error without ruining type checking on the actual optionize call.
    optionize()({
      // @ts-expect-error you cannot provide a default for a required option
      isRequiredAwesome: true
    });
    const options = optionize()({
      isAwesome: true,
      // (2)
      hasShirt: false,
      // (3)
      // personitude: 'hello', // (4).a
      // personitude: PERSON_DEFAULTS.personitude (4).b
      // attitude: 'cool' // (5).a

      personitude: 'personable',
      age: 5,
      dogOptions: {
        isGood: true
      }
    },
    // (4).c This is one way to indicate to the type system that personitude will be used in the constructor
    // (III) Note that PERSON_DEFAULTS needs a type where defined, because it isn't an object literal.
    // PERSON_DEFAULTS,
    providedOptions);

    // (5) Use a strategy like (4).b (4).c to "tell" TypeScript that options has an attitude attribute
    // Or just define it there in the first place, like (5).a
    // options.attitude = 'cool';

    // (4) This would only work if you supply (4)(a) (b) or (c) above.
    // const x: string = options.personitude;
    // console.log( x );

    // (II) dogOptions.isGood is still potentially undefined when using in the constructor, even though we added `dogOptions` as a key in the third arg
    // console.log( options.dogOptions.isGood );

    // (4) If you have optional usage sites in the constructor, you can leave it optional in the optionize types
    const a = options.personitude;
    console.log(a);

    // (4) Optionize knows age is defined here because it is optional in EmployeeSelfOptions, so it must have a default.
    console.log('My age is', options.age - 1); // cool people seem younger

    super(options);
    this.isAwesome = options.isAwesome;
    this.isRequiredAwesome = options.isRequiredAwesome;
    this.age = options.age;
  }
}
class EmployeeOfTheMonth extends Employee {
  constructor(providedOptions) {
    // (8), note that if options are optional, then they get a question mark here.

    const options = optionize()({
      // name: 'Bob', // Limitation (I) why doesn't this fail when commented out! It is a required argument to EmployeeOptions but providedOptions is optional?  https://github.com/phetsims/phet-core/issues/128
      isRequiredAwesome: true
    }, providedOptions);
    super(options);
  }
}
class WilderOptionsPatterns {
  constructor() {
    this.bob = new Employee({
      isRequiredAwesome: true,
      // (2)
      isAwesome: false,
      // (2)
      dogOptions: {
        age: 3,
        name: 'dog name'
      },
      name: 'Bob' // (1)
    });

    this.charlie = new Employee({
      isRequiredAwesome: true,
      // (2)
      isAwesome: false,
      // (2)
      name: 'Charlie',
      // (1) if you comment this out, it will be an error because it is a required option
      height: 49,
      // (1)
      hasShirt: true,
      // (3)
      dogOptions: {
        name: 'other dog name'
      },
      // @ts-expect-error INTENTIONAL countryOfOrigin is not in any known options
      countryOfOrigin: 'america'
    });
    this.samanantha = new Employee({
      // @ts-expect-error INTENTIONAL // (5) not allowed in EmployeeOptions
      attitude: 'pretty freaking nice'
    });

    // @ts-expect-error INTENTIONAL needs a isRequiredAwesome
    this.samanantha = new Employee({
      name: 'Samanantha' // (1)
    });

    // @ts-expect-error INTENTIONAL needs a name
    this.tela = new Employee({
      isRequiredAwesome: true // (1)
    });

    this.alice = new EmployeeOfTheMonth({
      name: 'Melissa' // (8) if not for limitation (I), EmployeeOfTheMonth would always have name 'Bob'
    });
  }
}

wilder.register('WilderOptionsPatterns', WilderOptionsPatterns);
export default WilderOptionsPatterns;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIm9wdGlvbml6ZTMiLCJtZXJnZSIsIndpbGRlciIsIkl0ZW0iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjaGlsZHJlbiIsIngiLCJ5Iiwic2l6ZSIsImdldENoaWxkcmVuIiwiaXRlbXMiLCJNeUl0ZW0iLCJteVNwZWNpYWxOdW1iZXIiLCJibGFyZyIsIm15SXRlbVRlc3QiLCJoaSIsImNvbnNvbGUiLCJsb2ciLCJwdXNoIiwiVHJlZUl0ZW0iLCJ0cmVlVHlwZSIsIkl0ZW1Db250YWluZXIiLCJub2RlT3B0aW9ucyIsIm5vZGUiLCJjb250YWluZXIiLCJJdGVtQ29udGFpbmVyMiIsImNvbnRhaW5lcjIiLCJTdGF0aW9uYXJ5SXRlbSIsIkNoaWxkcmVuQWRhcHRlckl0ZW0iLCJoZWxsbyIsIk90aGVySXRlbSIsIk9USEVSX0lURU1fREVGQVVMVFMiLCJ0aGluZyIsInN0dWZmIiwidGVzdCIsInRlc3QyIiwiUmVxdWlyZWRUaGluZyIsInJlcXVpcmVkTnVtYmVyIiwiTXlHZW5lcmljIiwib3B0aW9uYWxUaGluZyIsIldyYXBUeXBlIiwiZmF2b3JpdGVHZW5lcmljIiwiZ2V0RmF2b3JpdGVJdGVtUHJvcGVydHkiLCJTdXBlciIsImhvd1N1cGVyIiwiaXNTdXBlciIsIktpbmciLCJoYXNHb29kR3JvY2VyaWVzIiwia2luZ1N1cGVyMSIsImtpbmdTdXBlcjIiLCJTSU1fQ09OU1RBTlRTIiwiSVRFTV9DT05TVEFOVFMiLCJpc1NhZCIsIkJsdWVJdGVtIiwiZGVmYXVsdHMiLCJMYXJnZUl0ZW0iLCJNZW1iZXJPZkNvbXBvc2VkQ2xhc3MiLCJvbmVPcHRpb24iLCJUaGluZ1dpdGhDb21wb3NlZENsYXNzIiwibWVtYmVyIiwiY2hpbGRPcHRpb25zIiwiSGFuZGxlIiwibGVuZ3RoIiwiQ29mZmVlQ3VwIiwiaW5pdGlhbE9wdGlvbnMiLCJwZXJjZW50RmlsbGVkIiwiaGFuZGxlT3B0aW9ucyIsImlzQUJpZ0N1cCIsImhhbmRsZSIsIkFub3RoZXJJdGVtIiwiVVNFX0FOX0lURU1fT1BUSU9OUyIsImFuT3B0aW9uIiwidXNlQW5JdGVtIiwidXNlQW5JdGVtT3B0aW9ucyIsIkdhbGF4eUNsYXNzIiwidG9wU3BlZWQiLCJ3YXJwU3BlZWQiLCJFbnRlcnByaXNlQyIsIkVudGVycHJpc2VEIiwiRW50ZXJwcmlzZUUiLCJEb2ciLCJhZ2UiLCJpc0dvb2QiLCJuYW1lIiwicHJpbnRBZ2UiLCJQZXJzb24iLCJoYXNTaGlydCIsImhlaWdodCIsImF0dGl0dWRlIiwicGVyc29uaXR1ZGUiLCJkb2dPcHRpb25zIiwiZG9nIiwiRW1wbG95ZWUiLCJpc1JlcXVpcmVkQXdlc29tZSIsImlzQXdlc29tZSIsImEiLCJFbXBsb3llZU9mVGhlTW9udGgiLCJXaWxkZXJPcHRpb25zUGF0dGVybnMiLCJib2IiLCJjaGFybGllIiwiY291bnRyeU9mT3JpZ2luIiwic2FtYW5hbnRoYSIsInRlbGEiLCJhbGljZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2lsZGVyT3B0aW9uc1BhdHRlcm5zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW9uc3RyYXRlcyB1c2luZyBQaEVUIE9wdGlvbnMgcGF0dGVybnMgd2l0aCBpbmhlcml0YW5jZSBhbmQgY29tcG9zaXRpb24uXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pbmZvL2Jsb2IvbWFzdGVyL2RvYy9waGV0LXNvZnR3YXJlLWRlc2lnbi1wYXR0ZXJucy5tZCNvcHRpb25zLXR5cGVzY3JpcHRcclxuICogZm9yIGFkZGl0aW9uYWwgZGVzY3JpcHRpb24uXHJcbiAqXHJcbiAqIFRoZSBnZW5lcmFsIHN0cnVjdHVyZSBvZiBvcHRpb25zIGlzIHRvIGRlZmluZSB0aGUgVHlwZSBvZiBvcHRpb25zIHRoYXQgYXJlIGRlZmluZWQgYXQgZWFjaCBsZXZlbCBvZiB0aGUgaGllcmFyY2h5LFxyXG4gKiBhcyB3ZWxsIGFzIGEgVHlwZSBmb3IgdGhlIHB1YmxpYywgcHJvdmlkZWRPcHRpb25zIGZvciB0aGUgY29uc3RydWN0b3IuIE9wdGlvbml6ZSBzaG91bGQgZG8gdGhlIHJlc3QgZm9yIHlvdS4gQWxsXHJcbiAqIG9wdGlvbnMgdGhhdCBhcmUgZGVmaW5lZCBmb3Igc3VidHlwZSBYIHNob3VsZCBiZSBkZWNsYXJlZCBpbiBhIHR5cGUgY2FsbGVkIFhTZWxmT3B0aW9ucy4gVGhlIHB1YmxpYyBBUEkgb3B0aW9uc1xyXG4gKiBzaG91bGQgYmUgY2FsbGVkIFhPcHRpb25zLiBgb3B0aW9uaXplYCB3aWxsIHRha2UgdGhlc2UgYXMgdHlwZSBwYXJhbWV0ZXJzLCBhcyB3ZWxsIGFzIHBhcmVudCBvcHRpb25zIGFuZCBhbnkga2V5c1xyXG4gKiB0aGF0IHlvdSB3aWxsIHVzZSBmcm9tIHRoZSBwYXJlbnQgb3B0aW9ucyBpbiB0aGUgc3VidHlwZSBjb25zdHJ1Y3Rvci4gU2VlIGV4YW1wbGVzIGJlbG93IGFuZCBmZWVsIGZyZWUgdG8gYXNrXHJcbiAqIEB6ZXB1bXBoIGFuZCBAc2FtcmVpZCBxdWVzdGlvbnMgYXMgeW91IGhhdmUgdGhlbS4gKlxyXG4gKlxyXG4gKiBOT1RFOiBJbnN0ZWFkIG9mIG92ZXJ3cml0aW5nIFwib3B0aW9uc1wiLCB5b3UgbmVlZCB0byBkZWZpbmUgYSBuZXcgdmFyaWFibGUgc28gdGhhdCBUeXBlU2NyaXB0IGNhbiBnaXZlIGl0IGEgc2VwYXJhdGUgVHlwZS5cclxuICpcclxuICogU3RydWN0dXJlIGFuZCB0ZXJtaW5vbG9neSBvZiBjbGFzc2VzIGRlZmluZWQgaW4gdGhpcyBmaWxlOlxyXG4gKiBjbGFzcyBQZXJzb24gKHN1cGVydHlwZSlcclxuICogY2xhc3MgRW1wbG95ZWUgKHN1YnR5cGUpXHJcbiAqIGBuZXcgRW1wbG95ZWVgICh1c2FnZSlcclxuICpcclxuICogQ29uc3RyYWludHMgdGhhdCBQaEVUIG5lZWRzIHRvIHN1cHBvcnQgaW4gaXRzIG9wdGlvbnMgcGF0dGVybjpcclxuICogKDApIFNvbWUgcHJvdmlkZWRPcHRpb25zIGFyZSByZXF1aXJlZCwgb3RoZXJzIGFyZSBvcHRpb25hbFxyXG4gKiAoMSkgQXQgaW5zdGFudGlhdGlvbiwgc3BlY2lmeSBvcHRpb25zIGZvciBzdXBlcnR5cGUgdGhhdCBhcmUgaWdub3JlZCBieSBzdWJ0eXBlIChyZXF1aXJlZCAobmFtZSkgYW5kIG9wdGlvbmFsIChoZWlnaHQpKVxyXG4gKiAoMikgQXQgaW5zdGFudGlhdGlvbiwgc3BlY2lmeSBvcHRpb25zIGZvciBzdWJ0eXBlIHRoYXQgYXJlIHVua25vd24gYnkgc3VwZXJ0eXBlIChyZXF1aXJlZCAoaXNSZXF1aXJlZEF3ZXNvbWUpIGFuZCBvcHRpb25hbCAoaXNBd2Vzb21lKSlcclxuICogKDMpIEFuIG9wdGlvbiBkZWZpbmVkIGluIHRoZSBzdXBlcnR5cGUsIHdoZXJlIHRoZSBzdWJ0eXBlIHByb3ZpZGVzIGEgZGlmZmVyZW50IGRlZmF1bHRcclxuICogKDQpIEFuIG9wdGlvbiBkZWZpbmVkIGluIHRoZSBzdXBlcnR5cGUgY2FuIGJlIHVzZWQgaW4gdGhlIHN1YnR5cGUgKHBlcnNvbml0dWRlLCBhZ2UpXHJcbiAqICg1KSBTdWJ0eXBlIG9taXRzIGEgc3VwZXJ0eXBlIG9wdGlvbiBmcm9tIHByb3ZpZGVkT3B0aW9ucywgc3VidHlwZSBkZWZpbmVzIGFuZCBwYXNzZXMgdG8gc3VwZXIgKFwiYXR0aXR1ZGVcIiBvcHRpb24pXHJcbiAqICg2KSBTdXBwb3J0IGZvciBuZXN0ZWQgc3ViLW9wdGlvbnMgcGF0dGVybnMgdGhyb3VnaG91dCAobGlrZSBkb2dPcHRpb25zKVxyXG4gKiAoNykgUGFyZW50IGhhcyByZXF1aXJlZCBwYXJhbWV0ZXJzIHRvb1xyXG4gKiAoOCkgT3B0aW9ucyBhcyBhIHBhcmFtZXRlciBtdXN0IHN1cHBvcnQgYmVpbmcgb3B0aW9uYWwsIGxpa2UgYHByb3ZpZGVkT3B0aW9ucz9gXHJcbiAqICg5KSBUaGUgdHlwZSBjaGVja2VyIGluZGljYXRlcyBpZiB5b3Ugc3BlY2lmaWVkIGFuIHVua25vd24ga2V5XHJcbiAqICgxMCkgSURFIHN1cHBvcnQgbmF2aWdhdGVzIGZyb20gdXNhZ2Ugc2l0ZXMgdG8ga2V5IGRlY2xhcmF0aW9ucy5cclxuICpcclxuICogQ29tbWVudHMgYmVsb3cgYW5ub3RhdGUgd2hlcmUgdGhlc2UgY29uc3RyYWludHMgYXJlIHRlc3RlZC5cclxuICpcclxuICogSW4gZ2VuZXJhbCwgdGhlIHBhdHRlcm4gaXMgdG8gZGVmaW5lIHRoYXQgdGhlcmUgYXJlIDMgZGlmZmVyZW50IFR5cGVzIGZvciBhIHNpbmdsZSBvcHRpb25zIG9iamVjdCBpbiBhIGNsYXNzLlxyXG4gKiBBLiBUaGUgdHlwZSB0aGF0IHlvdSBjYW4gcGFzcyBpbiBhcyBvcHRpb25zICh0aGUgcHVibGljIG9uZSkuIFRoaXMgaXMgYW5kZWQgd2l0aCBhbnkgYW5kIGFsbCBzdXBlcnR5cGUgb3B0aW9ucy5cclxuICogVGhpcyBpcyB0aGUgdHlwZSBvZiBwcm92aWRlZE9wdGlvbnMsIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIuXHJcbiAqIEIuIFRoZSBvcHRpb25zIHRoYXQgdGhlIHNwZWNpZmljIHR5cGUgZGVmaW5lcyBhbmQgdXNlcy4gVGhpcyBpcyBTdWJjbGFzc1NlbGZPcHRpb25zLCB0aGUgZmlyc3QgZ2VuZXJpYyBwYXJhbWV0ZXIgdG9cclxuICogb3B0aW9uaXplLmpzLlxyXG4gKiBDLiBUaGUgb3B0aW9ucyB0aGF0IGFyZSBhdmFpbGFibGUgYWZ0ZXIgb3B0aW9uaXplIHdpdGhpbiB0aGUgdHlwZSAoY29uc3RydWN0b3Igb3IgZWxzZXdoZXJlKSwgYW5kIGFsd2F5cyBjb25zaXN0IG9mXHJcbiAqIFN1YmNsYXNzU2VsZk9wdGlvbnMgKEIpLCBidXQgY291bGQgYWxzbyBwb3RlbnRpYWxseSBjb25zaXN0IG9mIHN1cGVydHlwZSBvcHRpb25zLCBidXQgb25seSBpZiBvcHRpbmcgaW4uXHJcbiAqXHJcbiAqIFZhcmlhYmxlIG5hbWluZzpcclxuICogLSBCZWNhdXNlIHR5cGVzY3JpcHQgbm93IGNvZGlmaWVzIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gY29uZmlnIGFuZCBvcHRpb25zLCB0aGVyZSBpcyBubyBuZWVkIHRvIGhhdmUgYW55dGhpbmcgYnV0IFwib3B0aW9uc1wiXHJcbiAqIGFzIHRoZSB2YXJpYWJsZSBuYW1lLiBBcyBhIGRldmVsb3BlciBjb25zZW5zdXMsIHdlIG5vIGxvbmdlciBuZWVkIHRvIG5hbWUgYW55IHBhcmFtZXRlcnMgXCJjb25maWdcIiBpbiB0eXBlc2NyaXB0LlxyXG4gKiAtIFdlIGNhbm5vdCBvdmVycmlkZSB0aGUgdmFsdWUgb2YgYSB2YXJpYWJsZSBhbmQgYWxzbyBjaGFuZ2UgaXRzIHR5cGUsIHRodXMgdGhlIG9wdGlvbnMgYXJndW1lbnQgbXVzdCBiZSBuYW1lZCBkaWZmZXJlbnRseSBmcm9tIHRoZVxyXG4gKiB2YWx1ZSByZXR1cm5lZCBmcm9tIHRoZSBgb3B0aW9uaXplYCBjYWxsLiBJdCBpcyBjb252ZW50aW9uYWwgdG8gY2FsbCB0aGUgcGFyYW1ldGVyIFwicHJvdmlkZWRPcHRpb25zXCIgYW5kIHRoZSBvcHRpb25pemVkIG9iamVjdCBcIm9wdGlvbnNcIi5cclxuICpcclxuICpcclxuICogQ3VycmVudCBsaW1pdGF0aW9ucyBvZiB0aGUgb3B0aW9ucyBwYXR0ZXJuOlxyXG4gKiAoSSkgT3B0aW9uaXplIHN0aWxsIHN0cnVnZ2xlcyBpbiBhIGNvdXBsZSBjYXNlcyB0byBrbm93IHRoYXQgZGVmYXVsdHMgaGFzIGZpbGxlZCBpbiBhIHZhbHVlLiBSaWdodCBub3cgdXNpbmcgYW5cclxuICogb3B0aW9uIGluIHRoZSBjb25zdHJ1Y3RvciB3aGVuIHlvdSBoYXZlIHByb3ZpZGVkIGEgZGVmYXVsdCBmb3IgaXQgaW4gb3B0aW9uaXplIGNhbiBzdGlsbCB0eXBlIGFzIChYIHwgdW5kZWZpbmVkKS5cclxuICogVGhpcyBvY2N1cnMgaW4gdGhlIGZvbGxvd2luZyBjYXNlczpcclxuICogICAgLSBwcm92aWRpbmcgZGVmYXVsdHMgZm9yIHJlcXVpcmVkIHBhcmFtZXRlcnMgZnJvbSBwYXJlbnQgb3B0aW9uc1xyXG4gKiAgICAtIHByb3ZpZGluZyBkZWZhdWx0cyBmb3IgYW55dGhpbmcgaW4gbmVzdGVkIG9wdGlvbnNcclxuICogKElJKSBVc2luZyB0aGUgdGhpcmQgdHlwZSBwYXJhbWV0ZXIgZm9yIG5lc3RlZCBvcHRpb25zIGlzIG5vdCBpZGVhbC4gVGhlIFwiUmVxdWlyZWRcIiBwaWVjZSBpc24ndCBkZWVwLCBzbyBkZWZhdWx0cyBhcmVuJ3QgZmlsbGVkIGluIGFzIHJlcXVpcmVkLlxyXG4gKiAoSUlJKSBGYWN0b3Jpbmcgb3V0IGRlZmF1bHRzIGludG8gXCJERUZBVUxUXypfT1BUSU9OU1wiIGNhdXNlcyBhIHR5cGUgaW5mZXJlbmNlIHRoYXQgZG9lc24ndCBvY2N1ciB3aGVuIHByb3ZpZGluZyBhblxyXG4gKiBvYmplY3QgbGl0ZXJhbCBhcyB0aGUgXCJkZWZhdWx0c1wiIGFyZ3VtZW50IHRvIG9wdGlvbml6ZS4gVGhpcyBtZWFucyB0aGF0IHlvdSBtdXN0IHByb3ZpZGUgYSB0eXBlIHdoZXJlIHlvdSBkZWNsYXJlIHRoZVxyXG4gKiBkZWZhdWx0cyB2YXJpYWJsZSBpbiBvcmRlciB0byBnZXQgdHlwZSBzYWZldHkgYWJvdXQgdGhlIGNvbnRlbnRzIG9mIHRob3NlIGRlZmF1bHRzLlxyXG4gKiAoSVYpIG5hcnJvd2luZyB0aGUgdHlwZSBvZiBhIHNpbmdsZSBvcHRpb24gaW4gYSBzdWJ0eXBlLCBidXQgdXNpbmcgdGhlIGZ1bGwgdHlwZSBpbiBpdHMgY29uc3RydWN0b3IuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBvcHRpb25pemUzLCBPcHRpb25pemVEZWZhdWx0cyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFdpdGhPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvV2l0aE9wdGlvbmFsLmpzJztcclxuaW1wb3J0IHdpbGRlciBmcm9tICcuLi8uLi93aWxkZXIuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcblxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gQmFzaWMgRXhhbXBsZXMgdGhhdCB1dGlsaXplIGNvbW1vbiBQaEVUIG9wdGlvbnMgcGF0dGVybnMuXHJcblxyXG4vLyBIZXJlIGlzIGEgY2xhc3NpYyBTdXBlciBjbGFzcyBpbXBsZW1lbnRhdGlvbiwgbGV0J3MgY2FsbCBpdCBJdGVtXHJcblxyXG50eXBlIEl0ZW1PcHRpb25zID0ge1xyXG4gIGNoaWxkcmVuPzogSXRlbVtdO1xyXG4gIHg/OiBudW1iZXI7XHJcbiAgeT86IG51bWJlcjtcclxuICBzaXplPzogbnVtYmVyIHwgJ3ZlcnlMYXJnZSc7XHJcbn07XHJcblxyXG5jbGFzcyBJdGVtIHtcclxuICBwcml2YXRlIGNoaWxkcmVuOiBJdGVtW107XHJcbiAgcHJpdmF0ZSB4OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSB5OiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogSXRlbU9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gSW4gdGhlIHNpbXBsZXN0IGNhc2UsIG9wdGlvbml6ZSBqdXN0IHRha2VzIHRoZSBvcHRpb25zIHRoYXQgdGhpcyBjbGFzcyBkZWZpbmVzLlxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxJdGVtT3B0aW9ucz4oKSgge1xyXG4gICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDAsXHJcbiAgICAgIHNpemU6IDVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgdGhpcy5jaGlsZHJlbiA9IG9wdGlvbnMuY2hpbGRyZW47XHJcbiAgICB0aGlzLnggPSBvcHRpb25zLng7XHJcbiAgICB0aGlzLnkgPSBvcHRpb25zLnk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q2hpbGRyZW4oKTogSXRlbVtdIHtcclxuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgaXRlbXM6IEl0ZW1bXSA9IFtdO1xyXG5cclxuXHJcbi8vLy8vLy8vXHJcbi8vIEV4YW1wbGUgT25lOiBCYXNpYyBzdWJ0eXBlIGNyZWF0ZXMgb3B0aW9ucyBhbmQgdXNlcyBzdXBlcnR5cGUgb3B0aW9uczpcclxuXHJcbi8vIFRoZSBjb252ZW50aW9uIGlzIHRvIG5hbWUgdGhpcyBwcml2YXRlIHR5cGUgXCJTZWxmT3B0aW9uc1wiLCB0aG91Z2ggbmFtaW5nIGNvbGxpc2lvbnMgYmVsb3cgY2F1c2UgdXMgdG8gbmFtZSB0aGVtXHJcbi8vIHNwZWNpZmljIHRvIGVhY2ggY2xhc3MuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgbXlTcGVjaWFsTnVtYmVyPzogbnVtYmVyO1xyXG59O1xyXG5cclxudHlwZSBNeUl0ZW1PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBJdGVtT3B0aW9ucztcclxuXHJcbmNsYXNzIE15SXRlbSBleHRlbmRzIEl0ZW0ge1xyXG4gIHByaXZhdGUgbXlTcGVjaWFsTnVtYmVyOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogTXlJdGVtT3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBIZXJlIG9wdGlvbml6ZSB0YWtlcyBhbGwgb3B0aW9ucyB0aGF0IGl0IGRlZmluZXMsIGFuZCBhbHNvIGl0cyBwYXJlbnQgb3B0aW9ucyBzbyB0aGF0IHRob3NlIGFyZSBhbGxvd2VkIHRvIGJlXHJcbiAgICAvLyBwYXNzZWQgdGhyb3VnaCB0aGUgc3VwZXIgY2FsbC4gQnkgZGVmYXVsdCwgb3B0aW9uaXplIGtub3dzIHdoYXQgdGhlIGNvbWJpbmVkIHR5cGUgb2YgXCJwcm92aWRlZE9wdGlvbnNcIiAoZGVmYXVsdHNcclxuICAgIC8vIHRvIFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucykuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE15SXRlbU9wdGlvbnMsIFNlbGZPcHRpb25zLCBJdGVtT3B0aW9ucz4oKSgge1xyXG4gICAgICBteVNwZWNpYWxOdW1iZXI6IDIsXHJcbiAgICAgIHg6IDEwLFxyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTCAtIG9wdGlvbml6ZSBrbm93cyB3aGF0IG9wdGlvbnMgZnJvbSB0aGlzIGNsYXNzIGFuZCB0aGUgcGFyZW50IGFyZSBhbGxvd2VkLCBhbmQgbm8gb3RoZXJzIGFyZSBhY2NlcHRlZC5cclxuICAgICAgYmxhcmc6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gICAgdGhpcy5teUl0ZW1UZXN0KCBvcHRpb25zLm15U3BlY2lhbE51bWJlciApO1xyXG4gICAgdGhpcy5teUl0ZW1UZXN0KCBvcHRpb25zLnggKTtcclxuXHJcbiAgICAvLyBUT0RPOiB5PzogbnVtYmVyIHNob3VsZCBiZWhhdmUgbGlrZSBudW1iZXJ8dW5kZWZpbmVkLCBjYW4gd2UgcGxlYXNlIGhhdmUgYSBAdHMtZXhwZWN0LWVycm9yIG9uIHRoaXM/LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1jb3JlL2lzc3Vlcy8xMjhcclxuICAgIC8vICB0aGlzIHNob3VsZCBtb3N0IGRlZmluaXRlbHkgYmUgY29uc2lkZXJlZCBudW1iZXJ8dW5kZWZpbmVkLCBidXQgZm9yIHNvbWUgcmVhc29uIGB5PzogbnVtYmVyYCBpcyBub3Qgd3JvbmcgaGVyZS5cclxuICAgIHRoaXMubXlJdGVtVGVzdCggb3B0aW9ucy55ICk7XHJcblxyXG4gICAgdGhpcy5teVNwZWNpYWxOdW1iZXIgPSBvcHRpb25zLm15U3BlY2lhbE51bWJlcjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbXlJdGVtVGVzdCggaGk6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGNvbnNvbGUubG9nKCBoaSApO1xyXG4gIH1cclxufVxyXG5cclxuaXRlbXMucHVzaCggbmV3IE15SXRlbSgpICk7XHJcbml0ZW1zLnB1c2goIG5ldyBNeUl0ZW0oIHsgbXlTcGVjaWFsTnVtYmVyOiA0IH0gKSApO1xyXG5pdGVtcy5wdXNoKCBuZXcgTXlJdGVtKCB7IHg6IDEwMCwgeTogMTAwIH0gKSApO1xyXG5cclxuXHJcbi8vLy8vLy8vXHJcbi8vIEV4YW1wbGUgVHdvOiBBIFJlcXVpcmVkIHBhcmFtZXRlclxyXG5cclxudHlwZSBUcmVlSXRlbVNlbGZPcHRpb25zID0ge1xyXG4gIHRyZWVUeXBlOiAnY2VkYXInIHwgJ3BpbmUnO1xyXG59O1xyXG50eXBlIFRyZWVJdGVtT3B0aW9ucyA9IFRyZWVJdGVtU2VsZk9wdGlvbnMgJiBJdGVtT3B0aW9ucztcclxuXHJcbmNsYXNzIFRyZWVJdGVtIGV4dGVuZHMgSXRlbSB7XHJcbiAgcHJpdmF0ZSB0cmVlVHlwZTogVHJlZUl0ZW1TZWxmT3B0aW9uc1sgJ3RyZWVUeXBlJyBdO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogVHJlZUl0ZW1PcHRpb25zICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUcmVlSXRlbU9wdGlvbnMsIFRyZWVJdGVtU2VsZk9wdGlvbnMsIEl0ZW1PcHRpb25zPigpKCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gICAgdGhpcy50cmVlVHlwZSA9IG9wdGlvbnMudHJlZVR5cGU7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMIHJlcXVpcmVkIHBhcmFtZXRlclxyXG5pdGVtcy5wdXNoKCBuZXcgVHJlZUl0ZW0oKSApO1xyXG5pdGVtcy5wdXNoKCBuZXcgVHJlZUl0ZW0oIHsgdHJlZVR5cGU6ICdjZWRhcicgfSApICk7XHJcbml0ZW1zLnB1c2goIG5ldyBUcmVlSXRlbSgge1xyXG4gIHRyZWVUeXBlOiAncGluZScsXHJcbiAgY2hpbGRyZW46IFsgbmV3IEl0ZW0oKSBdXHJcbn0gKSApO1xyXG5cclxuXHJcbi8vLy8vLy8vXHJcbi8vIEV4YW1wbGUgVGhyZWU6IG5lc3RlZCBvcHRpb25zXHJcbnR5cGUgSXRlbUNvbnRhaW5lck9wdGlvbnMgPSB7XHJcbiAgbm9kZU9wdGlvbnM/OiBJdGVtT3B0aW9ucztcclxufTtcclxuXHJcbmNsYXNzIEl0ZW1Db250YWluZXIge1xyXG4gIHByaXZhdGUgbm9kZTogSXRlbTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IEl0ZW1Db250YWluZXJPcHRpb25zICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxJdGVtQ29udGFpbmVyT3B0aW9ucz4oKSgge1xyXG4gICAgICBub2RlT3B0aW9uczoge1xyXG4gICAgICAgIHg6IDUsXHJcbiAgICAgICAgeTogNVxyXG4gICAgICB9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLm5vZGUgPSBuZXcgSXRlbSggb3B0aW9ucy5ub2RlT3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgY29udGFpbmVyID0gbmV3IEl0ZW1Db250YWluZXIoIHtcclxuICBub2RlT3B0aW9uczoge1xyXG4gICAgY2hpbGRyZW46IFsgbmV3IE15SXRlbSgpIF1cclxuICB9XHJcbn0gKTtcclxuY29uc29sZS5sb2coIGNvbnRhaW5lciApO1xyXG5cclxuLy8vLy8vLy9cclxuLy8gRXhhbXBsZSBUaHJlZSBQcmltZTogbmVzdGVkIG9wdGlvbnMgd2hlcmUgeW91IGRvIG5vdCBwcm92aWRlIGRlZmF1bHRzIGZvciB0aGVtLlxyXG50eXBlIEl0ZW1Db250YWluZXIyT3B0aW9ucyA9IHtcclxuICBub2RlT3B0aW9ucz86IEl0ZW1PcHRpb25zO1xyXG59O1xyXG5cclxuY2xhc3MgSXRlbUNvbnRhaW5lcjIge1xyXG4gIHByaXZhdGUgbm9kZTogSXRlbTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IEl0ZW1Db250YWluZXIyT3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBUT0RPOiBFeHBsaWNpdGx5IG9taXQgaGVyZSB1bnRpbCB3ZSBjYW4gd29yayBvdXQgYSB3YXkgZm9yIG9wdGlvbml6ZSB0byBkZXRlY3QgbmVzdGVkIG9wdGlvbnMgZGlyZWN0bHkuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzEyOFxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxJdGVtQ29udGFpbmVyMk9wdGlvbnMsIFN0cmljdE9taXQ8SXRlbUNvbnRhaW5lcjJPcHRpb25zLCAnbm9kZU9wdGlvbnMnPj4oKSgge30sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMubm9kZSA9IG5ldyBJdGVtKCBvcHRpb25zLm5vZGVPcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBjb250YWluZXIyID0gbmV3IEl0ZW1Db250YWluZXIyKCB7XHJcbiAgbm9kZU9wdGlvbnM6IHtcclxuICAgIGNoaWxkcmVuOiBbIG5ldyBNeUl0ZW0oKSBdXHJcbiAgfVxyXG59ICk7XHJcbmNvbnNvbGUubG9nKCBjb250YWluZXIyICk7XHJcblxyXG5cclxuLy8vLy8vLy9cclxuLy8gRXhhbXBsZSBGb3VyOiBOYXJyb3dpbmcgcGFyZW50IG9wdGlvbnMnIHNjb3BlXHJcblxyXG50eXBlIFN0YXRpb25hcnlJdGVtU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxuLy8gQW5vdGhlciB3YXkgdG8gZG8gdGhpcyBpbiB0aGlzIGNhc2Ugd291bGQgYmUgUGljazxJdGVtT3B0aW9ucywgJ2NoaWxkcmVuJz4sIGRlcGVuZGluZyBvbiBvcHQtaW4vb3B0LW91dCBwcmVmZXJlbmNlIGZvciBuYXJyb3dpbmcgQVBJXHJcbnR5cGUgU3RhdGlvbmFyeUl0ZW1PcHRpb25zID0gU3RhdGlvbmFyeUl0ZW1TZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8SXRlbU9wdGlvbnMsICd4JyB8ICd5Jz47XHJcblxyXG5jbGFzcyBTdGF0aW9uYXJ5SXRlbSBleHRlbmRzIEl0ZW0ge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogU3RhdGlvbmFyeUl0ZW1PcHRpb25zICkge1xyXG5cclxuICAgIC8vIEhlcmUsIHNpbmNlIHRoZXJlIGFyZSBubyBzZWxmIG9wdGlvbnMsIGFuZCBpbnN0ZWFkIGp1c3QgbW9kaWZpZWQgcGFyZW50IG9wdGlvbnMsIHBhc3MgdGhlIHB1YmxpYyBvcHRpb25zIGluIGFzIHRoZSBwYXJlbnQgb3B0aW9uc1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTdGF0aW9uYXJ5SXRlbU9wdGlvbnMsIFN0YXRpb25hcnlJdGVtU2VsZk9wdGlvbnMsIEl0ZW1PcHRpb25zPigpKCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbml0ZW1zLnB1c2goIG5ldyBTdGF0aW9uYXJ5SXRlbSgpICk7XHJcblxyXG4vLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMIHggaXMgbm90IGluIFN0YXRpb25hcnlJdGVtT3B0aW9uc1xyXG5pdGVtcy5wdXNoKCBuZXcgU3RhdGlvbmFyeUl0ZW0oIHsgeDogNiB9ICkgKTtcclxuXHJcbi8vLy8vLy8vXHJcbi8vIEV4YW1wbGUgRml2ZTogVXNpbmcgYSBwYXJlbnQgb3B0aW9uIGluIHRoZSBzdWJ0eXBlIGNvbnN0cnVjdG9yXHJcblxyXG50eXBlIENoaWxkcmVuQWRhcHRlckl0ZW1TZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG4vLyBJdCBpcyBhIGJpdCBzYWZlciBpbiBjb21tb24gY29kZSB0byBrZWVwIHRoaXMgYWxpYXMsIGV2ZW4gd2hlbiBpZGVudGljYWwuIFRoaXMgd2F5LCBpZiB5b3UgZXhwb3J0IHlvdXIgcHVibGljXHJcbi8vIG9wdGlvbnMsIHlvdSBkb24ndCBza2lwIGEgbGV2ZWwgYW5kIG5lZWQgdG8gZG8gYSBnbG9iYWwgcmVmYWN0b3IgaWYgeW91IHdhbnQgdG8gYWRkIGFuIG9wdGlvbiB0byB0aGlzIHN1YnR5cGUuXHJcbnR5cGUgQ2hpbGRyZW5BZGFwdGVySXRlbU9wdGlvbnMgPSBDaGlsZHJlbkFkYXB0ZXJJdGVtU2VsZk9wdGlvbnMgJiBJdGVtT3B0aW9ucztcclxuXHJcbmNsYXNzIENoaWxkcmVuQWRhcHRlckl0ZW0gZXh0ZW5kcyBJdGVtIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IENoaWxkcmVuQWRhcHRlckl0ZW1PcHRpb25zICkge1xyXG5cclxuICAgIC8vIEFkZGluZyB0aGUgdGhpcmQgYXJndW1lbnQgbWFrZXMgc3VyZSB0aGF0IGNoaWxkcmVuIGlzIGtub3duIHRvIGJlIGRlZmluZWQsIGZvciB1c2FnZSBsYXRlciBpbiB0aGUgY29uc3RydWN0b3JcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q2hpbGRyZW5BZGFwdGVySXRlbU9wdGlvbnMsIENoaWxkcmVuQWRhcHRlckl0ZW1TZWxmT3B0aW9ucywgSXRlbU9wdGlvbnM+KCkoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbmV3IE15SXRlbSgpIF1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRPRE86IG9wdGlvbnMuY2hpbGRyZW4gc2hvdWxkIG5vdCBiZSBvcHRpb25hbCwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTI4XHJcbiAgICAvLyBXaXRob3V0IHRoZSAnY2hpbGRyZW4nIHR5cGUgaW4gb3B0aW9uaXplLCB0eXBlc2NyaXB0IHdvdWxkIHRoaW5rIHRoYXQgb3B0aW9ucy5jaGlsZHJlbiBjb3VsZCBiZSB1bmRlZmluZWRcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4ucHVzaCggbmV3IE15SXRlbSgpICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICAgIHRoaXMuaGVsbG8oIG9wdGlvbnMuY2hpbGRyZW4gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoZWxsbyggaXRlbXM6IEl0ZW1bXSApOiB2b2lkIHtcclxuICAgIGNvbnNvbGUubG9nKCAnaGknLCBpdGVtcyApO1xyXG4gIH1cclxufVxyXG5cclxuaXRlbXMucHVzaCggbmV3IENoaWxkcmVuQWRhcHRlckl0ZW0oKSApO1xyXG5pdGVtcy5wdXNoKCBuZXcgQ2hpbGRyZW5BZGFwdGVySXRlbSggeyBjaGlsZHJlbjogWyBuZXcgTXlJdGVtKCkgXSB9ICkgKTtcclxuaXRlbXMucHVzaCggbmV3IENoaWxkcmVuQWRhcHRlckl0ZW0oIHsgY2hpbGRyZW46IFsgbmV3IE15SXRlbSgpIF0sIHg6IDEwLCB5OiAxMCB9ICkgKTtcclxuXHJcblxyXG4vLy8vLy8vL1xyXG4vLyBFeGFtcGxlIFNpeDogVXNpbmcgYSBERUZBVUxUUyogdmFyaWFibGUgaW5zdGVhZCBvZiBhbiBvYmplY3QgbGl0ZXJhbCwgcGxlYXNlIG5vdGUgdGhpcyBleHBsYWlucyBMaW1pdGF0aW9uIChJSUkpLlxyXG5cclxuLy8gQW5vdGhlciB3YXkgdG8gZG8gdGhpcyBpbiB0aGlzIGNhc2Ugd291bGQgYmUgUGljazxJdGVtT3B0aW9ucywgJ2NoaWxkcmVuJz4sIGRlcGVuZGluZyBvbiBvcHQtaW4vb3B0LW91dCBwcmVmZXJlbmNlIGZvciBuYXJyb3dpbmcgQVBJXHJcbnR5cGUgT3RoZXJJdGVtU2VsZk9wdGlvbnMgPSB7XHJcbiAgdGhpbmc/OiBudW1iZXI7XHJcbiAgc3R1ZmY/OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIE90aGVySXRlbU9wdGlvbnMgPSBPdGhlckl0ZW1TZWxmT3B0aW9ucyAmIEl0ZW1PcHRpb25zO1xyXG5cclxuY2xhc3MgT3RoZXJJdGVtIGV4dGVuZHMgSXRlbSB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBPdGhlckl0ZW1PcHRpb25zICkge1xyXG5cclxuICAgIC8vIE5PVEU6IFlvdSBtdXN0IGFwcGx5IGEgdHlwZSBoZXJlIGluIG9yZGVyIHRvIGdldCBcImJsYXJnXCIgdG8gZXJyb3Igd2hlbiB1bmNvbW1lbnRlZFxyXG4gICAgY29uc3QgT1RIRVJfSVRFTV9ERUZBVUxUUzogT3B0aW9uaXplRGVmYXVsdHM8T3RoZXJJdGVtU2VsZk9wdGlvbnMsIEl0ZW1PcHRpb25zPiA9IHtcclxuICAgICAgdGhpbmc6IDEwLFxyXG4gICAgICBzdHVmZjogJ3NvbWUgc3R1ZmYnLFxyXG4gICAgICB4OiAxMCxcclxuICAgICAgeTogMTAsXHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMIC0gb25seSBrbm93biBrZXlzXHJcbiAgICAgIGJsYXJnOiAnaGknXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEhlcmUsIHNpbmNlIHRoZXJlIGFyZSBubyBzZWxmIG9wdGlvbnMsIGFuZCBpbnN0ZWFkIGp1c3QgbW9kaWZpZWQgcGFyZW50IG9wdGlvbnMsIHBhc3MgdGhlIHB1YmxpYyBvcHRpb25zIGluIGFzIHRoZSBwYXJlbnQgb3B0aW9uc1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTM8T3RoZXJJdGVtT3B0aW9ucywgT3RoZXJJdGVtU2VsZk9wdGlvbnMsIEl0ZW1PcHRpb25zPigpKCB7fSwgT1RIRVJfSVRFTV9ERUZBVUxUUywgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnRlc3QoIG9wdGlvbnMueCApO1xyXG4gICAgdGhpcy50ZXN0KCBvcHRpb25zLnRoaW5nICk7XHJcblxyXG4gICAgLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgYSBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMIC0gaXQgY2FuJ3QgdGhpbmsgdGhhdCBub24tcHJvdmlkZWQgb3B0aW9ucyBhcmUgbm90IGRlZmluZWQsIGxpa2VseSB1bmZpeGFibGUgYnV0IHN0aWxsLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1jb3JlL2lzc3Vlcy8xMjhcclxuICAgIHRoaXMudGVzdDIoIG9wdGlvbnMuc2l6ZSApO1xyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUwgLSBldmVuIHRob3VnaCB4IGlzIGRlZmluZWQsIE9wdGlvbml6ZURlZmF1bHRzIGRvZXNuJ3Qga25vdyB3aGF0IEl0ZW1PcHRpb25zIHdlcmUgcHJvdmlkZWQgaW5cclxuICAgIC8vIHRoZSBvYmplY3QgbGl0ZXJhbC4gVGhpcyBpcyBhbiBleGFtcGxlIG9mIGEgdHMtZXhwZWN0LWVycm9yIHRoYXQgbWF5IGJlIG5pY2UgdG8gcmVtb3ZlIGluIHRoZSBmdXR1cmUsIGJ1dFxyXG4gICAgLy8gY3VycmVudGx5IGRlbW9uc3RyYXRlcyB0aGUgb3B0aW9uaXplIGJlaGF2aW9yLlxyXG4gICAgdGhpcy50ZXN0KCBPVEhFUl9JVEVNX0RFRkFVTFRTLnggKTtcclxuXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMIC0gY291bGQgYmUgdW5kZWZpbmVkXHJcbiAgICB0aGlzLnRlc3QyKCBPVEhFUl9JVEVNX0RFRkFVTFRTLnNpemUgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0ZXN0KCB4OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBjb25zb2xlLmxvZyggeCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRlc3QyKCB4OiBudW1iZXIgfCAndmVyeUxhcmdlJyApOiB2b2lkIHtcclxuICAgIGNvbnNvbGUubG9nKCB4ICk7XHJcbiAgfVxyXG59XHJcblxyXG5pdGVtcy5wdXNoKCBuZXcgT3RoZXJJdGVtKCkgKTtcclxuXHJcbi8vLy8vLy8vXHJcbi8vIEV4YW1wbGUgU2V2ZW46IEV2ZXJ5dGhpbmcgaXMgcmVxdWlyZWRcclxuXHJcbi8vIEFub3RoZXIgd2F5IHRvIGRvIHRoaXMgaW4gdGhpcyBjYXNlIHdvdWxkIGJlIFBpY2s8SXRlbU9wdGlvbnMsICdjaGlsZHJlbic+LCBkZXBlbmRpbmcgb24gb3B0LWluL29wdC1vdXQgcHJlZmVyZW5jZSBmb3IgbmFycm93aW5nIEFQSVxyXG50eXBlIFJlcXVpcmVkVGhpbmdPcHRpb25zID0ge1xyXG4gIHJlcXVpcmVkTnVtYmVyOiBudW1iZXI7XHJcbiAgcmVxdWlyZWRTdHJpbmc6IHN0cmluZztcclxuICBvcHRpb25hbD86IG51bWJlcjsgLy8gVW5jb21tZW50IHRvIGdldCB0aGUgZXJyb3IgaW4gdGhlIG9wdGlvbml6ZSBkZWZhdWx0cy5cclxufTtcclxuXHJcblxyXG5jbGFzcyBSZXF1aXJlZFRoaW5nIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFJlcXVpcmVkVGhpbmdPcHRpb25zICkge1xyXG5cclxuICAgIC8vIEhlcmUsIHNpbmNlIHRoZXJlIGFyZSBubyBzZWxmIG9wdGlvbnMsIGFuZCBpbnN0ZWFkIGp1c3QgbW9kaWZpZWQgcGFyZW50IG9wdGlvbnMsIHBhc3MgdGhlIHB1YmxpYyBvcHRpb25zIGluIGFzIHRoZSBwYXJlbnQgb3B0aW9uc1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZXF1aXJlZFRoaW5nT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTCAtIHRoaXMgc2hvdWxkIGVycm9yLCBpdCBpcyByZXF1aXJlZCBhbmQgc2hvdWxkbid0IGhhdmUgYSBkZWZhdWx0XHJcbiAgICAgIHJlcXVpcmVkTnVtYmVyOiAxMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc29sZS5sb2coIG9wdGlvbnMucmVxdWlyZWROdW1iZXIgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnNvbGUubG9nKCBuZXcgUmVxdWlyZWRUaGluZygpICk7XHJcblxyXG4vLy8vLy8vL1xyXG4vLyBFeGFtcGxlIEVpZ2h0OiBBbiBvcHRpb24gaXMgZ2VuZXJpY1xyXG5cclxuY2xhc3MgTXlHZW5lcmljPEc+IHtcclxuICBwcml2YXRlIG9wdGlvbmFsVGhpbmc6IEcgfCB1bmRlZmluZWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9uYWxUaGluZz86IEcgKSB7XHJcbiAgICB0aGlzLm9wdGlvbmFsVGhpbmcgPSBvcHRpb25hbFRoaW5nO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBXcmFwVHlwZU9wdGlvbnM8VD4gPSB7XHJcbiAgZmF2b3JpdGVHZW5lcmljPzogTXlHZW5lcmljPFQ+O1xyXG59O1xyXG5cclxuXHJcbmNsYXNzIFdyYXBUeXBlPFQ+IHtcclxuICBwdWJsaWMgZmF2b3JpdGVHZW5lcmljOiBNeUdlbmVyaWM8VD47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogV3JhcFR5cGVPcHRpb25zPFQ+ICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxXcmFwVHlwZU9wdGlvbnM8VD4sIFdyYXBUeXBlT3B0aW9uczxUPj4oKSgge1xyXG4gICAgICBmYXZvcml0ZUdlbmVyaWM6IG5ldyBNeUdlbmVyaWM8VD4oKVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5mYXZvcml0ZUdlbmVyaWMgPSBvcHRpb25zLmZhdm9yaXRlR2VuZXJpYztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRGYXZvcml0ZUl0ZW1Qcm9wZXJ0eSgpOiBNeUdlbmVyaWM8VD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZmF2b3JpdGVHZW5lcmljO1xyXG4gIH1cclxufVxyXG5cclxuY29uc29sZS5sb2coIG5ldyBXcmFwVHlwZSgpICk7XHJcbmNvbnNvbGUubG9nKCBuZXcgV3JhcFR5cGUoIHtcclxuICBmYXZvcml0ZUdlbmVyaWM6IG5ldyBNeUdlbmVyaWM8Ym9vbGVhbj4oIHRydWUgKVxyXG59ICkgKTtcclxuY29uc29sZS5sb2coIG5ldyBXcmFwVHlwZSgge1xyXG4gIGZhdm9yaXRlR2VuZXJpYzogbmV3IE15R2VuZXJpYzxib29sZWFuPigpXHJcbn0gKSApO1xyXG5cclxuLy8vLy8vLy9cclxuLy8gRXhhbXBsZSBOaW5lOiBTdXBlcnR5cGUgaGFzIGEgcmVxdWlyZWQgb3B0aW9uIGFuZCBzdWJ0eXBlIG1ha2VzIHRoYXQgb3B0aW9uIG9wdGlvbmFsIHdpdGggYSBkZWZhdWx0LlxyXG50eXBlIEhvd1N1cGVyID0gJ3RvdGFsbHknIHwgJ2EgYml0JyB8ICdubywgbm90IHJlYWxseSc7XHJcblxyXG50eXBlIFN1cGVyT3B0aW9ucyA9IHtcclxuICBob3dTdXBlcjogSG93U3VwZXI7XHJcbn07XHJcblxyXG5jbGFzcyBTdXBlciB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBob3dTdXBlcjogSG93U3VwZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBTdXBlck9wdGlvbnMgKSB7XHJcbiAgICB0aGlzLmhvd1N1cGVyID0gcHJvdmlkZWRPcHRpb25zLmhvd1N1cGVyO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzU3VwZXIoKTogSG93U3VwZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuaG93U3VwZXI7XHJcbiAgfVxyXG59XHJcblxyXG50eXBlIEtpbmdTZWxmT3B0aW9ucyA9IHtcclxuICBoYXNHb29kR3JvY2VyaWVzPzogYm9vbGVhbjtcclxufTtcclxudHlwZSBLaW5nT3B0aW9ucyA9IEtpbmdTZWxmT3B0aW9ucyAmIFdpdGhPcHRpb25hbDxTdXBlck9wdGlvbnMsICdob3dTdXBlcic+O1xyXG5cclxuY2xhc3MgS2luZyBleHRlbmRzIFN1cGVyIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEtpbmdPcHRpb25zICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxLaW5nT3B0aW9ucywgS2luZ1NlbGZPcHRpb25zLCBTdXBlck9wdGlvbnM+KCkoIHtcclxuICAgICAgaG93U3VwZXI6ICd0b3RhbGx5JyxcclxuICAgICAgaGFzR29vZEdyb2NlcmllczogdHJ1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3Qga2luZ1N1cGVyMSA9IG5ldyBLaW5nKCB7XHJcbiAgaGFzR29vZEdyb2NlcmllczogdHJ1ZSxcclxuICBob3dTdXBlcjogJ2EgYml0J1xyXG59ICk7XHJcblxyXG5jb25zdCBraW5nU3VwZXIyID0gbmV3IEtpbmcoIHtcclxuICBoYXNHb29kR3JvY2VyaWVzOiBmYWxzZVxyXG59ICk7XHJcbmNvbnNvbGUubG9nKCBraW5nU3VwZXIxICk7XHJcbmNvbnNvbGUubG9nKCBraW5nU3VwZXIyICk7XHJcblxyXG5cclxuLy8vLy8vLy9cclxuLy8gRXhhbXBsZSBUZW46IERlZmF1bHRzIGZyb20geW91ciBzdWJ0eXBlIEFORCBmcm9tIGEgY29tbW9uIENvbnN0YW50cyBvYmplY3RcclxuLy8gb3B0aW9uaXplIGN1cnJlbnRseSBvbmx5IHByb3ZpZGVzIG9uZSBhcmd1bWVudCB0byBzdXBwbHkgQUxMIGRlZmF1bHRzIHdpdGgsIHNvIHlvdSBtdXN0IG1lcmdlIHRoZW0gYWxsIGludG8gYVxyXG4vLyB2YXJpYWJsZSAob2YgdHlwZSBPcHRpb25pemVEZWZhdWx0czw+KSBhbmQgcGFzcyB0aGF0IGludG8gb3B0aW9uaXplLlxyXG4vLyBUT0RPOiBpbXByb3ZlIG9uIHRoaXMgcGF0dGVybi4gUGVyaGFwcyBvcHRpb25pemUgY2FuIHRha2UgdHdvIHBhcmFtZXRlcnMgc29tZXRpbWVzIGFuZCAmIHRoZW0gdG9nZXRoZXIgdG8gY29tZSB1cCB3aXRoIHRoZSBkZWZhdWx0cz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTI4XHJcblxyXG5jb25zdCBTSU1fQ09OU1RBTlRTID0ge1xyXG4gIElURU1fQ09OU1RBTlRTOiB7XHJcbiAgICB4OiA0LFxyXG4gICAgaXNTYWQ6ICd5ZXMnXHJcbiAgfVxyXG59O1xyXG5cclxudHlwZSBCbHVlSXRlbVNlbGZPcHRpb25zID0ge1xyXG4gIGlzU2FkPzogc3RyaW5nO1xyXG59O1xyXG50eXBlIEJsdXRJdGVtT3B0aW9ucyA9IEJsdWVJdGVtU2VsZk9wdGlvbnMgJiBJdGVtT3B0aW9ucztcclxuXHJcbmNsYXNzIEJsdWVJdGVtIGV4dGVuZHMgSXRlbSB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBCbHV0SXRlbU9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gTk9URTogaXNTYWQgY2FuIGJlIHByb3ZpZGVkIGVpdGhlciB2aWEgdGhlIFNJTV9DT05TVEFOVFMgb2JqZWMsIG9yIGluIHRoZSBvYmplY3QgbGl0ZXJhbCwgYnV0IFR5cGVTY3JpcHQga25vd3NcclxuICAgIC8vIGlmIHlvdSBsZWF2ZSBpdCBvdXQgZW50aXJlbHkuXHJcbiAgICBjb25zdCBkZWZhdWx0czogT3B0aW9uaXplRGVmYXVsdHM8Qmx1ZUl0ZW1TZWxmT3B0aW9ucywgSXRlbU9wdGlvbnM+ID0gbWVyZ2UoIHt9LCBTSU1fQ09OU1RBTlRTLklURU1fQ09OU1RBTlRTLCB7XHJcbiAgICAgIHk6IDEwLFxyXG4gICAgICBpc1NhZDogJ2Fsd2F5cydcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplMzxCbHV0SXRlbU9wdGlvbnMsIEJsdWVJdGVtU2VsZk9wdGlvbnMsIEl0ZW1PcHRpb25zPigpKCB7fSwgZGVmYXVsdHMsIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy50ZXN0KCBvcHRpb25zLmlzU2FkICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdGVzdCggaXNTYWQ6IHN0cmluZyApOiB2b2lkIHtcclxuICAgIGNvbnNvbGUubG9nKCBpc1NhZCApO1xyXG4gIH1cclxufVxyXG5cclxuaXRlbXMucHVzaCggbmV3IEJsdWVJdGVtKCkgKTtcclxuXHJcblxyXG4vLy8vLy8vL1xyXG4vLyBFeGFtcGxlIEVsZXZlbjogZGVtb25zdHJhdGluZyBMaW1pdGF0aW9uIChJVilcclxuXHJcbnR5cGUgTGFyZ2VJdGVtU2VsZk9wdGlvbnMgPSB7XHJcbiAgc2l6ZT86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgTGFyZ2VJdGVtT3B0aW9ucyA9IExhcmdlSXRlbVNlbGZPcHRpb25zICYgSXRlbU9wdGlvbnM7XHJcblxyXG5jbGFzcyBMYXJnZUl0ZW0gZXh0ZW5kcyBJdGVtIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IExhcmdlSXRlbU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMYXJnZUl0ZW1PcHRpb25zLCBMYXJnZUl0ZW1TZWxmT3B0aW9ucywgSXRlbU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIExpbWl0YXRpb24gKElWKSwgSSBjYW5ub3QgdXNlIHRoZSB0eXBlIGZyb20gSXRlbU9wdGlvbnMsIGJ1dCBpbnN0ZWFkIEknbSBpbnRlcm5hbGx5IGxpbWl0ZWQgdG8gdGhlIHB1YmxpY1xyXG4gICAgICAvLyBuYXJyb3dpbmcgQVBJIG9mIGp1c3QgbnVtYmVyLlxyXG4gICAgICAvLyBzaXplOiAndmVyeUxhcmdlJ1xyXG4gICAgICBzaXplOiA0IC8vIFRPRE86IGRlbGV0ZSB0aGlzIGFuZCB1c2UgJ3ZlcnlMYXJnZScgYWJvdmUgaW5zdGVhZCwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTI4XHJcblxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIGl0ZW1zLnB1c2goIG5ldyBMYXJnZUl0ZW0oIHsgc2l6ZTogJ3ZlcnlMYXJnZScgfSApICk7IC8vIGZhaWxzLCBnb29kIVxyXG5pdGVtcy5wdXNoKCBuZXcgTGFyZ2VJdGVtKCB7IHNpemU6IDcgfSApICk7XHJcblxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gRXhhbXBsZXMgdXNpbmcgY29tYmluZU9wdGlvbnNcclxuXHJcbi8vLy8vLy8vL1xyXG4vLyBFeGFtcGxlIFR3ZWx2ZTogVXNlIGNvbWJpbmVPcHRpb25zIHdoZW4gcGFzc2luZyBvcHRpb25zIHRvIGEgY29tcG9zZWQgY2xhc3MgKGV4YW1wbGUgYWxzbyBpbiBkZXNpZ24gcGF0dGVybnMgZG9jKVxyXG5cclxudHlwZSBNZW1iZXJPZkNvbXBvc2VkQ2xhc3NTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbnR5cGUgTWVtYmVyT2ZDb21wb3NlZENsYXNzT3B0aW9ucyA9IHtcclxuICBvbmVPcHRpb24/OiBib29sZWFuO1xyXG59O1xyXG5cclxuY2xhc3MgTWVtYmVyT2ZDb21wb3NlZENsYXNzIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IE1lbWJlck9mQ29tcG9zZWRDbGFzc09wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE1lbWJlck9mQ29tcG9zZWRDbGFzc09wdGlvbnMsIE1lbWJlck9mQ29tcG9zZWRDbGFzc1NlbGZPcHRpb25zPigpKCB7XHJcbiAgICAgIG9uZU9wdGlvbjogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG50eXBlIFRoaW5nV2l0aENvbXBvc2VkQ2xhc3NPcHRpb25zID0ge1xyXG4gIGNoaWxkT3B0aW9uczogTWVtYmVyT2ZDb21wb3NlZENsYXNzT3B0aW9ucztcclxufTtcclxuXHJcbmNsYXNzIFRoaW5nV2l0aENvbXBvc2VkQ2xhc3Mge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWVtYmVyOiBNZW1iZXJPZkNvbXBvc2VkQ2xhc3M7XHJcblxyXG4gIC8vIGNoaWxkT3B0aW9ucyBhcmUgcmVxdWlyZWQsIHNvIG5vIG5lZWQgdG8gb3B0aW9uaXplLiBCdXQgdGhhdCBjb3VsZCBlYXNpbHkgYmUgZG9uZSBpZiBuZWVkZWQuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IFRoaW5nV2l0aENvbXBvc2VkQ2xhc3NPcHRpb25zICkge1xyXG5cclxuICAgIHRoaXMubWVtYmVyID0gbmV3IE1lbWJlck9mQ29tcG9zZWRDbGFzcyggY29tYmluZU9wdGlvbnM8TWVtYmVyT2ZDb21wb3NlZENsYXNzT3B0aW9ucz4oIHtcclxuICAgICAgb25lT3B0aW9uOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMuY2hpbGRPcHRpb25zICkgKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG5jb25zb2xlLmxvZyggbmV3IFRoaW5nV2l0aENvbXBvc2VkQ2xhc3MoIHsgY2hpbGRPcHRpb25zOiB7fSB9ICkgKTtcclxuXHJcbi8vLy8vLy8vL1xyXG4vLyBFeGFtcGxlIFRoaXJ0ZWVuXHJcbi8vXHJcbi8vIFVzZSBjb21iaW5lT3B0aW9ucyBpbiBtdWx0aXBsZSB3YXlzIHRvIHNwcmlua2xlIGluIG1vcmUgb3B0aW9ucyBhZnRlciB0aGUgaW5pdGlhbCBvcHRpb25pemUgY2FsbCB3aGlsZSBrZWVwaW5nIHRoZVxyXG4vLyBzYW1lIHR5cGUgZnJvbSB0aGUgb3B0aW9uaXplIHJldHVybiB0eXBlLlxyXG4vLyAxLiBGb3IgbmVzdGVkIG9wdGlvbnNcclxuLy8gMi4gRm9yIG9wdGlvbnMgdGhhdCBkZXBlbmQgb24gb3RoZXIgb3B0aW9uc1xyXG4vL1xyXG5cclxudHlwZSBIYW5kbGVPcHRpb25zID0ge1xyXG4gIGxlbmd0aDogbnVtYmVyOyAvLyAwIHRvIDUgdW5pdHNcclxufTtcclxuXHJcbmNsYXNzIEhhbmRsZSB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsZW5ndGg6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBIYW5kbGVPcHRpb25zICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxIYW5kbGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGxlbmd0aCBpcyByZXF1aXJlZCwgc28gaXQgc2hvdWxkbid0IGdldCBhIGRlZmF1bHRcclxuICAgICAgbGVuZ3RoOiAyXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmxlbmd0aCA9IG9wdGlvbnMubGVuZ3RoO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBDb2ZmZWVDdXBPcHRpb25zID0ge1xyXG4gIGhhbmRsZU9wdGlvbnM/OiBIYW5kbGVPcHRpb25zO1xyXG4gIHBlcmNlbnRGaWxsZWQ/OiBudW1iZXI7XHJcbiAgaXNBQmlnQ3VwPzogYm9vbGVhbjtcclxufTtcclxuXHJcbmNsYXNzIENvZmZlZUN1cCB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBoYW5kbGU6IEhhbmRsZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBDb2ZmZWVDdXBPcHRpb25zICkge1xyXG5cclxuICAgIC8vIEZlZWwgZnJlZSB0byBuYW1lIFwiaW5pdGlhbFwiIHRvIGhvdXNlIHRoZSB0eXBlIHJldHVybmVkIGZyb20gb3B0aW9uaXplXHJcbiAgICBjb25zdCBpbml0aWFsT3B0aW9ucyA9IG9wdGlvbml6ZTxDb2ZmZWVDdXBPcHRpb25zLCBTdHJpY3RPbWl0PENvZmZlZUN1cE9wdGlvbnMsICdoYW5kbGVPcHRpb25zJyB8ICdpc0FCaWdDdXAnPj4oKSgge1xyXG4gICAgICBwZXJjZW50RmlsbGVkOiAzMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gY29tYmluZU9wdGlvbnMgY2FuIGJlIGhlbHBmdWwgd2hlbiBwcm92aWRpbmcgZGVmYXVsdHMgdG8gbmVzdGVkT3B0aW9ucy5cclxuICAgIGluaXRpYWxPcHRpb25zLmhhbmRsZU9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxIYW5kbGVPcHRpb25zPigge1xyXG4gICAgICBsZW5ndGg6IDQgLy8gQ29mZmVlQ3VwcyBoYXZlIGxhcmdlciBoYW5kbGVzXHJcbiAgICB9LCBpbml0aWFsT3B0aW9ucy5oYW5kbGVPcHRpb25zICk7XHJcblxyXG4gICAgLy8gY29tYmluZU9wdGlvbnMgY2FuIGJlIHVzZWQgd2hlbiB5b3Ugd2FudCB0byBhZGQgaW4gb3B0aW9ucyB0aGF0IGRlcGVuZCBvbiBvdGhlciBvcHRpb25zXHJcbiAgICBjb25zdCBvcHRpb25zOiB0eXBlb2YgaW5pdGlhbE9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczx0eXBlb2YgaW5pdGlhbE9wdGlvbnM+KCB7XHJcbiAgICAgIGlzQUJpZ0N1cDogaW5pdGlhbE9wdGlvbnMucGVyY2VudEZpbGxlZCA+IDUwIC8vIGJpZyBjdXBzIHN0YXJ0IG92ZXIgaGFsZiBmdWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5oYW5kbGUgPSBuZXcgSGFuZGxlKCBvcHRpb25zLmhhbmRsZU9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnNvbGUubG9nKCBuZXcgQ29mZmVlQ3VwKCkgKTtcclxuXHJcbi8vLy8vLy8vL1xyXG4vLyBFeGFtcGxlIEZvdXJ0ZWVuXHJcbi8vXHJcbi8vIGNvbWJpbmVPcHRpb25zIGNhbiBiZSBhIGJpdCBvZiBhIHNob3J0Y3V0IHdoZW4geW91IGhhdmUgZW5vdWdoIGNvbnRleHQgYWJvdXQgdGhlIHNwZWNpZmljIHVzZSBjYXNlLiBIZXJlIGNvbWJpbmVPcHRpb25zXHJcbi8vIGlzIHVzZWQgaW4gYSBjb3VwbGUgZGlmZmVyZW50IHdheXMgd2hlcmUgb3B0aW9uaXplIG1heSBiZSBtb3JlIHNjYWxhYmxlIG9yIG1haW50YWluYWJsZSAobGlrZSBpZiBpbiBjb21tb24gY29kZSksIGJ1dFxyXG4vLyBpZiBuZWVkZWQgY29tYmluZU9wdGlvbnMgY2FuIGJlIHNpbXBsZXIuXHJcblxyXG50eXBlIFVzZUFuSXRlbU9wdGlvbnMgPSB7XHJcbiAgYW5PcHRpb24/OiBib29sZWFuO1xyXG59O1xyXG5cclxuY2xhc3MgQW5vdGhlckl0ZW0gZXh0ZW5kcyBJdGVtIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEl0ZW1PcHRpb25zICkge1xyXG5cclxuICAgIC8vIEFub3RoZXJJdGVtIG9wdGlvbnMgaGF2ZSB0aGUgc2FtZSB0eXBlIGFzIEl0ZW1PcHRpb25zLiBJdCBqdXN0IHNldHMgb25lIGRlZmF1bHQuIFRoaXMgZXhhbXBsZSBkb2Vzbid0IG1ha2UgaXQgZWFzeVxyXG4gICAgLy8gdG8gYWRkIFNlbGZPcHRpb25zIHRvIEFub3RoZXJJdGVtLCBvciB0byBleHBvcnQgQW5vdGhlckl0ZW1PcHRpb25zIGlmIG5lZWRlZCBlbHNld2hlcmUsIGJ1dCBmb3IgYVxyXG4gICAgLy8gbW9kdWxhci9zaW0tc3BlY2lmaWMgY2FzZSBjb3VsZCBiZSByZWFzb25hYmxlLlxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPEl0ZW1PcHRpb25zPigge1xyXG4gICAgICBzaXplOiAndmVyeUxhcmdlJ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFVTRV9BTl9JVEVNX09QVElPTlM6IFVzZUFuSXRlbU9wdGlvbnMgPSB7XHJcbiAgICBhbk9wdGlvbjogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIHVzZUFuSXRlbSggdXNlQW5JdGVtT3B0aW9ucz86IFVzZUFuSXRlbU9wdGlvbnMgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gSW4gdGhpcyBjYXNlLCB0aGVyZSBhcmUgbm8gXCJkZWZhdWx0c1wiIGFuZCB3ZSBkb24ndCBuZWVkIHRvIHByZXZlbnQgYGFuT3B0aW9uYCBmcm9tIGJlaW5nIHVuZGVmaW5lZCwgc28gY29tYmluZU9wdGlvbnNcclxuICAgIC8vIHdvcmtzIHdlbGwuXHJcbiAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8VXNlQW5JdGVtT3B0aW9ucz4oIHt9LCBBbm90aGVySXRlbS5VU0VfQU5fSVRFTV9PUFRJT05TLCB1c2VBbkl0ZW1PcHRpb25zICk7XHJcbiAgICBjb25zb2xlLmxvZyggb3B0aW9ucy5hbk9wdGlvbiApO1xyXG4gIH1cclxufVxyXG5cclxuaXRlbXMucHVzaCggbmV3IEFub3RoZXJJdGVtKCB7IHg6IDUgfSApICk7XHJcblxyXG4vLy8vLy8vLy9cclxuLy8gRXhhbXBsZSBGaWZ0ZWVuIC0gb21pdCByZXF1aXJlZCBwYXJlbnQgb3B0aW9uIGFuZCBzcGVjaWZ5IGluIGRlZmF1bHRzXHJcbi8vXHJcblxyXG50eXBlIEdhbGF4eUNsYXNzT3B0aW9ucyA9IHtcclxuICB3YXJwU3BlZWQ6IG51bWJlcjtcclxufTtcclxuXHJcbmNsYXNzIEdhbGF4eUNsYXNzIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRvcFNwZWVkOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9uczogR2FsYXh5Q2xhc3NPcHRpb25zICkge1xyXG4gICAgdGhpcy50b3BTcGVlZCA9IG9wdGlvbnMud2FycFNwZWVkO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBFbnRlcnByaXNlT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEdhbGF4eUNsYXNzT3B0aW9ucywgJ3dhcnBTcGVlZCc+O1xyXG5cclxuY2xhc3MgRW50ZXJwcmlzZUMgZXh0ZW5kcyBHYWxheHlDbGFzcyB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogRW50ZXJwcmlzZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTCAtIHdhcnBTcGVlZCBpcyByZXF1aXJlZCwgc28geW91IGNhbid0IGhhdmUgaXQgaW4gdGhlIGRlZmF1bHRzXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVudGVycHJpc2VPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBHYWxheHlDbGFzc09wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIHdhcnBTcGVlZDogMTAgLy8gYSBsYWNrIG9mIHRoaXMgb3B0aW9uIHNob3dzIHRoYXQgd2UgZG9uJ3QgaGF2ZSBhIHZhbHVlIGZvciBhIHJlcXVpcmVkIG9wdGlvbnNcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBFbnRlcnByaXNlRCBleHRlbmRzIEdhbGF4eUNsYXNzIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBFbnRlcnByaXNlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVudGVycHJpc2VPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBHYWxheHlDbGFzc09wdGlvbnM+KCkoIHtcclxuICAgICAgd2FycFNwZWVkOiAxMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnR5cGUgRW50ZXJwcmlzZUVPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucyAmIEdhbGF4eUNsYXNzT3B0aW9ucztcclxuXHJcbmNsYXNzIEVudGVycHJpc2VFIGV4dGVuZHMgR2FsYXh5Q2xhc3Mge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogRW50ZXJwcmlzZUVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RW50ZXJwcmlzZUVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBHYWxheHlDbGFzc09wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd2FycFNwZWVkIGlzIHJlcXVpcmVkLCBzbyB5b3UgY2FuJ3QgaGF2ZSBpdCBpbiB0aGUgZGVmYXVsdHNcclxuICAgICAgd2FycFNwZWVkOiAxMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnNvbGUubG9nKCBuZXcgRW50ZXJwcmlzZUMoKSApO1xyXG5jb25zb2xlLmxvZyggbmV3IEVudGVycHJpc2VEKCkgKTtcclxuY29uc29sZS5sb2coIG5ldyBFbnRlcnByaXNlRSggeyB3YXJwU3BlZWQ6IDEgfSApICk7XHJcblxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gQmVsb3cgaXMgYSBjbGFzcyBoaWVyYXJjaHkgbWVhbnQgdG8gZXhlcmNpc2UgdGhlIGNvbXBsZXRlIGZlYXR1cmUgc2V0IChhbmQgbGltaXRhdGlvbiBzZXQpIG9mIHRoZSBjdXJyZW50IG9wdGlvbnNcclxuLy8gcGF0dGVybi4gSXQgaXMgbXVjaCBtb3JlIGNvbXBsaWNhdGVkLCBhbmQgaXQgaXMgcmVjb21tZW5kZWQgdG8gc3RhcnQgaW4gdGhlIGFib3ZlIGV4YW1wbGVzLlxyXG5cclxudHlwZSBEb2dPcHRpb25zID0ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBhZ2U/OiBudW1iZXI7XHJcbiAgaXNHb29kPzogYm9vbGVhbjtcclxufTtcclxuXHJcbmNsYXNzIERvZyB7XHJcbiAgcHJpdmF0ZSBhZ2U6IG51bWJlcjtcclxuICBwcml2YXRlIG5hbWU6IHN0cmluZztcclxuICBwcml2YXRlIGlzR29vZD86IGJvb2xlYW47IC8vIE5vdGUgdGhhdCBzaW5jZSB0aGVyZSB3YXMgbm8gZGVmYXVsdCwgVHlwZXNjcmlwdCBrbm93cyBpdCBtdXN0IHN1cHBvcnQgdW5kZWZpbmVkXHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBEb2dPcHRpb25zICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEb2dPcHRpb25zLCBEb2dPcHRpb25zPigpKCB7XHJcbiAgICAgIGFnZTogMCxcclxuICAgICAgaXNHb29kOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICAgIHRoaXMuYWdlID0gb3B0aW9ucy5hZ2U7XHJcbiAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWU7XHJcblxyXG4gICAgdGhpcy5pc0dvb2QgPSBvcHRpb25zLmlzR29vZDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwcmludEFnZSgpOiB2b2lkIHtcclxuICAgIGNvbnNvbGUubG9nKCB0aGlzLmFnZSApO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBQZXJzb25TZWxmT3B0aW9ucyA9IHtcclxuICBuYW1lOiBzdHJpbmc7IC8vICgxKVxyXG4gIGhhc1NoaXJ0PzogYm9vbGVhbjtcclxuICBoZWlnaHQ/OiBudW1iZXI7XHJcbiAgYXR0aXR1ZGU/OiBzdHJpbmc7IC8vICg1KVxyXG4gIHBlcnNvbml0dWRlPzogc3RyaW5nO1xyXG5cclxuICAvLyAoNikgKEkpIElmIGl0IGlzIG9wdGlvbmFsIGhlcmUsIHRoZW4gaXQgYmV0dGVyIGJlIGluIHRoZSBkZWZhdWx0IG9wdGlvbnMgb3IgcHJvdmlkZWRPcHRpb25zLCBvdGhlcndpc2UsIGp1c3QgbWFrZVxyXG4gIC8vIGl0IHJlcXVpcmVkIGhlcmUgZm9yIG1vcmUgdHlwZSBzYWZldHkgYW5kIGxlc3MgZmxleGliaWxpdHkuXHJcbiAgZG9nT3B0aW9ucz86IFBhcnRpYWw8RG9nT3B0aW9ucz47XHJcbiAgYWdlPzogbnVtYmVyO1xyXG59O1xyXG5cclxudHlwZSBQZXJzb25PcHRpb25zID0gUGVyc29uU2VsZk9wdGlvbnM7IC8vIG5vIHBhcmVudCBvcHRpb25zXHJcblxyXG5jbGFzcyBQZXJzb24ge1xyXG4gIHByaXZhdGUgZG9nOiBEb2c7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBQZXJzb25PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGVyc29uT3B0aW9ucywgUGVyc29uU2VsZk9wdGlvbnM+KCkoIHtcclxuICAgICAgLy8gKDApICg3KSBOZXcgcGF0dGVybiBkb2Vzbid0IHVzZSBgcmVxdWlyZWQoKWAgZm9yIG5vbi1vcHRpb25hbCBvcHRpb25zLiAobGlrZSBmb3IgYG5hbWVgKVxyXG4gICAgICBoYXNTaGlydDogdHJ1ZSxcclxuICAgICAgaGVpZ2h0OiA3LCAvLyA8LS0gSSBjb21tZW50ZWQgdGhpcyBvdXQgdG8gc2VlIHRoaXMgRVJST1JcclxuICAgICAgYXR0aXR1ZGU6ICcnLFxyXG4gICAgICBwZXJzb25pdHVkZTogJ3ZlcnkgbXVjaCBzbycsXHJcbiAgICAgIGFnZTogMCxcclxuICAgICAgZG9nT3B0aW9uczogeyBpc0dvb2Q6IGZhbHNlIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgb3B0aW9ucy5kb2dPcHRpb25zO1xyXG4gICAgb3B0aW9ucy5hZ2U7XHJcbiAgICBvcHRpb25zLmhhc1NoaXJ0O1xyXG5cclxuICAgIC8vIExpbWl0YXRpb24gKEkpOiBub3RlIHRoYXQgaXNHb29kIGlzIG5vdCByZWNvZ25pemVkIGFzIGJlaW5nIGZpbGxlZCBpbiBiZWNhdXNlIG91ciBvcHRpb25pemUgZG9lc24ndCBrbm93IGFib3V0IG5lc3RlZCBvcHRpb25zLlxyXG4gICAgb3B0aW9ucy5kb2dPcHRpb25zLmlzR29vZDtcclxuXHJcbiAgICAvLyBMaW1pdGF0aW9uIChJKSBSZW1vdmUgdHlwZSBjYXN0IGJlY2F1c2UgbmFtZSBzaG91bGQgYmUga25vd24gdG8gY29tZSBmcm9tIHByb3ZpZGVkT3B0aW9ucy4gQWx0ZXJuYXRpdmVseSwgeW91IGNhbiBzcGVjaWZ5IGFzXHJcbiAgICAvLyBwYXJ0IG9mIFBlcnNvbk9wdGlvbnMgdGhhdCB3ZSBtdXN0IGdldCBkb2dPcHRpb25zLm5hbWUuIFRoaXMgY291bnRlcmFjdHMgdGhlIGBQYXJ0aWFsYCBhbmQgbGV0cyBpdCBiZSBrbm93biBpblxyXG4gICAgLy8gdGhlIFBlcnNvbiBjb25zdHJ1Y3RvciB0aGF0IGRvZ09wdGlvbnMgaXMgY29tcGxldGUgYXQgdGhpcyBwb2ludC5cclxuICAgIHRoaXMuZG9nID0gbmV3IERvZyggb3B0aW9ucy5kb2dPcHRpb25zIGFzIERvZ09wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnR5cGUgRW1wbG95ZWVTZWxmT3B0aW9ucyA9IHtcclxuICBpc0F3ZXNvbWU/OiBib29sZWFuO1xyXG4gIGlzUmVxdWlyZWRBd2Vzb21lOiBib29sZWFuO1xyXG4gIGFnZT86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgRW1wbG95ZWVPcHRpb25zID0gRW1wbG95ZWVTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UGVyc29uT3B0aW9ucywgJ2F0dGl0dWRlJz47XHJcblxyXG5jbGFzcyBFbXBsb3llZSBleHRlbmRzIFBlcnNvbiB7XHJcblxyXG4gIHByaXZhdGUgaXNBd2Vzb21lOiBib29sZWFuO1xyXG4gIHByaXZhdGUgaXNSZXF1aXJlZEF3ZXNvbWU6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBhZ2U6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IEVtcGxveWVlT3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBiZWZvcmUgb3B0aW9uaXplIGJlY2F1c2UgaXQgaXMgcmVxdWlyZWRcclxuICAgIGNvbnNvbGUubG9nKCBwcm92aWRlZE9wdGlvbnMuaXNSZXF1aXJlZEF3ZXNvbWUgKTtcclxuXHJcbiAgICAvLyBOb3QgcmVhbCBjb2RlLCBqdXN0IGZvciB0aGUgdHMtZXhwZWN0LWVycm9yIHdpdGhvdXQgcnVpbmluZyB0eXBlIGNoZWNraW5nIG9uIHRoZSBhY3R1YWwgb3B0aW9uaXplIGNhbGwuXHJcbiAgICBvcHRpb25pemU8RW1wbG95ZWVPcHRpb25zLCBFbXBsb3llZVNlbGZPcHRpb25zLCBQZXJzb25PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHlvdSBjYW5ub3QgcHJvdmlkZSBhIGRlZmF1bHQgZm9yIGEgcmVxdWlyZWQgb3B0aW9uXHJcbiAgICAgIGlzUmVxdWlyZWRBd2Vzb21lOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFbXBsb3llZU9wdGlvbnMsIEVtcGxveWVlU2VsZk9wdGlvbnMsIFBlcnNvbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgICAgaXNBd2Vzb21lOiB0cnVlLCAvLyAoMilcclxuICAgICAgICBoYXNTaGlydDogZmFsc2UsIC8vICgzKVxyXG4gICAgICAgIC8vIHBlcnNvbml0dWRlOiAnaGVsbG8nLCAvLyAoNCkuYVxyXG4gICAgICAgIC8vIHBlcnNvbml0dWRlOiBQRVJTT05fREVGQVVMVFMucGVyc29uaXR1ZGUgKDQpLmJcclxuICAgICAgICAvLyBhdHRpdHVkZTogJ2Nvb2wnIC8vICg1KS5hXHJcblxyXG4gICAgICAgIHBlcnNvbml0dWRlOiAncGVyc29uYWJsZScsXHJcbiAgICAgICAgYWdlOiA1LFxyXG4gICAgICAgIGRvZ09wdGlvbnM6IHtcclxuICAgICAgICAgIGlzR29vZDogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vICg0KS5jIFRoaXMgaXMgb25lIHdheSB0byBpbmRpY2F0ZSB0byB0aGUgdHlwZSBzeXN0ZW0gdGhhdCBwZXJzb25pdHVkZSB3aWxsIGJlIHVzZWQgaW4gdGhlIGNvbnN0cnVjdG9yXHJcbiAgICAgIC8vIChJSUkpIE5vdGUgdGhhdCBQRVJTT05fREVGQVVMVFMgbmVlZHMgYSB0eXBlIHdoZXJlIGRlZmluZWQsIGJlY2F1c2UgaXQgaXNuJ3QgYW4gb2JqZWN0IGxpdGVyYWwuXHJcbiAgICAgIC8vIFBFUlNPTl9ERUZBVUxUUyxcclxuICAgICAgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gKDUpIFVzZSBhIHN0cmF0ZWd5IGxpa2UgKDQpLmIgKDQpLmMgdG8gXCJ0ZWxsXCIgVHlwZVNjcmlwdCB0aGF0IG9wdGlvbnMgaGFzIGFuIGF0dGl0dWRlIGF0dHJpYnV0ZVxyXG4gICAgLy8gT3IganVzdCBkZWZpbmUgaXQgdGhlcmUgaW4gdGhlIGZpcnN0IHBsYWNlLCBsaWtlICg1KS5hXHJcbiAgICAvLyBvcHRpb25zLmF0dGl0dWRlID0gJ2Nvb2wnO1xyXG5cclxuICAgIC8vICg0KSBUaGlzIHdvdWxkIG9ubHkgd29yayBpZiB5b3Ugc3VwcGx5ICg0KShhKSAoYikgb3IgKGMpIGFib3ZlLlxyXG4gICAgLy8gY29uc3QgeDogc3RyaW5nID0gb3B0aW9ucy5wZXJzb25pdHVkZTtcclxuICAgIC8vIGNvbnNvbGUubG9nKCB4ICk7XHJcblxyXG4gICAgLy8gKElJKSBkb2dPcHRpb25zLmlzR29vZCBpcyBzdGlsbCBwb3RlbnRpYWxseSB1bmRlZmluZWQgd2hlbiB1c2luZyBpbiB0aGUgY29uc3RydWN0b3IsIGV2ZW4gdGhvdWdoIHdlIGFkZGVkIGBkb2dPcHRpb25zYCBhcyBhIGtleSBpbiB0aGUgdGhpcmQgYXJnXHJcbiAgICAvLyBjb25zb2xlLmxvZyggb3B0aW9ucy5kb2dPcHRpb25zLmlzR29vZCApO1xyXG5cclxuICAgIC8vICg0KSBJZiB5b3UgaGF2ZSBvcHRpb25hbCB1c2FnZSBzaXRlcyBpbiB0aGUgY29uc3RydWN0b3IsIHlvdSBjYW4gbGVhdmUgaXQgb3B0aW9uYWwgaW4gdGhlIG9wdGlvbml6ZSB0eXBlc1xyXG4gICAgY29uc3QgYTogc3RyaW5nIHwgdW5kZWZpbmVkID0gb3B0aW9ucy5wZXJzb25pdHVkZTtcclxuICAgIGNvbnNvbGUubG9nKCBhICk7XHJcblxyXG4gICAgLy8gKDQpIE9wdGlvbml6ZSBrbm93cyBhZ2UgaXMgZGVmaW5lZCBoZXJlIGJlY2F1c2UgaXQgaXMgb3B0aW9uYWwgaW4gRW1wbG95ZWVTZWxmT3B0aW9ucywgc28gaXQgbXVzdCBoYXZlIGEgZGVmYXVsdC5cclxuICAgIGNvbnNvbGUubG9nKCAnTXkgYWdlIGlzJywgb3B0aW9ucy5hZ2UgLSAxICk7IC8vIGNvb2wgcGVvcGxlIHNlZW0geW91bmdlclxyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5pc0F3ZXNvbWUgPSBvcHRpb25zLmlzQXdlc29tZTtcclxuICAgIHRoaXMuaXNSZXF1aXJlZEF3ZXNvbWUgPSBvcHRpb25zLmlzUmVxdWlyZWRBd2Vzb21lO1xyXG4gICAgdGhpcy5hZ2UgPSBvcHRpb25zLmFnZTtcclxuICB9XHJcbn1cclxuXHJcbnR5cGUgRW1wbG95ZWVPZlRoZU1vbnRoT3B0aW9ucyA9IFN0cmljdE9taXQ8RW1wbG95ZWVPcHRpb25zLCAnaXNSZXF1aXJlZEF3ZXNvbWUnPjtcclxuXHJcbmNsYXNzIEVtcGxveWVlT2ZUaGVNb250aCBleHRlbmRzIEVtcGxveWVlIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogRW1wbG95ZWVPZlRoZU1vbnRoT3B0aW9ucyApIHsgLy8gKDgpLCBub3RlIHRoYXQgaWYgb3B0aW9ucyBhcmUgb3B0aW9uYWwsIHRoZW4gdGhleSBnZXQgYSBxdWVzdGlvbiBtYXJrIGhlcmUuXHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFbXBsb3llZU9mVGhlTW9udGhPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBFbXBsb3llZU9wdGlvbnM+KCkoIHtcclxuICAgICAgLy8gbmFtZTogJ0JvYicsIC8vIExpbWl0YXRpb24gKEkpIHdoeSBkb2Vzbid0IHRoaXMgZmFpbCB3aGVuIGNvbW1lbnRlZCBvdXQhIEl0IGlzIGEgcmVxdWlyZWQgYXJndW1lbnQgdG8gRW1wbG95ZWVPcHRpb25zIGJ1dCBwcm92aWRlZE9wdGlvbnMgaXMgb3B0aW9uYWw/ICBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1jb3JlL2lzc3Vlcy8xMjhcclxuICAgICAgaXNSZXF1aXJlZEF3ZXNvbWU6IHRydWVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBXaWxkZXJPcHRpb25zUGF0dGVybnMge1xyXG4gIHByaXZhdGUgYm9iOiBFbXBsb3llZTtcclxuICBwcml2YXRlIGNoYXJsaWU6IEVtcGxveWVlO1xyXG4gIHByaXZhdGUgc2FtYW5hbnRoYTogRW1wbG95ZWU7XHJcbiAgcHJpdmF0ZSB0ZWxhOiBFbXBsb3llZTtcclxuICBwcml2YXRlIGFsaWNlOiBFbXBsb3llZU9mVGhlTW9udGg7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICB0aGlzLmJvYiA9IG5ldyBFbXBsb3llZSgge1xyXG4gICAgICBpc1JlcXVpcmVkQXdlc29tZTogdHJ1ZSwgLy8gKDIpXHJcbiAgICAgIGlzQXdlc29tZTogZmFsc2UsIC8vICgyKVxyXG4gICAgICBkb2dPcHRpb25zOiB7IGFnZTogMywgbmFtZTogJ2RvZyBuYW1lJyB9LFxyXG4gICAgICBuYW1lOiAnQm9iJyAvLyAoMSlcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNoYXJsaWUgPSBuZXcgRW1wbG95ZWUoIHtcclxuICAgICAgaXNSZXF1aXJlZEF3ZXNvbWU6IHRydWUsIC8vICgyKVxyXG4gICAgICBpc0F3ZXNvbWU6IGZhbHNlLCAvLyAoMilcclxuICAgICAgbmFtZTogJ0NoYXJsaWUnLCAvLyAoMSkgaWYgeW91IGNvbW1lbnQgdGhpcyBvdXQsIGl0IHdpbGwgYmUgYW4gZXJyb3IgYmVjYXVzZSBpdCBpcyBhIHJlcXVpcmVkIG9wdGlvblxyXG4gICAgICBoZWlnaHQ6IDQ5LCAvLyAoMSlcclxuICAgICAgaGFzU2hpcnQ6IHRydWUsIC8vICgzKVxyXG4gICAgICBkb2dPcHRpb25zOiB7IG5hbWU6ICdvdGhlciBkb2cgbmFtZScgfSxcclxuXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUwgY291bnRyeU9mT3JpZ2luIGlzIG5vdCBpbiBhbnkga25vd24gb3B0aW9uc1xyXG4gICAgICBjb3VudHJ5T2ZPcmlnaW46ICdhbWVyaWNhJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc2FtYW5hbnRoYSA9IG5ldyBFbXBsb3llZSgge1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTCAvLyAoNSkgbm90IGFsbG93ZWQgaW4gRW1wbG95ZWVPcHRpb25zXHJcbiAgICAgIGF0dGl0dWRlOiAncHJldHR5IGZyZWFraW5nIG5pY2UnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTCBuZWVkcyBhIGlzUmVxdWlyZWRBd2Vzb21lXHJcbiAgICB0aGlzLnNhbWFuYW50aGEgPSBuZXcgRW1wbG95ZWUoIHtcclxuICAgICAgbmFtZTogJ1NhbWFuYW50aGEnIC8vICgxKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUwgbmVlZHMgYSBuYW1lXHJcbiAgICB0aGlzLnRlbGEgPSBuZXcgRW1wbG95ZWUoIHtcclxuICAgICAgaXNSZXF1aXJlZEF3ZXNvbWU6IHRydWUgLy8gKDEpXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hbGljZSA9IG5ldyBFbXBsb3llZU9mVGhlTW9udGgoIHtcclxuICAgICAgbmFtZTogJ01lbGlzc2EnIC8vICg4KSBpZiBub3QgZm9yIGxpbWl0YXRpb24gKEkpLCBFbXBsb3llZU9mVGhlTW9udGggd291bGQgYWx3YXlzIGhhdmUgbmFtZSAnQm9iJ1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxud2lsZGVyLnJlZ2lzdGVyKCAnV2lsZGVyT3B0aW9uc1BhdHRlcm5zJywgV2lsZGVyT3B0aW9uc1BhdHRlcm5zICk7XHJcbmV4cG9ydCBkZWZhdWx0IFdpbGRlck9wdGlvbnNQYXR0ZXJuczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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