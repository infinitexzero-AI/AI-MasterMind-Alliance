import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="antialiased">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Defensive: Suppress MetaMask extension errors
                const suppress = (e) => {
                  if (
                    e.message?.includes('MetaMask') || 
                    e.message?.includes('ethereum') ||
                    e.filename?.includes('inpage.js') ||
                    (e.reason && e.reason.toString().includes('MetaMask'))
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                };
                
                // Use capture=true to catch errors before React/Next.js
                window.addEventListener('error', suppress, true);
                window.addEventListener('unhandledrejection', suppress, true);
                
                // Optional: Mock ethereum to prevent simple connection checks from exploding
                if (!window.ethereum) {
                  window.ethereum = {
                    isMetaMask: true,
                    request: async () => [],
                    on: () => {},
                    removeListener: () => {},
                    autoRefreshOnNetworkChange: false,
                  };
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
