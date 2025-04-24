export default function Head() {
    return (
      <>
        {/* Ensure all relative URLs resolve under the GitHub Pages subpath */}
        <base href="/talo_public/" />
        {/* Primary meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Mortgage Calculator</title>
        <meta name="description" content="Calculate mortgage payments, refinancing scenarios, and more" />
        {/* Favicon */}
        <link rel="icon" href="/talo_public/favicon.ico" type="image/x-icon" />
      </>
    );
  }
  