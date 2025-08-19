<template>
  <div class="map-view">
    <div class="header">
      <h2>打卡地圖</h2>
      <div class="map-controls">
        <button @click="loadGoogleMaps" class="btn-primary">載入Google地圖</button>
        <button @click="getCurrentLocation" class="btn-secondary">我的位置</button>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <div id="google-map" ref="mapContainer" v-show="mapLoaded"></div>
      <div v-if="!mapLoaded" class="map-placeholder">
        <p>點擊「載入Google地圖」來查看打卡位置</p>
        <small>需要網路連線才能載入Google地圖</small>
      </div>
    </div>

    <!-- Checkins List -->
    <div class="checkins-list">
      <h3>打卡記錄</h3>
      <div v-if="store.checkins.length === 0" class="empty-state">
        <p>尚無打卡記錄</p>
      </div>
      <div v-else class="checkin-items">
        <div 
          v-for="checkin in sortedCheckins" 
          :key="checkin.id"
          class="checkin-item"
          @click="centerMapOnLocation(checkin.location)"
        >
          <div class="checkin-info">
            <h4>{{ checkin.eventTitle }}</h4>
            <p class="checkin-time">{{ formatTime(checkin.time) }}</p>
            <p class="checkin-coordinates">
              📍 {{ checkin.location.latitude.toFixed(6) }}, 
              {{ checkin.location.longitude.toFixed(6) }}
            </p>
          </div>
          <div class="checkin-accuracy">
            <small>精確度: {{ checkin.location.accuracy }}m</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '../stores'
import { format, parseISO } from 'date-fns'

const mapContainer = ref(null)
const mapLoaded = ref(false)
const map = ref(null)
const markers = ref([])

const sortedCheckins = computed(() => {
  return [...store.checkins].sort((a, b) => new Date(b.time) - new Date(a.time))
})

const loadGoogleMaps = async () => {
  try {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap()
      return
    }

    // Load Google Maps API
    const script = document.createElement('script')
    script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initGoogleMap'
    script.async = true
    script.defer = true
    
    // Create a global callback
    window.initGoogleMap = () => {
      initializeMap()
    }
    
    document.head.appendChild(script)
  } catch (error) {
    console.error('Failed to load Google Maps:', error)
    alert('無法載入Google地圖，請檢查網路連線')
  }
}

const initializeMap = () => {
  if (!mapContainer.value) return

  // Default location (Taipei)
  const defaultLocation = { lat: 25.0330, lng: 121.5654 }
  
  map.value = new window.google.maps.Map(mapContainer.value, {
    zoom: 13,
    center: defaultLocation,
    mapTypeId: 'roadmap'
  })

  // Add markers for all checkins
  addCheckinsToMap()
  mapLoaded.value = true
}

const addCheckinsToMap = () => {
  if (!map.value || !window.google) return

  // Clear existing markers
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []

  // Add markers for each checkin
  store.checkins.forEach(checkin => {
    const marker = new window.google.maps.Marker({
      position: {
        lat: checkin.location.latitude,
        lng: checkin.location.longitude
      },
      map: map.value,
      title: checkin.eventTitle,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#22c55e"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    })

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px 0;">${checkin.eventTitle}</h4>
          <p style="margin: 0; font-size: 14px;">打卡時間: ${format(parseISO(checkin.time), 'yyyy/MM/dd HH:mm')}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
            精確度: ${checkin.location.accuracy}m
          </p>
        </div>
      `
    })

    marker.addListener('click', () => {
      infoWindow.open(map.value, marker)
    })

    markers.value.push(marker)
  })

  // Fit map to show all markers
  if (markers.value.length > 0) {
    const bounds = new window.google.maps.LatLngBounds()
    markers.value.forEach(marker => bounds.extend(marker.getPosition()))
    map.value.fitBounds(bounds)
  }
}

const centerMapOnLocation = (location) => {
  if (!map.value) {
    alert('請先載入Google地圖')
    return
  }

  map.value.setCenter({
    lat: location.latitude,
    lng: location.longitude
  })
  map.value.setZoom(16)
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('瀏覽器不支援地理位置功能')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      if (map.value) {
        map.value.setCenter(location)
        map.value.setZoom(16)

        // Add a temporary marker for current location
        const currentMarker = new window.google.maps.Marker({
          position: location,
          map: map.value,
          title: '我的位置',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24)
          }
        })

        // Remove marker after 10 seconds
        setTimeout(() => {
          currentMarker.setMap(null)
        }, 10000)
      }
    },
    (error) => {
      alert('無法獲取位置信息: ' + error.message)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

const formatTime = (timeString) => {
  return format(parseISO(timeString), 'yyyy/MM/dd HH:mm')
}

// Initialize if Google Maps is already available
onMounted(() => {
  if (window.google && window.google.maps) {
    initializeMap()
  }
})
</script>

<style scoped>
.map-view {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: var(--color-heading);
  margin: 0;
}

.map-controls {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: hsla(160, 100%, 32%, 1);
}

.btn-secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.map-container {
  width: 100%;
  height: 400px;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

#google-map {
  width: 100%;
  height: 100%;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: var(--color-background-soft);
  color: var(--color-text);
}

.map-placeholder p {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.map-placeholder small {
  opacity: 0.7;
}

.checkins-list h3 {
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
  background: var(--color-background-soft);
  border-radius: 0.5rem;
}

.checkin-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkin-item {
  background: var(--color-background-soft);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkin-item:hover {
  border-color: var(--color-border-hover);
  background: var(--color-background);
}

.checkin-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
}

.checkin-time {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

.checkin-coordinates {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
  font-family: monospace;
}

.checkin-accuracy {
  margin-top: 0.5rem;
}

.checkin-accuracy small {
  color: var(--color-text);
  opacity: 0.7;
}
</style>