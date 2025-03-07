export class GraphQLResponse {
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

  static handlePromise(promise) {
    return new Promise((resolve, reject) => {
      promise
        .then((response) => resolve(GraphQLResponse.success(response)))
        .catch((error) => reject(GraphQLResponse.error(error)));
    });
  }
}
