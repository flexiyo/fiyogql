export class GQLResponse {
  static success(response) {
    if (typeof response === "string") {
      return {
        status: {
          success: true,
          message: response,
        },
      };
    }
    return response;
  }

  static error(message) {
    return {
      status: {
        success: false,
        message: message || "Something went wrong.",
      },
    };
  }
}
