export function logError(error: any, message: string = "") {
  console.log(message);

  console.log(error?.response?.status);
  console.log(error?.response?.statusText);
  console.log(error?.response?.data);

  console.log(error);
}
