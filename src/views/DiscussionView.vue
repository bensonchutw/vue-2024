<template>
  <div class="discussion-view">
    <div class="header">
      <h2>討論區</h2>
      <button @click="showNewTopicForm = !showNewTopicForm" class="btn-primary">
        發表新主題
      </button>
    </div>

    <!-- Category Filter -->
    <div class="category-filter">
      <button 
        v-for="category in categories"
        :key="category"
        @click="selectedCategory = category"
        :class="{ active: selectedCategory === category }"
        class="category-btn"
      >
        {{ category }}
      </button>
    </div>

    <!-- New Topic Form -->
    <div v-if="showNewTopicForm" class="topic-form">
      <h3>發表新主題</h3>
      <form @submit.prevent="addTopic">
        <div class="form-group">
          <label>標題</label>
          <input v-model="newTopic.title" type="text" required />
        </div>
        <div class="form-group">
          <label>分類</label>
          <select v-model="newTopic.category" required>
            <option value="">請選擇分類</option>
            <option v-for="cat in categories.slice(1)" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>內容</label>
          <textarea v-model="newTopic.content" rows="5" required></textarea>
        </div>
        <div class="form-group">
          <label>暱稱</label>
          <input v-model="newTopic.author" type="text" placeholder="匿名用戶" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">發表</button>
          <button type="button" @click="cancelNewTopic" class="btn-secondary">取消</button>
        </div>
      </form>
    </div>

    <!-- Topics List -->
    <div class="topics-list">
      <div v-if="filteredTopics.length === 0" class="empty-state">
        <p v-if="selectedCategory === '全部'">尚無討論主題</p>
        <p v-else>此分類尚無討論主題</p>
      </div>
      
      <div 
        v-for="topic in filteredTopics" 
        :key="topic.id"
        class="topic-card"
        @click="toggleTopic(topic.id)"
      >
        <div class="topic-header">
          <div class="topic-info">
            <h3>{{ topic.title }}</h3>
            <div class="topic-meta">
              <span class="category">{{ topic.category }}</span>
              <span class="author">{{ topic.author }}</span>
              <span class="date">{{ formatDate(topic.createdAt) }}</span>
            </div>
          </div>
          <div class="reply-count">
            {{ topic.replies.length }} 回覆
          </div>
        </div>
        
        <p class="topic-content">{{ topic.content }}</p>
        
        <!-- Expanded Topic View -->
        <div v-if="expandedTopic === topic.id" class="topic-expanded">
          <!-- Replies -->
          <div v-if="topic.replies.length > 0" class="replies">
            <h4>回覆</h4>
            <div 
              v-for="reply in topic.replies" 
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-header">
                <span class="reply-author">{{ reply.author }}</span>
                <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="reply-content">{{ reply.content }}</p>
            </div>
          </div>
          
          <!-- Reply Form -->
          <div class="reply-form">
            <h4>回覆此主題</h4>
            <form @submit.prevent="addReply(topic.id)">
              <div class="form-group">
                <label>內容</label>
                <textarea v-model="newReply.content" rows="3" required></textarea>
              </div>
              <div class="form-group">
                <label>暱稱</label>
                <input v-model="newReply.author" type="text" placeholder="匿名用戶" />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary">回覆</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../stores'
import { format, parseISO } from 'date-fns'

const showNewTopicForm = ref(false)
const selectedCategory = ref('全部')
const expandedTopic = ref(null)

const categories = ['全部', '功能建議', '技術問題', '使用心得', '其他']

const newTopic = ref({
  title: '',
  category: '',
  content: '',
  author: ''
})

const newReply = ref({
  content: '',
  author: ''
})

const filteredTopics = computed(() => {
  let topics = [...store.discussions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  if (selectedCategory.value !== '全部') {
    topics = topics.filter(topic => topic.category === selectedCategory.value)
  }
  
  return topics
})

const addTopic = () => {
  store.addTopic(newTopic.value)
  resetNewTopicForm()
  showNewTopicForm.value = false
}

const cancelNewTopic = () => {
  resetNewTopicForm()
  showNewTopicForm.value = false
}

const resetNewTopicForm = () => {
  newTopic.value = {
    title: '',
    category: '',
    content: '',
    author: ''
  }
}

const addReply = (topicId) => {
  store.addReply(topicId, newReply.value)
  resetReplyForm()
}

const resetReplyForm = () => {
  newReply.value = {
    content: '',
    author: ''
  }
}

const toggleTopic = (topicId) => {
  if (expandedTopic.value === topicId) {
    expandedTopic.value = null
  } else {
    expandedTopic.value = topicId
    resetReplyForm()
  }
}

const formatDate = (dateString) => {
  return format(parseISO(dateString), 'yyyy/MM/dd HH:mm')
}
</script>

<style scoped>
.discussion-view {
  max-width: 900px;
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

.category-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover,
.category-btn.active {
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border-color: hsla(160, 100%, 37%, 1);
}

.topic-form {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--color-border);
}

.topic-form h3 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-heading);
}

.form-group input,
.form-group textarea,
.form-group select {
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

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.topic-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s ease;
}

.topic-card:hover {
  border-color: var(--color-border-hover);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.topic-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
}

.topic-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.8;
}

.category {
  background: hsla(160, 100%, 37%, 0.1);
  color: hsla(160, 100%, 37%, 1);
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.reply-count {
  background: var(--color-background-mute);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.topic-content {
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
}

.topic-expanded {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.replies h4,
.reply-form h4 {
  color: var(--color-heading);
  margin: 0 0 1rem 0;
}

.reply-item {
  background: var(--color-background);
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.reply-author {
  font-weight: 500;
  color: var(--color-heading);
}

.reply-date {
  color: var(--color-text);
  opacity: 0.8;
}

.reply-content {
  margin: 0;
  color: var(--color-text);
  line-height: 1.5;
}

.reply-form {
  background: var(--color-background);
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text);
  background: var(--color-background-soft);
  border-radius: 0.5rem;
}
</style>