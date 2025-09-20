<template>
  <main class="container">
    <div class="game-header">
      <button class="back-btn" @click="$router.go(-1)">← 返回</button>
      <h1>旗帜挑战</h1>
    </div>
    
    <div class="game-content">
      <p>旗帜游戏即将开始！这里将是旗帜识别游戏的内容。</p>
      <div class="placeholder-content">
        <h2>🏳️ 旗帜挑战</h2>
        <p>识别世界各国的旗帜，测试你的地理知识！</p>
        <button class="btn btn-primary">开始游戏</button>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'FlagsGame'
}
</script>

<style scoped>
.game-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.placeholder-content {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.placeholder-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.placeholder-content p {
  color: #666;
  margin-bottom: 2rem;
}
</style>