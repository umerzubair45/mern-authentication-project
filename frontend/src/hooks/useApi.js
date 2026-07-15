import { useState } from "react";
import toast from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_API_URL;

const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = async ({
    url,
    method = "GET",
    body = null,
    headers = {},
  }) => {
    setLoading(true);

    try {
      console.log("enter use api from forgetpassword");
      const response = await fetch(`${BASE_URL}${url}`, {
        method,

        headers: {
          "Content-Type": "application/json",
          ...headers,
        },

        body: body ? JSON.stringify(body) : null,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);

        return {
          success: true,
          data: result,
        };
      }

      toast.error(result.message);

      return {
        success: false,
        data: result,
      };
    } catch (error) {
      toast.error("Something went wrong.");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    request,
  };
};

export default useApi;
