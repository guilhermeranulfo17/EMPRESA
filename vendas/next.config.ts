import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // o prompt do copiloto é lido do disco em tempo de execução: entra no pacote da Vercel
  outputFileTracingIncludes: { '/**': ['./prompts/**'] },
};

export default nextConfig;
