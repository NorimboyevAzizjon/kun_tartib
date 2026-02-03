import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // ✅ Testing Environment
    environment: 'jsdom',
    
    // ✅ Global test utilities
    globals: true,
    
    // ✅ Setup files
    setupFiles: ['./src/test/setup.js'],
    
    // ✅ Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js',
        'dist/'
      ]
    },
    
    // ✅ Include patterns
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    // ✅ Exclude patterns
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  }
});
