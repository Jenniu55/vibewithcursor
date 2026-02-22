'use client';

/**
 * Catches errors in the root layout. Must define its own <html> and <body>.
 * When this shows, the root layout is replaced so we need full document structure.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p style={{ margin: '1rem 0', color: '#666' }}>
          An error occurred. Try again or go back to the home page.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
