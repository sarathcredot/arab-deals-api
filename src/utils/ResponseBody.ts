export default class ResponseBody {
  message: string;
  isError: boolean;
  data: any;

  constructor(message: string = "", isError: boolean = false, data: {} = {}) {
    this.message = message;
    this.isError = isError;
    this.data = data;
  }
}

