import { useEffect, useRef } from "react";

export function useScrollToPost(targetPostId, dependencies = []) {
  const postRefs = useRef({});

  useEffect(() => {
    if (!targetPostId) return;

    const element = postRefs.current[targetPostId];
    if (!element) return;

    const rafId = requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [targetPostId, ...dependencies]);

  const setPostRef = (postId) => (element) => {
    if (element) {
      postRefs.current[postId] = element;
      return;
    }

    delete postRefs.current[postId];
  };

  return setPostRef;
}
