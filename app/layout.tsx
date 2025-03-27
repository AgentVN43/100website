import { ConfigProvider } from "antd";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider>
          <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
            {children}
          </div>
        </ConfigProvider>
      </body>
    </html>
  );
}
