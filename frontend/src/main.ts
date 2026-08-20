// file: frontend/src/main.ts
import { registerPlugins } from './plugins'
import App from './App.vue'
import { createApp } from 'vue'

// 1. Impor router yang baru saja dibuat
import router from './router' 

const app = createApp(App)

registerPlugins(app)

// 2. Beri tahu Vue untuk menggunakan router ini
app.use(router) 

app.mount('#app')