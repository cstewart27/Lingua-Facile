import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';

export function useClipboardWatcher(intervalMs: number = 1000) {
  const [hasClipboardContent, setHasClipboardContent] = useState(false);

  useEffect(() => {
    const checkClipboard = async () => {
      const text = await Clipboard.getStringAsync();
      setHasClipboardContent(!!text);
    };
    const interval = setInterval(checkClipboard, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return hasClipboardContent;
}

