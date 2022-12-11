const Payload = require('./Payload');

class ResponseService {
  checkHeaders(headerType, headerValues, methods) {
    return (request, response, next) => {
      const payload = new Payload();
      const notContainsHeaderType = !request.headers[headerType];
      const notContainsHeaderValue = !headerValues.some(headerValue => request.headers[headerType] === headerValue);

      if ((notContainsHeaderType || notContainsHeaderValue) && methods.includes(request.method)) {
        payload.add('status', 'error');
        payload.add('message', `Invalid header ${headerType}. Only: [${headerValues.join(', ')}]`);

        response.send(payload.get());

        return;
      }
      
      next();
    }
  }

  checkInvalidJSON(error, request, response, next) {
    const payload = new Payload();
    const hasInvalidRequest = !request.body && request.method !== 'GET';
    const hasError = error instanceof SyntaxError && 'body' in error && error.type === 'entity.parse.failed';

    if (hasInvalidRequest || hasError) {
      payload.add('status', 'error');
      payload.add('message', 'Invalid JSON');

      response.send(payload.get());

      return;
    }
  
    next();
  }
}

module.exports = new ResponseService();