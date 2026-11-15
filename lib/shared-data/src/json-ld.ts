/** JSON is not HTML-safe: a literal </script> terminates even a JSON-LD script. */
export function serializeJsonLd(value: object): string {
  const escapes: Record<string, string> = {
    "<": "\\u003c", ">": "\\u003e", "&": "\\u0026",
    "\u2028": "\\u2028", "\u2029": "\\u2029",
  };
  return JSON.stringify(value, null, 2).replace(/[<>&\u2028\u2029]/g, char => escapes[char]);
}

export function injectJsonLd(template: string, value: object): string {
  const script = `<script type="application/ld+json">\n${serializeJsonLd(value)}\n  </script>`;
  if (/<script type="application\/ld\+json">/.test(template)) {
    // Callback replacement also preserves user text containing $&, $`, or $'.
    return template.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => script);
  }
  return template.replace("</head>", () => `${script}\n</head>`);
}
