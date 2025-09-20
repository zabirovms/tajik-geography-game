<template>
  <div id="app">
    <nav class="nav-bar">
      <div class="nav-title">Chālish-i Dānish-i Jughrāfiyā</div>
    </nav>
    
    <router-view />
    
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">Khona</span>
      </router-link>
      <router-link to="/achievements" class="nav-item">
        <span class="nav-icon">🏆</span>
        <span class="nav-text">Dastāvardhā</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <span class="nav-icon">👤</span>
        <span class="nav-text">Man</span>
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
  padding: 0.5rem 0;
  z-index: 100;
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

main {
  padding-bottom: 70px; /* Space for bottom nav */
}
</style>