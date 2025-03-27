import { ConfigProvider } from "antd";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Header from "@/components/header";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider>
            <div>
              <Header />
              {children}
            </div>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
