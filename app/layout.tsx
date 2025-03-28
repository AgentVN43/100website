import { ConfigProvider } from "antd";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import "./globals.css";
import Header from "./components/header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider>
            <div className="max-w-7xl mx-auto px-3">
              <Header />
              <div className="pt-12">
              {children}
              </div>
            </div>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
