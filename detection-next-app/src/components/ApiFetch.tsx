import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 1000000, 
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.log(error)
    }
    return Promise.reject(error);
  }
);

export const ApiFetchReq = (methods: string, url: string, body: object) => {
  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const config = {
    method: methods,
    url,
    data: body,
    headers,
  };
  return instance(config)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      // Handle other errors here, if needed
      console.error(err);
      throw err; // Re-throw the error to propagate it to the calling function
    });
};



