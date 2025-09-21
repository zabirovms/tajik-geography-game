<template>
  <div id="app">
    <nav class="nav-bar">
      <div class="nav-title">Чолиши дониши ҷуғрофия</div>
    </nav>
    
    <router-view />
    
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">Хона</span>
      </router-link>
      <router-link to="/achievements" class="nav-item">
        <span class="nav-icon">🏆</span>
        <span class="nav-text">Дастовардҳо</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <span class="nav-icon">👤</span>
        <span class="nav-text">Ман</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  z-index: 1000;
  height: 70px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  padding: 0.25rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.nav-item.router-link-active {
  color: #2979FF;
}

.nav-icon {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.nav-text {
  font-size: 0.75rem;
}

/* Global spacing for bottom navigation - applies to ALL routes */
body {
  padding-bottom: 80px;
}

/* Ensure all page containers have proper spacing */
main, .container, .shapes-game, .map-test-page {
  min-height: calc(100vh - 80px);
}

/* Global container adjustments */
#app {
  min-height: 100vh;
  position: relative;
  padding-bottom: 80px;
}
</style>