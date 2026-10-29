import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Memento — Make something they will remember',
  description: 'Create personal, interactive digital experiences for the people who matter.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
