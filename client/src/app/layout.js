import './globals.css';

export const metadata = {
  title: 'AI Phishing Detection Platform',
  description: 'Check URLs and messages for phishing risk.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
