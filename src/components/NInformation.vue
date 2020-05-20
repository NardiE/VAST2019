<template>
   <b-card-group deck>
      <b-card :header="sensorCode" class="text-center">
        <b-card-text>User: {{ userName }}</b-card-text>
        <b-card-text>Coordinates: {{ coordinates }}</b-card-text>
        <b-card-text>Sensor Type: {{ sensorType  }}</b-card-text>
        <b-card-text>TimeStamp: {{ timeStamp }}</b-card-text>
        <b-card-text>Radiation: {{ radiation }}</b-card-text>
      </b-card>
    </b-card-group>
</template>

<script>
export default {
  name: 'NInformation',
  data () {
    return {
    }
  },
  props: {
     sensorCode: {
      type: String
    },
     userName: {
      type: String
    },
     latitude: {
      type: String
    },
     longitude: {
      type: String
    },
     sensorType: {
      type: String
    },
     timeStamp: {
      type: String
    },
     radiation: {
      type: String
    },
  },
  computed: {
     coordinates () {
      return '[' + this.latitude + ', ' + this.longitude + ']'
    }
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
