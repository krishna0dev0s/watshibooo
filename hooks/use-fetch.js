import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      setData(undefined);

      const response = await cb(...args);
      
      if (!response) {
        throw new Error("Server response was empty");
      }

      setData(response);
      return response; // Return the response for immediate use
    } catch (error) {
      setError(error);
      // Let the component handle the error display
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
