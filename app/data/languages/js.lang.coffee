# Javascript language definition for CodeCards

module.exports =
  name: 'js'
  version: 0
  lang:
    # Brackets
    1:    ")"
    2:    "("
    3:    "}"
    4:    "{"
    5:    "]"
    6:    "["
    # Common combos
    7:    ") { "
    8:    "})"
    9:    "()"

    # Operators
    # Arithmetic
    10:   "+ "
    11:   "- "
    12:   "* "
    13:   "/ "
    14:   "% "
    15:   "++ "
    16:   "-- "

    # Assignment
    17:   "= "
    18:   "+= "
    19:   "-= "
    20:   "*= "
    21:   "/= "
    22:   "%= "
    23:   "<<= "
    24:   ">>= "
    25:   ">>>= "
    26:   "&= "
    27:   "^= "
    28:   "|= "

    # Bitwise
    29:   "& "
    30:   "| "
    31:   "^ "
    32:   "~ "
    33:   "<< "
    34:   ">> "
    35:   ">>> "

    # Comparison
    36:   "== "
    37:   "!= "
    38:   "=== "
    39:   "!== "
    40:   "> "
    41:   ">= "
    42:   "< "
    43:   "<= "

    # Logical
    44:   "&& "
    45:   "|| "
    46:   "! "

    # "Special" operators
    47:   "."
    48:   "? "
    49:   ": "
    50:   ", "
    51:   "delete "
    52:   "function "
    53:   "get "
    54:   "in "
    55:   "instanceof "
    56:   "let "
    57:   "new "
    58:   "set "
    59:   "this"
    60:   "typeof "
    61:   "void"
    62:   "yield "

    # Global values
    63:   "true"
    64:   "false"
    65:   "undefined"
    66:   "null"
    67:   "NaN"
    68:   "Infinity"
    # I'm worried I've missed some of these, so I'm reserving 69 and 70

    # Non-constructor functions
    71:   "decodeURI("
    72:   "decodeURIComponent("
    73:   "encodeURI("
    74:   "encodeURIComponent("
    75:   "eval(" # LOL
    76:   "isFinite("
    77:   "isNaN("
    78:   "parseFloat"
    79:   "parseInt"

    # Math object
    80:   "Math"
    81:   ".E"
    82:   ".LN2"
    83:   ".LN10"
    84:   ".LOG2E"
    85:   ".LOG10E"
    86:   ".PI"
    87:   ".SQRT1_2"
    88:   ".SQRT2"
    89:   ".abs("
    90:   ".acos("
    91:   ".asin("
    92:   ".atan("
    93:   ".atan2("
    94:   ".ceil("
    95:   ".cos("
    96:   ".exp("
    97:   ".floor("
    98:   ".log("
    99:   ".max("
    100:  ".min("
    101:  ".pow("
    102:  ".random("
    103:  ".round("
    104:  ".sin("
    105:  ".sqrt("
    106:  ".tan("