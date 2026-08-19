import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | DF Travel System` : 'DF Travel System | Travel Booking';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
