import { reactive } from 'vue'

// Simple reactive store for app data
export const store = reactive({
  events: JSON.parse(localStorage.getItem('events') || '[]'),
  discussions: JSON.parse(localStorage.getItem('discussions') || '[]'),
  checkins: JSON.parse(localStorage.getItem('checkins') || '[]'),
  
  // Event methods
  addEvent(event) {
    const newEvent = {
      id: Date.now(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      checkedIn: false,
      checkinLocation: null,
      checkinTime: null
    }
    this.events.push(newEvent)
    this.saveEvents()
  },
  
  checkInEvent(eventId, location) {
    const event = this.events.find(e => e.id === eventId)
    if (event) {
      event.checkedIn = true
      event.checkinLocation = location
      event.checkinTime = new Date().toISOString()
      
      // Add to checkins for map display
      this.checkins.push({
        id: Date.now(),
        eventId: eventId,
        eventTitle: event.title,
        location: location,
        time: event.checkinTime
      })
      
      this.saveEvents()
      this.saveCheckins()
    }
  },
  
  // Discussion methods
  addTopic(topic) {
    const newTopic = {
      id: Date.now(),
      title: topic.title,
      category: topic.category,
      content: topic.content,
      author: topic.author || '匿名用戶',
      createdAt: new Date().toISOString(),
      replies: []
    }
    this.discussions.push(newTopic)
    this.saveDiscussions()
  },
  
  addReply(topicId, reply) {
    const topic = this.discussions.find(d => d.id === topicId)
    if (topic) {
      const newReply = {
        id: Date.now(),
        content: reply.content,
        author: reply.author || '匿名用戶',
        createdAt: new Date().toISOString()
      }
      topic.replies.push(newReply)
      this.saveDiscussions()
    }
  },
  
  // Storage methods
  saveEvents() {
    localStorage.setItem('events', JSON.stringify(this.events))
  },
  
  saveDiscussions() {
    localStorage.setItem('discussions', JSON.stringify(this.discussions))
  },
  
  saveCheckins() {
    localStorage.setItem('checkins', JSON.stringify(this.checkins))
  }
})

// Initialize with sample data if empty
if (store.events.length === 0) {
  store.addEvent({
    title: '團隊會議',
    description: '討論專案進度',
    date: '2024-01-15',
    time: '10:00',
    location: '會議室A'
  })
  
  store.addEvent({
    title: '客戶拜訪',
    description: '產品展示',
    date: '2024-01-16',
    time: '14:00',
    location: '客戶辦公室'
  })
}

if (store.discussions.length === 0) {
  store.addTopic({
    title: '關於打卡系統的建議',
    category: '功能建議',
    content: '希望能夠增加自動定位功能，讓打卡更方便。',
    author: '使用者A'
  })
  
  store.addTopic({
    title: '地圖顯示問題',
    category: '技術問題',
    content: '地圖載入速度比較慢，有沒有改善的方法？',
    author: '使用者B'
  })
}