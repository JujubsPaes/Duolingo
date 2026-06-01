import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { Colors } from "../constants/colors";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Remove blue outline on input focus */
            input:focus, textarea:focus {
              outline: none !important;
              box-shadow: none !important;
            }

            /* Remove yellow autofill background (Chrome/Safari) */
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0px 1000px ${Colors.white} inset !important;
              box-shadow: 0 0 0px 1000px ${Colors.white} inset !important;
              -webkit-text-fill-color: ${Colors.black} !important;
              transition: background-color 5000s ease-in-out 0s;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
