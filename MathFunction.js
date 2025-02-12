//Random in array
function rand (arr) {
    return arr[Math.floor((Math.random()*arr.length))];
}

//Random in list
function randl (arr) {
    return rand(arr);
}

//Random in range (Integer)
function randi (from = null, to = null, max_possible = false) {
  if(max_possible) {
    if(!from) from = Number.MIN_SAFE_INTEGER - 1 //Minimum integer in JS
    if(!to) to = Number.MAX_SAFE_INTEGER + 1
  } else {
    if(!from) from = -10000 //Minimum integer in JS
    if(!to) to = 10000
  }
    return Math.floor(Math.random() * (to - from + 1)) + from
}

//Random in range (Float)
/**Returns whether basic arithmetic breaks between n and n+1, to a precision of `digits` after the decimal point*/
function isUnsafe(n, digits) {
// digits = 1 loops 10 times with 0.1 increases.
// digits = 2 means 100 steps of 0.01, and so on.
let prev = n;
for (let i = 10 ** -digits; i < 1; i += 10 ** -digits) {
    if (n + i === prev) { // eg 10.2 === 10.1
    return true;
    }
    prev = n + i;
}
return false;

}

/**Binary search between 0 and Number.MAX_SAFE_INTEGER (2**53 - 1) for the biggest number that is safe to the `digits` level of precision.
 * digits=9 took ~30s, I wouldn't pass anything bigger.*/
function findMaxSafeFloat(digits, log = false) {
let n = Number.MAX_SAFE_INTEGER;
let lastSafe = 0;
let lastUnsafe = undefined;
while (true) {
    if (log) {
    // console.table({
    //     '': {
    //     n,
    //     'Relative to Number.MAX_SAFE_INTEGER': `(MAX + 1) / ${(Number.MAX_SAFE_INTEGER + 1) / (n + 1)} - 1`,
    //     lastSafe,
    //     lastUnsafe,
    //     'lastUnsafe - lastSafe': lastUnsafe - lastSafe
    //     }
    // });
    }
    if (isUnsafe(n, digits)) {
    lastUnsafe = n;
    } else { // safe
    if (lastSafe + 1 === n) { // Closed in as far as possible
        // console.log(`\n\nMax safe number to a precision of ${digits} digits after the decimal point: ${n}\t((MAX + 1) / ${(Number.MAX_SAFE_INTEGER + 1) / (n + 1)} - 1)\n\n`);
        return n;
    } else {
        lastSafe = n;
    }
    }
    n = Math.round((lastSafe + lastUnsafe) / 2);
}
}

function randf (min = null, max = null, numround = null, max_possible = false) {
    let max_v, min_v;
    if(!numround) {
        numround = 2;
    }
    let min_safe, max_safe;
    if(max_possible) {
      max_safe = findMaxSafeFloat(numround);
    }
    else {
      max_safe = 10000;
    }
    min_safe = -max_safe
    if(!min) {
        min = Number.MIN_SAFE_INTEGER;
    }
    if(!max) {
        max = Number.MAX_SAFE_INTEGER;
    }
    max_v = max_safe < max ? max_safe : max
    min_v = min_safe < min ? min : min_safe
    result = rand([-1, 1]) * (Math.random() * (max_v - min_v) + min_v).toFixed(numround);
    // while (result < min || result > max) 
    //     result = rand([-1, 1]) * (Math.random() * (max_v - min_v) + min_v).toFixed(numround);
    return result
};

// function calculate(input) {

//     let f = {
//       add: '+',
//       sub: '-',
//       div: '/',
//       mlt: '*',
//       mod: '%',
//       exp: '^'
//     };
  
//     // Create array for Order of Operation and precedence
//     f.ooo = [
//       [
//         [f.mlt],
//         [f.div],
//         [f.mod],
//         [f.exp]
//       ],
//       [
//         [f.add],
//         [f.sub]
//       ]
//     ];
  
//     input = input.replace(/[^0-9%^*\/()\-+.]/g, ''); // clean up unnecessary characters
  
//     let output;
//     let flag = true;
//     for (let i = 0, n = f.ooo.length; i < n; i++) {
  
//       // Regular Expression to look for operators between floating numbers or integers
//       let re = new RegExp('(\\d+\\.?\\d*)([\\' + f.ooo[i].join('\\') + '])(\\d+\\.?\\d*)');
//       re.lastIndex = 0; // take precautions and reset re starting pos
//       // Loop while there is still calculation for level of precedence
//       console.log(input, re.test(input))
//       while (re.test(input)) {
//         output = _calculate(RegExp.$1, RegExp.$2, RegExp.$3);
//         flag = false;
//         if (isNaN(output) || !isFinite(output)) 
//           return output; // exit early if not a number
//         input = input.replace(re, output);
//       }
//     }
//     if(flag)
//       return input;
  
//     return output;
  
//     function _calculate(a, op, b) {
//       a = a * 1;
//       b = b * 1;
//       switch (op) {
//         case f.add:
//           return a + b;
//           break;
//         case f.sub:
//           return a - b;
//           break;
//         case f.div:
//           return a / b;
//           break;
//         case f.mlt:
//           return a * b;
//           break;
//         case f.mod:
//           return a % b;
//           break;
//         case f.exp:
//           return Math.pow(a, b);
//           break;
//         default:
//           null;
//       }
//     }
//   }