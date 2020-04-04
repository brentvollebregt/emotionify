import { useEffect } from "react";
import { usePath } from "hookrouter";

function useScrollToTopOnRouteChange() {
  const path = usePath();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);
}

export default useScrollToTopOnRouteChange;
