import { useEffect, useState } from "react";
import { todayKey } from "../utils/dates";
export function useToday() {
  const [today, setToday] = useState(todayKey());
  useEffect(() => {
    const id = setInterval(() => setToday(todayKey()), 60000);
    return () => clearInterval(id);
  }, []);
  return today;
}
