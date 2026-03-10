import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleCallback } from "../api/api";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleCallback();   // stores user + token
        navigate("/");            // go to Home
      } catch (err) {
        console.error("Login failed", err);
      }
    };

    processCallback();
  }, [navigate]);

  return <p>Signing you in...</p>;
}

export default Callback;