//////////////////////////////////////////////////////////////////////////////
// [print][] npm package v1.0.1
// ===========================================================================
// 
// [print]: https://www.npmjs.com/package/print
// 
// Originally yanked from
// 
// https://raw.githubusercontent.com/Alhadis/Print/v1.0.1/print.js
// 
// Which, like all good things, is:
// 
// 		Copyright (c) 2016-2018, John Gardner (https://github.com/Alhadis)
// 		[ISC License](https://github.com/Alhadis/Print/blob/master/LICENSE.md)
// 
// Coppied here 'cause meteor is on fuckin' node v4.5.0 and print wants node
// >=6.0.0 so we'll pass the source through babel.
// 
// UPDATE 2019-07-26
// ---------------------------------------------------------------------------
// 
// So since Meteor is approximately dead and reasonably gone, it would 
// probably work just fine to depend on [print][] at this point. And it does
// look like Johnny has added some nice new fixes and features since we last 
// visited. TODO.
// 
//////////////////////////////////////////////////////////////////////////////


// Function Definitions
// ===========================================================================

/**
 * Produce a string that says something about what "type" a value is.
 * 
 * You know how sometimes you see a string that looks like
 * 
 * 		[object Date]
 * 
 * or so? Yeah, I'm not sure exactly when it turns up naturally either, but this
 * function makes it happen, pulls out the second part, and sends it back to 
 * you.
 * 
 * Hey, it's something, right?
 * 
 * @param {*} input - Whatever.
 * 
 * @return {string} - Something about the type of `input` that's at least better
 * than `typeof`.
 */
function type( input ) {
	const string = Object.prototype.toString.call( input );
	
	let name;
	
	if (string.startsWith( '[object ' ) &&
			string.endsWith( ']' )) {
				name = string.slice( 8, string.length - 1 );
	} else {
		return string;
	}
	
	return name;
} // name()


/**
 * Generate a human-readable representation of a value.
 *
 * @param {Mixed}   input
 * @param {Object}  options          - Optional parameters
 * @param {Boolean} ampedSymbols     - Prefix Symbol-keyed properties with @@
 * @param {Mixed}   escapeChars      - Which characters are escaped in string values
 * @param {Number}  maxArrayLength   - Maximum number of array values to show before truncating
 * @param {Boolean} showArrayIndices - Show the index of each element in an array
 * @param {Boolean} showArrayLength  - Display an array's "length" property after its values
 * @param {Boolean} sortProps        - Alphabetise the enumerable properties of printed objects
 * @param {Array<*>|*} omit 					 - objects to omit from printing.
 * @return {String}
 */
function print(input, options = {}, /*…Internal:*/ name = "", refs = null){
	
	/** Handle options/defaults */
	let {
		ampedSymbols,
		escapeChars,
		maxArrayLength,
		showArrayIndices,
		showArrayLength,
		sortProps,
		omit
	} = options;
	
	ampedSymbols   = undefined === ampedSymbols   ? true : ampedSymbols;
	escapeChars    = undefined === escapeChars    ? /(?!\x20)\s|\\/g : escapeChars;
	sortProps      = undefined === sortProps      ? true  : sortProps;
	maxArrayLength = undefined === maxArrayLength ? 100   : (!+maxArrayLength ? false : maxArrayLength);
	
	if(omit !== undefined && !(omit instanceof Set)) {
		if (!Array.isArray(omit)) {
			omit = [omit];
		}
		omit = new Set(omit);
		
		options = {...options, omit};
	}

	if(escapeChars && "function" !== typeof escapeChars)
		escapeChars = (function(pattern){
			return function(input){
				return input.replace(pattern, function(char){
					switch(char){
						case "\f": return "\\f";
						case "\n": return "\\n";
						case "\r": return "\\r";
						case "\t": return "\\t";
						case "\v": return "\\v";
						case "\\": return "\\\\";
					}
					const cp  = char.codePointAt(0);
					const hex = cp.toString(16).toUpperCase();
					if(cp < 0xFF) return "\\x" + hex;
					return "\\u{" + hex + "}";
				});
			}
		}(escapeChars));
	
	
	/** Only thing that can't be checked with obvious methods */
	if(Number.isNaN(input)) return "NaN";
	
	/** Exact match */
	switch(input){
		
		/** Primitives */
		case null:      return "null";
		case undefined: return "undefined";
		case true:      return "true";
		case false:     return "false";
		
		/** "Special" values */
		case Math.E:                   return "Math.E";
		case Math.LN10:                return "Math.LN10";
		case Math.LN2:                 return "Math.LN2";
		case Math.LOG10E:              return "Math.LOG10E";
		case Math.LOG2E:               return "Math.LOG2E";
		case Math.PI:                  return "Math.PI";
		case Math.SQRT1_2:             return "Math.SQRT1_2";
		case Math.SQRT2:               return "Math.SQRT2";
		
		case Number.EPSILON:           return "Number.EPSILON";
		case Number.MIN_VALUE:         return "Number.MIN_VALUE";
		case Number.MAX_VALUE:         return "Number.MAX_VALUE";
		case Number.MIN_SAFE_INTEGER:  return "Number.MIN_SAFE_INTEGER";
		case Number.MAX_SAFE_INTEGER:  return "Number.MAX_SAFE_INTEGER";
		case Number.NEGATIVE_INFINITY: return "Number.NEGATIVE_INFINITY";
		case Number.POSITIVE_INFINITY: return "Number.POSITIVE_INFINITY";
	}
	
	/** Basic data types */
	const type = Object.prototype.toString.call(input);
	switch(type){
		case "[object Symbol]":
		case "[object Number]":  return input.toString();
		case "[object RegExp]":  return `/${input.source}/${input.flags}`;
		case "[object String]":{
			if(escapeChars)
				input = escapeChars(input);
			
			return `"${input}"`;
		}
		case "[object Date]": {
			return `Date("${ input }")`;
		}
	}
	
	/** omit references in omit option */
	if(omit !== undefined && omit.has(input)) {
		return "-> {omitted}";
	}
	
	/** Guard against circular references */
	refs = refs || new Map();
	if(refs.has(input))
		return "-> " + (refs.get(input) || "{input}");
	refs.set(input, name);
	
	
	/** Begin compiling some serious output */
	let output = "";
	let typeName = "";
	
	let arrayLike;
	let isFunc;
	let ignoreNumbers;
	let padBeforeProps;
	
	
	/** Maps */
	if("[object Map]" === type){
		typeName = "Map";
		
		if(input.size){
			padBeforeProps = true;
			
			let index = 0;
			for(let entry of input.entries()){
				const namePrefix  = (name ? name : "Map") + ".entries";
				const keyString   = `${index}.` + "key";
				const valueString = `${index}.` + "value";
				
				let [key, value] = entry;
				key   = print(key,   options, `${namePrefix}[${keyString}]`,   refs);
				value = print(value, options, `${namePrefix}[${valueString}]`, refs);
				
				/** Key */
				let delim = /^->\s/.test(key) ? " " : " => ";
				let str = keyString + delim + key;
				
				/** Value */
				delim   = /^->\s/.test(value) ? " " : " => ";
				str    += "\n" + valueString + delim + value;
				
				output += str + "\n\n";
				++index;
			}
			
			output = "\n" + output.replace(/(?:\n\s*\n)+$/m, "");
		}
	}
	
	
	/** Sets */
	else if("[object Set]" === type){
		typeName = "Set";
		
		if(input.size){
			padBeforeProps = true;
			
			let index  = 0;
			for(let value of input.values()){
				const valueName = (name ? name : "{input}") + ".entries[" + index + "]";
				value = print(value, options, valueName, refs);
				
				const delim = /^->\s/.test(value) ? " " : " => ";
				output += index + delim + value + "\n";
				++index;
			}
			
			output = "\n" + output.replace(/(?:\n\t*\n?)+$/, "");
		}
	}
	
	
	/** Objects, Arrays, and Functions */
	else{
		arrayLike     = "function" === typeof input[Symbol.iterator];
		isFunc        = "function" === typeof input;
		ignoreNumbers = !showArrayIndices && arrayLike;
	}
	
	
	/** Obtain a list of every (non-symbolic) property to show */
	let keys = Object.keys(input);
	
	/** Functions: Include name and arity */
	if(isFunc){
		if(-1 === keys.indexOf("name"))    keys.push("name");
		if(-1 === keys.indexOf("length"))  keys.push("length");
	}
	
	/** Errors: Include name and message */
	else if(input instanceof Error){
		if(-1 === keys.indexOf("name"))    keys.push("name");
		if(-1 === keys.indexOf("message")) keys.push("message");
	}
	
	/** Arrays: Add length if requested */
	else if(arrayLike && showArrayLength && -1 === keys.indexOf("length"))
		keys.push("length");
	

	/** Clip lengthy arrays to a sensible limit */
	let truncationNote = null;
	if(maxArrayLength !== false && arrayLike && input.length > maxArrayLength){
		keys = keys.filter(k => +k != k || +k < maxArrayLength);
		truncationNote = `\n\n… ${input.length - maxArrayLength} more values not shown\n`;
	}
	
	
	/** Alphabetise each property name */
	if(sortProps) keys = keys.sort((a, b) => {
		let A, B;
		
		/** Numbers: Compare algebraically */
		if(("0" == a || +a == a) && ("0" == b || +b == b)){
			A = +a;
			B = +b;
		}
		
		/** Anything else: Convert to lowercase */
		else{
			A = a.toLowerCase();
			B = b.toLowerCase();
		}
		
		if(A < B) return -1;
		if(A > B) return 1;
		return 0;
	});
	
	
	/** Insert a blank line if existing lines have been printed for this object */
	if(padBeforeProps && keys.length)
		output += "\n";
	
	
	/** Regular properties */
	for(let i = 0, l = keys.length; i < l; ++i){
		let key      = keys[i];
		
		/** Array's been truncated, and this is the first non-numeric key */
		if(null !== truncationNote && +key != key){
			output  += truncationNote;
			truncationNote = null;
		}
		
		let accessor = /\W|^\d+$/.test(key) ? `[${key}]` : (name ? "."+key : key);
		let value    = print(input[key], options, name + accessor, refs);
		output      += "\n";
		
		/** Arrays: Check if each value's index should be omitted */
		if(ignoreNumbers && /^\d+$/.test(key))
			output += value;
		
		/** Name: Value */
		else output += `${key}: ${value}`;
	}
	
	/** If we still have a truncation notice, it means there were only numerics to list */
	if(null !== truncationNote)
		output += truncationNote.replace(/\n+$/, "");
	
	
	/** Properties keyed by Symbols */
	let symbols = Object.getOwnPropertySymbols(input);
	if(sortProps) symbols = symbols.sort((a, b) => {
		const A = a.toString().toLowerCase();
		const B = b.toString().toLowerCase();
		if(A < B) return -1;
		if(A > B) return 1;
		return 0;
	});
	
	for(let i = 0, l = symbols.length; i < l; ++i){
		const symbol = symbols[i];
		let accessor = symbol.toString();
		let valName  = "[" + accessor + "]";
		
		/** Use a @@-prefixed form to represent Symbols in property lists */
		if(ampedSymbols){
			accessor = "@@" + accessor.replace(/^Symbol\(|\)$/g, "");
			valName  = (name ? "." : "") + accessor;
		}
		
		const value = print(input[symbol], options, name + valName, refs);
		output += `\n${accessor}: ${value}`;
	}
	
	
	/** Tweak output based on the value's type */
	if("[object Arguments]" === type)
		typeName = "Arguments";
	
	else{
		const ctr = input.constructor ? input.constructor.name : "";
		switch(ctr){
			
			case "GeneratorFunction":
				typeName = "function*()";
				break;
			
			case "Function":
				typeName = "function()";
				break;
			
			case "Array":
			case "Object":
				typeName = "";
				break;
			
			default:
				typeName = ctr;
				break;
		}
	}
	
	output = output ? output.replace(/\n/g, "\n\t") + "\n" : "";
	return typeName + (arrayLike
		? "[" + output + "]"
		: "{" + output + "}");
} // print()


/**
 * Wrapper for `console.log( print( … ) )`.
 * 
 * @example
 * 		> const print = require( 'nrser/lib/print' );
 * 		> print.out( { x: 1 } );
 * 		{ x: 1 }
 * 
 * @note 2019-07-26, while digging back in for Equipd fronts...
 * 		
 * 		I *think* this came over when I copied the library, and am not sure
 * 		I've ever used it.
 * 		
 * 		Maybe, because it returns the string as well, and that's really annoying
 * 		in the `node` repl.
 * 		
 * 		So, today, I removed that. Now it returns whatever `console.log()` does!
 * 		We'll see what collapses...
 * 
 * @param {...*} args - Passed to {@link print}, look there.
 * 
 * @return {void}*Actually*... whatever `console.log()` returns, but that seems
 * to be `undefined` everywhere that matters.
 */
function out( ...args ) {
	return console.log( print( ...args ) );
}

// Exports
// ===========================================================================
// 
// In keeping with the inherited style from the previous author, *my* print 
// *also* remains very `node` happy, exporting the `print()` function as the 
// module.
// 
// This means that it works a bit like:
// 
// 		const print = require( 'nrser/lib/print' );
// 		const string = print( { x: 1, y: 2 } );
// 
// In making nice with the rest of the Babel-type-pack, `print()` is *also* 
// exported as the `default`:
// 
// 		import print from 'nrser/lib/print';
// 		const string = print( { x: 1, y: 2 } );
// 
// Yeah, I guess that's nice.
// 
// So, the other functions - `type()` and `out()` - are then available as 
// properties of the default export as usual. The default export is the 
// `print()` function, so that is accomplished with this tom-foolery:
// 
print.type = type;
print.out = out;
// 
// And the stuff we need to get the "main" export right in both cases:
// 
module.exports = print;
export default print;
// 
// Ok, see ya later!
