import { useContext, useState } from "react";
import toast from "react-hot-toast";
import AuthContext from "../context/AuthContext";

const BASE_URL = process.env.REACT_APP_API_URL;

const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = async ({
    url,
    method = "GET",
    body = null,
    headers = {},
    retry = true,
    showSuccessToast = true,
  }) => {
    setLoading(true);

    try {
      // Get current access token
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}${url}`, {
        method,

        // Required for refreshToken HTTP-only cookie
        credentials: "include",

        headers: {
          "Content-Type": "application/json",

          // Add access token to request
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),

          ...headers,
        },

        body: body ? JSON.stringify(body) : null,
      });

      console.log("API Request:", url);
      console.log("API Status:", response.status);

      const result = await response.json();

      /*
      ==================================================
      ACCESS TOKEN EXPIRED
      ==================================================
      */

      if (
        response.status === 401 &&
        retry &&
        !url.includes("/auth/login") &&
        !url.includes("/auth/refresh-token")
      ) {
        console.log("Access token expired. Trying refresh...");

        try {
          /*
          ==============================================
          REQUEST NEW ACCESS TOKEN
          ==============================================
          */

          const refreshResponse = await fetch(
            `${BASE_URL}/api/auth/refresh-token`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          const refreshResult = await refreshResponse.json();

          /*
          ==============================================
          REFRESH FAILED
          ==============================================
          */

          if (!refreshResponse.ok) {
            console.log("Refresh token failed");
            localStorage.removeItem("token");
            window.location.href = "/login";

            return {
              success: false,
            };
          }

          /*
          ==============================================
          SAVE NEW ACCESS TOKEN
          ==============================================
          */

          const newAccessToken = refreshResult.accessToken;

          console.log("New access token:", newAccessToken);

          localStorage.setItem("token", newAccessToken);

          console.log("Access token refreshed successfully.");

          /*
          ==============================================
          RETRY ORIGINAL REQUEST
          ==============================================
          */

          return request({
            url,
            method,
            body,

            headers: {
              ...headers,

              // IMPORTANT:
              // Use the NEW access token
              Authorization: `Bearer ${newAccessToken}`,
            },

            // Prevent infinite refresh loop
            retry: false,

            // Don't show duplicate success toast
            showSuccessToast: false,
          });
        } catch (refreshError) {
          console.error("Refresh token error:", refreshError);

          localStorage.removeItem("token");

          window.location.href = "/login";

          return {
            success: false,
          };
        }
      }

      /*
      ==================================================
      SUCCESS RESPONSE
      ==================================================
      */

      if (response.ok) {
        if (showSuccessToast && result.message) {
          toast.success(result.message);
        }

        return {
          success: true,
          data: result,
        };
      }

      /*
      ==================================================
      NORMAL ERROR
      ==================================================
      */

      toast.error(result.message);

      return {
        success: false,
        data: result,
      };
    } catch (error) {
      console.error("API Error:", error);

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
