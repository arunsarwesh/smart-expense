import axios from "axios";

const instance = axios.create({
  baseURL: "https://sarwesh.pythonanywhere.com/",
});

// Function to refresh the access token using the refresh token
const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");

  if (!refresh) {
    throw new Error("Refresh token not available");
  }

  const response = await axios.post("https://sarwesh.pythonanywhere.com/refresh/", { refresh });

  if (response.data.access) {
    localStorage.setItem("access_token", response.data.access);
    return response.data.access;
  } else {
    throw new Error("Failed to refresh the token");
  }
};

// Axios request interceptor to add the access token to the header
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios response interceptor to handle token expiration and refresh it if necessary
instance.interceptors.response.use(
  (response) => response,  // If the request succeeds, just return the response
  async (error) => {
    // If the error response is due to unauthorized access (Token Expired)
    if (error.response && error.response.status === 401 && error.response.data.code === 'token_not_valid') {
      const originalRequest = error.config;

      try {
        // Refresh the token
        const newAccessToken = await refreshToken();

        // Update the authorization header with the new access token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry the original request with the new token
        return axios(originalRequest);
      } catch (err) {
        console.error("Error refreshing token:", err);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
