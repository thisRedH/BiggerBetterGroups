
var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

function reloadModule(moduleName) {
    logger.debug(`Reloading module "${moduleName}"...`);
    delete require.cache[require.resolve(moduleName)];
    const reloadedModule = require(moduleName);
    return reloadedModule;
}

module.exports = {
    reloadModule,
}
