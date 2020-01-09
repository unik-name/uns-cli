beforeEach(() => {
    // Reset all environment variables, which might be configured on this computer
    process.env.UNS_NETWORK = undefined;
    process.env.DEV_MODE = undefined;
});

afterEach(() => {
    // Launching all tests throws `MaxListenersExceededWarning: Possible EventEmitter memory leak detected` warning. In some tests we test stdout content, we can't have warnings
    process.stdout.removeAllListeners();
    process.stderr.removeAllListeners();
});
