import { Grenze_Gotisch, Public_Sans } from "next/font/google";

// Headlines: a blackletter root drawn for screens — the "The" on the lockup.
export const gotisch = Grenze_Gotisch({
  subsets: ["latin"],
  variable: "--font-gotisch",
  display: "swap",
});

// Everything clinical: labels, body, prices. The official-form face.
export const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public",
  display: "swap",
});
