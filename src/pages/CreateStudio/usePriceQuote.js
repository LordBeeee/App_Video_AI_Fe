import { useCallback, useEffect, useRef, useState } from "react";
import { createPriceQuote } from "../../services/aiPlatform.service";

export function usePriceQuote({ modality, modelSlug, prompt, options, enabled = true }) {
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const requestId = useRef(0);

  const clearQuote = useCallback(() => {
    requestId.current += 1;
    setQuote(null);
    setQuoteError("");
  }, []);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    setQuote(null);
    setQuoteError("");

    if (!enabled || !modelSlug || (modality !== "video" && !prompt.trim())) return;

    const timer = setTimeout(async () => {
      try {
        const next = await createPriceQuote({ modality, modelSlug, prompt, options });
        if (currentRequest === requestId.current) setQuote(next);
      } catch (error) {
        if (currentRequest === requestId.current) {
          setQuoteError(error.response?.data?.message || error.message);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      requestId.current += 1;
    };
  }, [modality, modelSlug, prompt, options, enabled]);

  return { quote, quoteError, clearQuote };
}
