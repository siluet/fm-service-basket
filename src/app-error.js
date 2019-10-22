module.exports = class AppError extends Error {
  constructor (message, request) {
  
    // Calling parent constructor of base Error class.
    super(message);
    
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    this.message = message || 'Something went wrong.';

    this.request = request;

    // Capturing stack trace, excluding constructor call from it.
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
    
  }
};
