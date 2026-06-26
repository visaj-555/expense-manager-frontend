import axios from "axios";

const BASE_URL = "http://localhost:3600/api/v1";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email,
        password,
      }
    );

    return response.data;
  },
};