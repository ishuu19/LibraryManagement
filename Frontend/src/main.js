import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Oruga from '@oruga-ui/oruga-next'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

const app = createApp(App)

app.use(router)
app.use(Oruga, {
    iconPack: 'fas',
    statusIcon: true
})

app.mount('#app')
