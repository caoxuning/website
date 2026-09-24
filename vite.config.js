import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  build:{
    rollupOptions:{
      input:{
        index:fileURLToPath(new URL('./index.html',import.meta.url)),
        legacy:fileURLToPath(new URL('./legacy.html',import.meta.url)),
        preview:fileURLToPath(new URL('./design-preview.html',import.meta.url)),
      },
      output:{
        manualChunks(id){
          if(id.includes('node_modules/three/'))return 'three';
        },
      },
    },
  },
});
