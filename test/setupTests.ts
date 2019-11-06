global.beforeEach(() => {
    // Reset all environment variables, which might be configured on this computer
    process.env.UNS_NETWORK = null;
    process.env.DEV_MODE = null;
});
