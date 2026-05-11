import axios, {
  AxiosError,
  AxiosResponse,
} from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("AXIOS FULL RESPONSE", response);
    console.log("AXIOS RESPONSE DATA", response.data);

    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error("Forbidden access");
          break;

        case 404:
          console.error("Resource not found");
          break;

        case 500:
          console.error("Server error");
          break;

        default:
          console.error("An error occurred");
      }
    } else if (error.request) {
      console.error("Network error");
    } else {
      console.error("Request configuration error");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
