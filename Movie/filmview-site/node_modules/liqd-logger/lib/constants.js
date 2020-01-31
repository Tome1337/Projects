module.exports.LEVELS = Object.freeze(
{
    emergency: 0,
    alert: 1,
    critical: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7,
    devel: 8
});

module.exports.LABELS = Object.freeze([ ...Object.keys( module.exports.LEVELS )]);
module.exports.COLORS = [ /*-*/196, /*-*/196, 196, 208, 226, 76, 45, 33, 8 ];
