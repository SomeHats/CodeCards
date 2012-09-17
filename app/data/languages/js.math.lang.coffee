 # Javascript Math Object.

module.exports =
  name: 'js.math'
  version: 0
  extends:
    'js': 0
  lang:
    # Javascript takes IDs 1-99
    # Math object takes IDs 100-129
    # 27, 28 & 29 and reserved in case I've missed something
    100:  "Math"
    101:  ".E"
    102:  ".LN2"
    103:  ".LN10"
    104:  ".LOG2E"
    105:  ".LOG10E"
    106:  ".PI"
    107:  ".SQRT1_2"
    108:  ".SQRT2"
    109:  ".abs("
    110:  ".acos("
    111:  ".asin("
    112:  ".atan("
    113:  ".atan2("
    114:  ".ceil("
    115:  ".cos("
    116:  ".exp("
    117:  ".floor("
    118:  ".log("
    119:  ".max("
    120:  ".min("
    121:  ".pow("
    122:  ".random("
    123:  ".round("
    124:  ".sin("
    125:  ".sqrt("
    126:  ".tan("