<template>
  <div id="app">
    <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow bg-dark text-white">
      <a class="navbar-brand col-sm-3 col-md-2 mr-0 ml-2 bg-dark text-white" href="#">NDashboard</a>
      <font-awesome-icon class="fa-2x mr-2" icon="columns" style="color:'white'" />
    </nav>
    <NPartitionedPoster></NPartitionedPoster>
  </div>
</template>

<script>
import NPartitionedPoster from '@/components/NPartitionedPoster.vue'

export default {
  name: 'App',
  components: {
    NPartitionedPoster
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color:#2d2d2d;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.wrimagecard {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: left;
  position: relative;
  background: #fff;
  box-shadow: 12px 15px 20px 0px rgba(46, 61, 73, 0.15);
  border-radius: 4px;
  transition: all 0.3s ease;
}
.wrimagecard .fa {
  position: relative;
  font-size: 70px;
}
.wrimagecard-topimage-header {
  padding: 10px;
}
a.wrimagecard:hover,
.wrimagecard-topimage:hover {
  box-shadow: 2px 4px 8px 0px rgba(46, 61, 73, 0.2);
}
.wrimagecard-topimage a {
  width: 100%;
  height: 100%;
  display: block;
}
.wrimagecard-topimage_content {
  padding: 20px 24px;
  padding-bottom: 0.75rem;
  position: relative;
}
.wrimagecard-topimage a {
  border-bottom: none;
  text-decoration: none;
  color: #525c65;
  transition: color 0.3s ease;
}
.coloured-brown {
  background-color: rgba(187, 120, 36, 0.1);
}

.coloured-brown-header {
  color: #bb7824;
}
.coloured-green {
  background-color: rgba(22, 160, 133, 0.1);
}

.coloured-green-header {
  color: #16a085;
}
.coloured-red {
  background-color: rgba(213, 15, 37, 0.1);
}
.coloured-red-header {
  color: #d50f25;
}
.coloured-blue {
  background-color: rgba(51, 105, 232, 0.1);
}

.coloured-blue-header {
  color: #3369e8;
}
.coloured-yellow {
  background-color: rgba(250, 188, 9, 0.1);
}
.coloured-yellow-header {
  color: #fabc09;
}
.coloured-black {
  background-color: rgba(121, 90, 71, 0.1);
}
.coloured-black-header {
  color: #795a47;
}
.coloured-gray {
  background-color: rgba(130, 93, 9, 0.1);
}

.coloured-gray-header {
  color: #825d09;
}
</style>
