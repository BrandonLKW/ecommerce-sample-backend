//mostly logging for troubleshoot/debug reasons
export function createErrorMessage(error: unknown) {
    if (typeof error === "string") {
        console.log(error);
        return error;
    } else if (error instanceof Error) {
        console.log(`${error.message} --- STE: ${error.stack}`);
        console.trace();
        return error.message;
    } else {
        console.log(`Unable to define error: ${error}`);
        return "UNDEFINED ERROR";
    }
}
//References
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
// https://stackoverflow.com/questions/54649465/how-to-do-try-catch-and-finally-statements-in-typescript