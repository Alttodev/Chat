import { useEffect } from "react";

export function useScrollToPost(targetPostId, dependencies = []) {
  useEffect(() => {
    if (!targetPostId) return;

    let rafId = null;
    let attempts = 0;
    const maxAttempts = 30;

    const scrollToTarget = () => {
      const element =
        document.getElementById(`post-${targetPostId}`) ||
        document.getElementById(targetPostId);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      if (attempts < maxAttempts) {
        attempts += 1;
        rafId = requestAnimationFrame(scrollToTarget);
      }
    };

    rafId = requestAnimationFrame(scrollToTarget);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPostId, ...dependencies]);

}
