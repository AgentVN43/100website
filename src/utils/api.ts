import { Domain } from "@/types/domain";

// Fake danh sách domain
export const domains: Domain[] = [
  { id: 1, name: "https://bepduonglam.vn", user: "bepduonglam@admin", password: "J8Iwm7500DPg1D3F4cDp7wA8" },
 
];

// Hàm fetch danh sách domain
export const getDomains = async (): Promise<Domain[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(domains), 500));
};

// Hàm giả lập đăng nhập
export const login = async (domain: string, username: string, password: string): Promise<boolean> => {
  const domainData = domains.find((d) => d.name === domain);
  if (domainData && domainData.user === username && domainData.password === password) {
    return true;
  }
  return false;
};
