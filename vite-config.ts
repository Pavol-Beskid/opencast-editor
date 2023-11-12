import istanbul from 'vite-plugin-istanbul';

export default {
  open: true,
  port: 3000,
  plugins: [
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'test/'],
      extension: [ '.js', '.ts', '.tsx' ],
      requireEnv: true,
    }),
  ],
};
