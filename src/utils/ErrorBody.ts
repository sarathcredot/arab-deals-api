export default class ErrorBody {
  status: number;
  message: string;
  errors: Array<any>;

  constructor(statusCode: number = 500, message: string = "Internal Server Error.", errors: Array<any> = []) {
    this.status = statusCode;
    this.message = message;
    this.errors = errors;
  }
}

