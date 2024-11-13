import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function usePreviousLocation() {
  const location = useLocation(); // Current location
  const prevLocationRef = useRef(null); // Ref to store the previous location

  useEffect(() => {
    prevLocationRef.current = location; // Update the ref with the current location
  }, [location]);

  return prevLocationRef.current; // Return the previous location
}

export default usePreviousLocation;
