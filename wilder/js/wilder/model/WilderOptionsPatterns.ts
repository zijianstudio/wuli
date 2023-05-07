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

import optionize, { combineOptions, EmptySelfOptions, optionize3, OptionizeDefaults } from '../../../../phet-core/js/optionize.js';
import merge from '../../../../phet-core/js/merge.js';
import WithOptional from '../../../../phet-core/js/types/WithOptional.js';
import wilder from '../../wilder.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

////////////////////////////////////////////////////////////////////////////////////////////////
// Basic Examples that utilize common PhET options patterns.

// Here is a classic Super class implementation, let's call it Item

type ItemOptions = {
  children?: Item[];
  x?: number;
  y?: number;
  size?: number | 'veryLarge';
};

class Item {
  private children: Item[];
  private x: number;
  private y: number;

  public constructor( providedOptions?: ItemOptions ) {

    // In the simplest case, optionize just takes the options that this class defines.
    const options = optionize<ItemOptions>()( {
      children: [],
      x: 0,
      y: 0,
      size: 5
    }, providedOptions );
    this.children = options.children;
    this.x = options.x;
    this.y = options.y;
  }

  public getChildren(): Item[] {
    return this.children;
  }
}

const items: Item[] = [];


////////
// Example One: Basic subtype creates options and uses supertype options:

// The convention is to name this private type "SelfOptions", though naming collisions below cause us to name them
// specific to each class.
type SelfOptions = {
  mySpecialNumber?: number;
};

type MyItemOptions = SelfOptions & ItemOptions;

class MyItem extends Item {
  private mySpecialNumber: number;

  public constructor( providedOptions?: MyItemOptions ) {

    // Here optionize takes all options that it defines, and also its parent options so that those are allowed to be
    // passed through the super call. By default, optionize knows what the combined type of "providedOptions" (defaults
    // to SelfOptions & ParentOptions).
    const options = optionize<MyItemOptions, SelfOptions, ItemOptions>()( {
      mySpecialNumber: 2,
      x: 10,

      // @ts-expect-error INTENTIONAL - optionize knows what options from this class and the parent are allowed, and no others are accepted.
      blarg: false
    }, providedOptions );

    super( options );
    this.myItemTest( options.mySpecialNumber );
    this.myItemTest( options.x );

    // TODO: y?: number should behave like number|undefined, can we please have a @ts-expect-error on this?, https://github.com/phetsims/phet-core/issues/128
    //  this should most definitely be considered number|undefined, but for some reason `y?: number` is not wrong here.
    this.myItemTest( options.y );

    this.mySpecialNumber = options.mySpecialNumber;
  }

  private myItemTest( hi: number ): void {
    console.log( hi );
  }
}

items.push( new MyItem() );
items.push( new MyItem( { mySpecialNumber: 4 } ) );
items.push( new MyItem( { x: 100, y: 100 } ) );


////////
// Example Two: A Required parameter

type TreeItemSelfOptions = {
  treeType: 'cedar' | 'pine';
};
type TreeItemOptions = TreeItemSelfOptions & ItemOptions;

class TreeItem extends Item {
  private treeType: TreeItemSelfOptions[ 'treeType' ];

  public constructor( providedOptions: TreeItemOptions ) {
    const options = optionize<TreeItemOptions, TreeItemSelfOptions, ItemOptions>()( {}, providedOptions );
    super( options );
    this.treeType = options.treeType;
  }
}

// @ts-expect-error INTENTIONAL required parameter
items.push( new TreeItem() );
items.push( new TreeItem( { treeType: 'cedar' } ) );
items.push( new TreeItem( {
  treeType: 'pine',
  children: [ new Item() ]
} ) );


////////
// Example Three: nested options
type ItemContainerOptions = {
  nodeOptions?: ItemOptions;
};

class ItemContainer {
  private node: Item;

  public constructor( providedOptions: ItemContainerOptions ) {
    const options = optionize<ItemContainerOptions>()( {
      nodeOptions: {
        x: 5,
        y: 5
      }
    }, providedOptions );

    this.node = new Item( options.nodeOptions );
  }
}

const container = new ItemContainer( {
  nodeOptions: {
    children: [ new MyItem() ]
  }
} );
console.log( container );

////////
// Example Three Prime: nested options where you do not provide defaults for them.
type ItemContainer2Options = {
  nodeOptions?: ItemOptions;
};

class ItemContainer2 {
  private node: Item;

  public constructor( providedOptions: ItemContainer2Options ) {

    // TODO: Explicitly omit here until we can work out a way for optionize to detect nested options directly. https://github.com/phetsims/phet-core/issues/128
    const options = optionize<ItemContainer2Options, StrictOmit<ItemContainer2Options, 'nodeOptions'>>()( {}, providedOptions );

    this.node = new Item( options.nodeOptions );
  }
}

const container2 = new ItemContainer2( {
  nodeOptions: {
    children: [ new MyItem() ]
  }
} );
console.log( container2 );


////////
// Example Four: Narrowing parent options' scope

type StationaryItemSelfOptions = EmptySelfOptions;

// Another way to do this in this case would be Pick<ItemOptions, 'children'>, depending on opt-in/opt-out preference for narrowing API
type StationaryItemOptions = StationaryItemSelfOptions & StrictOmit<ItemOptions, 'x' | 'y'>;

class StationaryItem extends Item {
  public constructor( providedOptions?: StationaryItemOptions ) {

    // Here, since there are no self options, and instead just modified parent options, pass the public options in as the parent options
    const options = optionize<StationaryItemOptions, StationaryItemSelfOptions, ItemOptions>()( {}, providedOptions );

    super( options );
  }
}

items.push( new StationaryItem() );

// @ts-expect-error INTENTIONAL x is not in StationaryItemOptions
items.push( new StationaryItem( { x: 6 } ) );

////////
// Example Five: Using a parent option in the subtype constructor

type ChildrenAdapterItemSelfOptions = EmptySelfOptions;

// It is a bit safer in common code to keep this alias, even when identical. This way, if you export your public
// options, you don't skip a level and need to do a global refactor if you want to add an option to this subtype.
type ChildrenAdapterItemOptions = ChildrenAdapterItemSelfOptions & ItemOptions;

class ChildrenAdapterItem extends Item {
  public constructor( providedOptions?: ChildrenAdapterItemOptions ) {

    // Adding the third argument makes sure that children is known to be defined, for usage later in the constructor
    const options = optionize<ChildrenAdapterItemOptions, ChildrenAdapterItemSelfOptions, ItemOptions>()( {
      children: [ new MyItem() ]
    }, providedOptions );

    // TODO: options.children should not be optional, https://github.com/phetsims/phet-core/issues/128
    // Without the 'children' type in optionize, typescript would think that options.children could be undefined
    options.children.push( new MyItem() );

    super( options );
    this.hello( options.children );
  }

  public hello( items: Item[] ): void {
    console.log( 'hi', items );
  }
}

items.push( new ChildrenAdapterItem() );
items.push( new ChildrenAdapterItem( { children: [ new MyItem() ] } ) );
items.push( new ChildrenAdapterItem( { children: [ new MyItem() ], x: 10, y: 10 } ) );


////////
// Example Six: Using a DEFAULTS* variable instead of an object literal, please note this explains Limitation (III).

// Another way to do this in this case would be Pick<ItemOptions, 'children'>, depending on opt-in/opt-out preference for narrowing API
type OtherItemSelfOptions = {
  thing?: number;
  stuff?: string;
};

type OtherItemOptions = OtherItemSelfOptions & ItemOptions;

class OtherItem extends Item {
  public constructor( providedOptions?: OtherItemOptions ) {

    // NOTE: You must apply a type here in order to get "blarg" to error when uncommented
    const OTHER_ITEM_DEFAULTS: OptionizeDefaults<OtherItemSelfOptions, ItemOptions> = {
      thing: 10,
      stuff: 'some stuff',
      x: 10,
      y: 10,

      // @ts-expect-error INTENTIONAL - only known keys
      blarg: 'hi'
    };

    // Here, since there are no self options, and instead just modified parent options, pass the public options in as the parent options
    const options = optionize3<OtherItemOptions, OtherItemSelfOptions, ItemOptions>()( {}, OTHER_ITEM_DEFAULTS, providedOptions );

    super( options );

    this.test( options.x );
    this.test( options.thing );

    // TODO: this should be a @ts-expect-error INTENTIONAL - it can't think that non-provided options are not defined, likely unfixable but still, https://github.com/phetsims/phet-core/issues/128
    this.test2( options.size );

    // @ts-expect-error INTENTIONAL - even though x is defined, OptionizeDefaults doesn't know what ItemOptions were provided in
    // the object literal. This is an example of a ts-expect-error that may be nice to remove in the future, but
    // currently demonstrates the optionize behavior.
    this.test( OTHER_ITEM_DEFAULTS.x );

    // @ts-expect-error INTENTIONAL - could be undefined
    this.test2( OTHER_ITEM_DEFAULTS.size );
  }

  public test( x: number ): void {
    console.log( x );
  }

  public test2( x: number | 'veryLarge' ): void {
    console.log( x );
  }
}

items.push( new OtherItem() );

////////
// Example Seven: Everything is required

// Another way to do this in this case would be Pick<ItemOptions, 'children'>, depending on opt-in/opt-out preference for narrowing API
type RequiredThingOptions = {
  requiredNumber: number;
  requiredString: string;
  optional?: number; // Uncomment to get the error in the optionize defaults.
};


class RequiredThing {
  public constructor( providedOptions?: RequiredThingOptions ) {

    // Here, since there are no self options, and instead just modified parent options, pass the public options in as the parent options
    const options = optionize<RequiredThingOptions>()( {

      // @ts-expect-error INTENTIONAL - this should error, it is required and shouldn't have a default
      requiredNumber: 10
    }, providedOptions );

    console.log( options.requiredNumber );
  }
}

console.log( new RequiredThing() );

////////
// Example Eight: An option is generic

class MyGeneric<G> {
  private optionalThing: G | undefined;

  public constructor( optionalThing?: G ) {
    this.optionalThing = optionalThing;
  }
}

type WrapTypeOptions<T> = {
  favoriteGeneric?: MyGeneric<T>;
};


class WrapType<T> {
  public favoriteGeneric: MyGeneric<T>;

  public constructor( providedOptions?: WrapTypeOptions<T> ) {
    const options = optionize<WrapTypeOptions<T>, WrapTypeOptions<T>>()( {
      favoriteGeneric: new MyGeneric<T>()
    }, providedOptions );

    this.favoriteGeneric = options.favoriteGeneric;
  }

  public getFavoriteItemProperty(): MyGeneric<T> {
    return this.favoriteGeneric;
  }
}

console.log( new WrapType() );
console.log( new WrapType( {
  favoriteGeneric: new MyGeneric<boolean>( true )
} ) );
console.log( new WrapType( {
  favoriteGeneric: new MyGeneric<boolean>()
} ) );

////////
// Example Nine: Supertype has a required option and subtype makes that option optional with a default.
type HowSuper = 'totally' | 'a bit' | 'no, not really';

type SuperOptions = {
  howSuper: HowSuper;
};

class Super {
  private readonly howSuper: HowSuper;

  public constructor( providedOptions: SuperOptions ) {
    this.howSuper = providedOptions.howSuper;
  }

  public isSuper(): HowSuper {
    return this.howSuper;
  }
}

type KingSelfOptions = {
  hasGoodGroceries?: boolean;
};
type KingOptions = KingSelfOptions & WithOptional<SuperOptions, 'howSuper'>;

class King extends Super {
  public constructor( providedOptions?: KingOptions ) {
    const options = optionize<KingOptions, KingSelfOptions, SuperOptions>()( {
      howSuper: 'totally',
      hasGoodGroceries: true
    }, providedOptions );
    super( options );
  }
}

const kingSuper1 = new King( {
  hasGoodGroceries: true,
  howSuper: 'a bit'
} );

const kingSuper2 = new King( {
  hasGoodGroceries: false
} );
console.log( kingSuper1 );
console.log( kingSuper2 );


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

type BlueItemSelfOptions = {
  isSad?: string;
};
type BlutItemOptions = BlueItemSelfOptions & ItemOptions;

class BlueItem extends Item {
  public constructor( providedOptions?: BlutItemOptions ) {

    // NOTE: isSad can be provided either via the SIM_CONSTANTS objec, or in the object literal, but TypeScript knows
    // if you leave it out entirely.
    const defaults: OptionizeDefaults<BlueItemSelfOptions, ItemOptions> = merge( {}, SIM_CONSTANTS.ITEM_CONSTANTS, {
      y: 10,
      isSad: 'always'
    } );

    const options = optionize3<BlutItemOptions, BlueItemSelfOptions, ItemOptions>()( {}, defaults, providedOptions );

    super( options );

    this.test( options.isSad );
  }

  public test( isSad: string ): void {
    console.log( isSad );
  }
}

items.push( new BlueItem() );


////////
// Example Eleven: demonstrating Limitation (IV)

type LargeItemSelfOptions = {
  size?: number;
};

type LargeItemOptions = LargeItemSelfOptions & ItemOptions;

class LargeItem extends Item {
  public constructor( providedOptions?: LargeItemOptions ) {

    const options = optionize<LargeItemOptions, LargeItemSelfOptions, ItemOptions>()( {

      // Limitation (IV), I cannot use the type from ItemOptions, but instead I'm internally limited to the public
      // narrowing API of just number.
      // size: 'veryLarge'
      size: 4 // TODO: delete this and use 'veryLarge' above instead, https://github.com/phetsims/phet-core/issues/128

    }, providedOptions );

    super( options );
  }
}

// items.push( new LargeItem( { size: 'veryLarge' } ) ); // fails, good!
items.push( new LargeItem( { size: 7 } ) );

//////////////////////////////////
//////////////////////////////////
// Examples using combineOptions

/////////
// Example Twelve: Use combineOptions when passing options to a composed class (example also in design patterns doc)

type MemberOfComposedClassSelfOptions = EmptySelfOptions;
type MemberOfComposedClassOptions = {
  oneOption?: boolean;
};

class MemberOfComposedClass {
  public constructor( providedOptions?: MemberOfComposedClassOptions ) {
    const options = optionize<MemberOfComposedClassOptions, MemberOfComposedClassSelfOptions>()( {
      oneOption: false
    }, providedOptions );

    console.log( options );
  }
}

type ThingWithComposedClassOptions = {
  childOptions: MemberOfComposedClassOptions;
};

class ThingWithComposedClass {
  private readonly member: MemberOfComposedClass;

  // childOptions are required, so no need to optionize. But that could easily be done if needed.
  public constructor( providedOptions: ThingWithComposedClassOptions ) {

    this.member = new MemberOfComposedClass( combineOptions<MemberOfComposedClassOptions>( {
      oneOption: true
    }, providedOptions.childOptions ) );

  }
}

console.log( new ThingWithComposedClass( { childOptions: {} } ) );

/////////
// Example Thirteen
//
// Use combineOptions in multiple ways to sprinkle in more options after the initial optionize call while keeping the
// same type from the optionize return type.
// 1. For nested options
// 2. For options that depend on other options
//

type HandleOptions = {
  length: number; // 0 to 5 units
};

class Handle {
  private readonly length: number;

  public constructor( providedOptions?: HandleOptions ) {
    const options = optionize<HandleOptions>()( {

      // @ts-expect-error length is required, so it shouldn't get a default
      length: 2
    }, providedOptions );

    this.length = options.length;
  }
}

type CoffeeCupOptions = {
  handleOptions?: HandleOptions;
  percentFilled?: number;
  isABigCup?: boolean;
};

class CoffeeCup {
  private readonly handle: Handle;

  public constructor( providedOptions?: CoffeeCupOptions ) {

    // Feel free to name "initial" to house the type returned from optionize
    const initialOptions = optionize<CoffeeCupOptions, StrictOmit<CoffeeCupOptions, 'handleOptions' | 'isABigCup'>>()( {
      percentFilled: 30
    }, providedOptions );

    // combineOptions can be helpful when providing defaults to nestedOptions.
    initialOptions.handleOptions = combineOptions<HandleOptions>( {
      length: 4 // CoffeeCups have larger handles
    }, initialOptions.handleOptions );

    // combineOptions can be used when you want to add in options that depend on other options
    const options: typeof initialOptions = combineOptions<typeof initialOptions>( {
      isABigCup: initialOptions.percentFilled > 50 // big cups start over half full
    } );

    this.handle = new Handle( options.handleOptions );
  }
}

console.log( new CoffeeCup() );

/////////
// Example Fourteen
//
// combineOptions can be a bit of a shortcut when you have enough context about the specific use case. Here combineOptions
// is used in a couple different ways where optionize may be more scalable or maintainable (like if in common code), but
// if needed combineOptions can be simpler.

type UseAnItemOptions = {
  anOption?: boolean;
};

class AnotherItem extends Item {
  public constructor( providedOptions?: ItemOptions ) {

    // AnotherItem options have the same type as ItemOptions. It just sets one default. This example doesn't make it easy
    // to add SelfOptions to AnotherItem, or to export AnotherItemOptions if needed elsewhere, but for a
    // modular/sim-specific case could be reasonable.
    const options = combineOptions<ItemOptions>( {
      size: 'veryLarge'
    }, providedOptions );

    super( options );
  }

  private static readonly USE_AN_ITEM_OPTIONS: UseAnItemOptions = {
    anOption: true
  };

  private static useAnItem( useAnItemOptions?: UseAnItemOptions ): void {

    // In this case, there are no "defaults" and we don't need to prevent `anOption` from being undefined, so combineOptions
    // works well.
    const options = combineOptions<UseAnItemOptions>( {}, AnotherItem.USE_AN_ITEM_OPTIONS, useAnItemOptions );
    console.log( options.anOption );
  }
}

items.push( new AnotherItem( { x: 5 } ) );

/////////
// Example Fifteen - omit required parent option and specify in defaults
//

type GalaxyClassOptions = {
  warpSpeed: number;
};

class GalaxyClass {
  private readonly topSpeed: number;

  public constructor( options: GalaxyClassOptions ) {
    this.topSpeed = options.warpSpeed;
  }
}

type EnterpriseOptions = EmptySelfOptions & StrictOmit<GalaxyClassOptions, 'warpSpeed'>;

class EnterpriseC extends GalaxyClass {

  public constructor( providedOptions?: EnterpriseOptions ) {

    // @ts-expect-error INTENTIONAL - warpSpeed is required, so you can't have it in the defaults
    const options = optionize<EnterpriseOptions, EmptySelfOptions, GalaxyClassOptions>()( {

      // warpSpeed: 10 // a lack of this option shows that we don't have a value for a required options
    }, providedOptions );

    super( options );
  }
}

class EnterpriseD extends GalaxyClass {

  public constructor( providedOptions?: EnterpriseOptions ) {

    const options = optionize<EnterpriseOptions, EmptySelfOptions, GalaxyClassOptions>()( {
      warpSpeed: 10
    }, providedOptions );

    super( options );
  }
}

type EnterpriseEOptions = EmptySelfOptions & GalaxyClassOptions;

class EnterpriseE extends GalaxyClass {

  public constructor( providedOptions: EnterpriseEOptions ) {

    const options = optionize<EnterpriseEOptions, EmptySelfOptions, GalaxyClassOptions>()( {

      // @ts-expect-error warpSpeed is required, so you can't have it in the defaults
      warpSpeed: 10
    }, providedOptions );

    super( options );
  }
}

console.log( new EnterpriseC() );
console.log( new EnterpriseD() );
console.log( new EnterpriseE( { warpSpeed: 1 } ) );

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// Below is a class hierarchy meant to exercise the complete feature set (and limitation set) of the current options
// pattern. It is much more complicated, and it is recommended to start in the above examples.

type DogOptions = {
  name: string;
  age?: number;
  isGood?: boolean;
};

class Dog {
  private age: number;
  private name: string;
  private isGood?: boolean; // Note that since there was no default, Typescript knows it must support undefined

  public constructor( providedOptions: DogOptions ) {
    const options = optionize<DogOptions, DogOptions>()( {
      age: 0,
      isGood: true
    }, providedOptions );
    this.age = options.age;
    this.name = options.name;

    this.isGood = options.isGood;
  }

  public printAge(): void {
    console.log( this.age );
  }
}

type PersonSelfOptions = {
  name: string; // (1)
  hasShirt?: boolean;
  height?: number;
  attitude?: string; // (5)
  personitude?: string;

  // (6) (I) If it is optional here, then it better be in the default options or providedOptions, otherwise, just make
  // it required here for more type safety and less flexibility.
  dogOptions?: Partial<DogOptions>;
  age?: number;
};

type PersonOptions = PersonSelfOptions; // no parent options

class Person {
  private dog: Dog;

  public constructor( providedOptions: PersonOptions ) {

    const options = optionize<PersonOptions, PersonSelfOptions>()( {
      // (0) (7) New pattern doesn't use `required()` for non-optional options. (like for `name`)
      hasShirt: true,
      height: 7, // <-- I commented this out to see this ERROR
      attitude: '',
      personitude: 'very much so',
      age: 0,
      dogOptions: { isGood: false }
    }, providedOptions );
    options.dogOptions;
    options.age;
    options.hasShirt;

    // Limitation (I): note that isGood is not recognized as being filled in because our optionize doesn't know about nested options.
    options.dogOptions.isGood;

    // Limitation (I) Remove type cast because name should be known to come from providedOptions. Alternatively, you can specify as
    // part of PersonOptions that we must get dogOptions.name. This counteracts the `Partial` and lets it be known in
    // the Person constructor that dogOptions is complete at this point.
    this.dog = new Dog( options.dogOptions as DogOptions );
  }
}

type EmployeeSelfOptions = {
  isAwesome?: boolean;
  isRequiredAwesome: boolean;
  age?: number;
};

type EmployeeOptions = EmployeeSelfOptions & StrictOmit<PersonOptions, 'attitude'>;

class Employee extends Person {

  private isAwesome: boolean;
  private isRequiredAwesome: boolean;
  private age: number;

  public constructor( providedOptions: EmployeeOptions ) {

    // before optionize because it is required
    console.log( providedOptions.isRequiredAwesome );

    // Not real code, just for the ts-expect-error without ruining type checking on the actual optionize call.
    optionize<EmployeeOptions, EmployeeSelfOptions, PersonOptions>()( {

      // @ts-expect-error you cannot provide a default for a required option
      isRequiredAwesome: true
    } );

    const options = optionize<EmployeeOptions, EmployeeSelfOptions, PersonOptions>()( {

        isAwesome: true, // (2)
        hasShirt: false, // (3)
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
      providedOptions );

    // (5) Use a strategy like (4).b (4).c to "tell" TypeScript that options has an attitude attribute
    // Or just define it there in the first place, like (5).a
    // options.attitude = 'cool';

    // (4) This would only work if you supply (4)(a) (b) or (c) above.
    // const x: string = options.personitude;
    // console.log( x );

    // (II) dogOptions.isGood is still potentially undefined when using in the constructor, even though we added `dogOptions` as a key in the third arg
    // console.log( options.dogOptions.isGood );

    // (4) If you have optional usage sites in the constructor, you can leave it optional in the optionize types
    const a: string | undefined = options.personitude;
    console.log( a );

    // (4) Optionize knows age is defined here because it is optional in EmployeeSelfOptions, so it must have a default.
    console.log( 'My age is', options.age - 1 ); // cool people seem younger

    super( options );

    this.isAwesome = options.isAwesome;
    this.isRequiredAwesome = options.isRequiredAwesome;
    this.age = options.age;
  }
}

type EmployeeOfTheMonthOptions = StrictOmit<EmployeeOptions, 'isRequiredAwesome'>;

class EmployeeOfTheMonth extends Employee {
  public constructor( providedOptions: EmployeeOfTheMonthOptions ) { // (8), note that if options are optional, then they get a question mark here.

    const options = optionize<EmployeeOfTheMonthOptions, EmptySelfOptions, EmployeeOptions>()( {
      // name: 'Bob', // Limitation (I) why doesn't this fail when commented out! It is a required argument to EmployeeOptions but providedOptions is optional?  https://github.com/phetsims/phet-core/issues/128
      isRequiredAwesome: true
    }, providedOptions );

    super( options );
  }
}

class WilderOptionsPatterns {
  private bob: Employee;
  private charlie: Employee;
  private samanantha: Employee;
  private tela: Employee;
  private alice: EmployeeOfTheMonth;

  public constructor() {

    this.bob = new Employee( {
      isRequiredAwesome: true, // (2)
      isAwesome: false, // (2)
      dogOptions: { age: 3, name: 'dog name' },
      name: 'Bob' // (1)
    } );

    this.charlie = new Employee( {
      isRequiredAwesome: true, // (2)
      isAwesome: false, // (2)
      name: 'Charlie', // (1) if you comment this out, it will be an error because it is a required option
      height: 49, // (1)
      hasShirt: true, // (3)
      dogOptions: { name: 'other dog name' },

      // @ts-expect-error INTENTIONAL countryOfOrigin is not in any known options
      countryOfOrigin: 'america'
    } );

    this.samanantha = new Employee( {

      // @ts-expect-error INTENTIONAL // (5) not allowed in EmployeeOptions
      attitude: 'pretty freaking nice'
    } );

    // @ts-expect-error INTENTIONAL needs a isRequiredAwesome
    this.samanantha = new Employee( {
      name: 'Samanantha' // (1)
    } );

    // @ts-expect-error INTENTIONAL needs a name
    this.tela = new Employee( {
      isRequiredAwesome: true // (1)
    } );

    this.alice = new EmployeeOfTheMonth( {
      name: 'Melissa' // (8) if not for limitation (I), EmployeeOfTheMonth would always have name 'Bob'
    } );
  }
}

wilder.register( 'WilderOptionsPatterns', WilderOptionsPatterns );
export default WilderOptionsPatterns;