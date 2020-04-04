// Modified Source: https://github.com/oieduardorabelo/use-navigator-online

import { useEffect, useState } from "react";

function useNavigatorOnline() {
  let [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    function handleOnlineStatusChange(event: Event) {
      setIsOnline(window.navigator.onLine);
    }

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  return isOnline;
}

export default useNavigatorOnline;
