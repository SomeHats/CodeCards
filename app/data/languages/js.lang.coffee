# Javascript language definition for CodeCards

module.exports =
  name: 'js'
  format: 'js_beautify'
  version: 0
  words:
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
    10:   " + "
    11:   " - "
    12:   " * "
    13:   " / "
    14:   " % "
    15:   " ++ "
    16:   " -- "

    # Assignment
    17:   " = "
    18:   " += "
    19:   " -= "
    20:   " *= "
    21:   " /= "
    22:   " %= "
    23:   " <<= "
    24:   " >>= "
    25:   " >>>= "
    26:   " &= "
    27:   " ^= "
    28:   " |= "

    # Bitwise
    29:   " & "
    30:   " | "
    31:   " ^ "
    32:   " ~ "
    33:   " << "
    34:   " >> "
    35:   " >>> "

    # Comparison
    36:   " == "
    37:   " != "
    38:   " === "
    39:   " !== "
    40:   " > "
    41:   " >= "
    42:   " < "
    43:   " <= "

    # Logical
    44:   " && "
    45:   " || "
    46:   " ! "

    # "Special" operators
    47:   "."
    48:   " ? "
    49:   " : "
    50:   ", "
    51:   " delete "
    52:   " function "
    53:   " get "
    54:   " in "
    55:   " instanceof "
    56:   " let "
    57:   " new "
    58:   " set "
    59:   " this"
    60:   " typeof "
    61:   " void"
    62:   " yield "

    # Statements
    63:   " break;"
    64:   " continue;"
    65:   " debugger;"
    66:   " do {"
    67:   " for ("
    68:   " if ("
    69:   " else "
    70:   " return "
    71:   " switch("
    72:   " case "
    73:   " throw "
    74:   " try {"
    75:   " catch ("
    76:   " finally {"
    77:   " var "
    78:   " while ("
    79:   " with ("

    # Global values
    80:   "true"
    81:   "false"
    82:   "undefined"
    83:   "null"
    84:   "NaN"
    85:   "Infinity"
    # I'm worried I've missed some of these, so I'm reserving 86-89

    # Function scope
    90:   "arguments"

    # Non-constructor functions
    91:   "decodeURI("
    92:   "decodeURIComponent("
    93:   "encodeURI("
    94:   "encodeURIComponent("
    95:   "eval("
    96:   "isFinite("
    97:   "isNaN("
    98:   "parseFloat("
    99:   "parseInt("