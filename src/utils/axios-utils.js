import axios from "axios";
import secureLocalStorage from "react-secure-storage";

export const baseURL = process.env.REACT_APP_BACKEND_URL; // backend url

const client = axios.create({ baseURL });
let cancelToken;
export const request = async ({ ...options }) => {
  const userData = secureLocalStorage.getItem("hms_user");

  if (userData) {
    const { token } = userData;
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  client.defaults.headers["Access-Control-Allow-Origin"] = "*";

  //Check if there are any previous pending requests
  if (typeof cancelToken != typeof undefined && !options?.avoidCancelling) {
    cancelToken.cancel("Operation canceled due to new request.");
  }
  if (options?.avoidCancelling) delete options.avoidCancelling;
  //Save the cancel token for the current request
  cancelToken = axios.CancelToken.source();

  try {
    const response = await client({
      ...options,
      cancelToken: cancelToken.token,
    });

    return response;
  } catch (error) {
    let err = { ...error };
    if (error?.response?.data?.message)
      err = { ...error, message: error?.response?.data?.message };

    throw err;
  }
};
