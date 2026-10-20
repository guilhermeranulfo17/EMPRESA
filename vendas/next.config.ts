import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // o prompt do copiloto é lido do disco em tempo de execução: entra no pacote da Vercel
  outputFileTracingIncludes: { '/**': ['./prompts/**'] },
  // a planilha da prospecção vai pelo upload (até 4 MB; a Vercel aceita até 4,5 MB por pedido)
  experimental: { serverActions: { bodySizeLimit: '5mb' } },
};

export default nextConfig;
