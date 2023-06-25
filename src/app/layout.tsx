import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Macro Meal",
  description: "Macro-focused meal planning",
};

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cx(inter.className, "bg-stone-900")}>
        <div className="flex min-h-screen flex-col">
          <div className="mb-4 bg-stone-800 py-4 text-center text-stone-50">
            site header
          </div>

          <div className="grow">{children}</div>

          <div className="bg-stone-800 py-40 text-center text-stone-50">
            site footer
          </div>
        </div>
      </body>
    </html>
  );
}
