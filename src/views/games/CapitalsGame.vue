<template>
  <main class="container">
    <div class="game-header">
      <button class="back-btn" @click="$router.go(-1)">← Бозгашт</button>
      <h1>Чолиши пойтахтҳо</h1>
    </div>
    
    <div class="game-content">
      <div class="placeholder-content">
        <h2>🏛️ Чолиши пойтахтҳо</h2>
        <p>Шинохти шумо нисбат ба пойтахтҳои мамлакатҳои ҷаҳонро санҷед!</p>
        <button class="btn btn-primary">Шуруъ кардани бозӣ</button>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'CapitalsGame'
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