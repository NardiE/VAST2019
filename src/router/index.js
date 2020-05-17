import Vue from 'vue'
import Router from 'vue-router'
import NPartitionedPoster from '@/components/NPartitionedPoster'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'NPartitionedPoster',
      component: NPartitionedPoster
    }
  ]
})
