<template>
  <div class="calendar-view">
    <div class="header">
      <h2>行事曆</h2>
      <button @click="showAddForm = !showAddForm" class="btn-primary">
        新增行程
      </button>
    </div>

    <!-- Add Event Form -->
    <div v-if="showAddForm" class="event-form">
      <h3>新增行程</h3>
      <form @submit.prevent="addEvent">
        <div class="form-group">
          <label>標題</label>
          <input v-model="newEvent.title" type="text" required />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="newEvent.description" rows="3"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>日期</label>
            <input v-model="newEvent.date" type="date" required />
          </div>
          <div class="form-group">
            <label>時間</label>
            <input v-model="newEvent.time" type="time" required />
          </div>
        </div>
        <div class="form-group">
          <label>地點</label>
          <input v-model="newEvent.location" type="text" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">新增</button>
          <button type="button" @click="cancelAdd" class="btn-secondary">取消</button>
        </div>
      </form>
    </div>

    <!-- Events List -->
    <div class="events-list">
      <div 
        v-for="event in sortedEvents" 
        :key="event.id" 
        class="event-card"
        :class="{ 'checked-in': event.checkedIn }"
      >
        <div class="event-header">
          <h3>{{ event.title }}</h3>
          <span class="event-date">{{ formatDate(event.date, event.time) }}</span>
        </div>
        
        <p class="event-description">{{ event.description }}</p>
        <p class="event-location">📍 {{ event.location }}</p>
        
        <div class="event-actions">
          <button 
            v-if="!event.checkedIn && isEventToday(event.date)"
            @click="checkIn(event.id)"
            :disabled="checkingIn"
            class="btn-checkin"
          >
            {{ checkingIn ? '打卡中...' : '打卡' }}
          </button>
          
          <div v-if="event.checkedIn" class="checkin-info">
            <span class="checkin-badge">✅ 已打卡</span>
            <small>{{ formatCheckinTime(event.checkinTime) }}</small>
          </div>
        </div>
      </div>
      
      <div v-if="store.events.length === 0" class="empty-state">
        <p>尚無行程，請新增行程。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../stores'
import { format, isToday, parseISO } from 'date-fns'

const showAddForm = ref(false)
const checkingIn = ref(false)
const newEvent = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  location: ''
})

const sortedEvents = computed(() => {
  return [...store.events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA - dateB
  })
})

const addEvent = () => {
  store.addEvent(newEvent.value)
  resetForm()
  showAddForm.value = false
}

const cancelAdd = () => {
  resetForm()
  showAddForm.value = false
}

const resetForm = () => {
  newEvent.value = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  }
}

const checkIn = async (eventId) => {
  checkingIn.value = true
  
  try {
    const position = await getCurrentPosition()
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    }
    
    store.checkInEvent(eventId, location)
    alert('打卡成功！位置已記錄在地圖上。')
  } catch (error) {
    alert('無法獲取位置信息，請確認已允許位置存取權限。')
  } finally {
    checkingIn.value = false
  }
}

const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('瀏覽器不支援地理位置'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    })
  })
}

const formatDate = (date, time) => {
  const dateTime = new Date(`${date}T${time}`)
  return format(dateTime, 'yyyy/MM/dd HH:mm')
}

const formatCheckinTime = (checkinTime) => {
  return format(parseISO(checkinTime), 'yyyy/MM/dd HH:mm')
}

const isEventToday = (eventDate) => {
  return isToday(parseISO(eventDate))
}
</script>

<style scoped>
.calendar-view {
  max-width: 800px;
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

.btn-checkin {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-checkin:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.event-form {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--color-border);
}

.event-form h3 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-heading);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-background);
  color: var(--color-text);
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.event-card:hover {
  border-color: var(--color-border-hover);
}

.event-card.checked-in {
  border-left: 4px solid hsla(160, 100%, 37%, 1);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.event-header h3 {
  margin: 0;
  color: var(--color-heading);
}

.event-date {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.event-description {
  color: var(--color-text);
  margin: 0.5rem 0;
}

.event-location {
  color: var(--color-text);
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.event-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.checkin-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.checkin-badge {
  color: hsla(160, 100%, 37%, 1);
  font-weight: 500;
}

.checkin-info small {
  color: var(--color-text);
  opacity: 0.8;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text);
}
</style>