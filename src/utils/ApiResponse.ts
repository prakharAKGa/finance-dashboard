export class ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: object;

  constructor(
    success: boolean,
    message: string,
    data: T | null = null,
    pagination?: object
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    if (pagination) this.pagination = pagination;
  }

  static success<T>(data: T, message = 'Success', pagination?: object) {
    return new ApiResponse(true, message, data, pagination);
  }

  static error(message: string) {
    return new ApiResponse(false, message, null);
  }
}
