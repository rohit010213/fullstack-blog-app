class ApiResponse {
    constructor(statusCode, data = null, message = null, errors = null) {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400
      this.errors = errors;
    }
  }
  
  export default ApiResponse;