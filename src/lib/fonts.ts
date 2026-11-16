import { Inter, Prompt, Roboto, Sarabun } from "next/font/google";

export const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
});

export const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-prompt",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});
