<template>
	<view class="container">
		<!-- 加载状态 -->
		<view v-if="isLoading" class="loading-wrapper">
			<view class="loading-spinner"></view>
			<text>加载中...</text>
		</view>

		<!-- 下拉刷新提示 -->
		<view v-if="isPulling" class="pull-tip">
			<uni-icons type="refresh" size="24" :class="{'rotating': isPulling}"></uni-icons>
			<text>{{pullText}}</text>
		</view>

		<!-- 引导用户 -->
		<view v-if="showGuide" class="guide-popup">
			<view class="guide-content">
				<text class="guide-title">欢迎来到地理知识挑战！</text>
				<text class="guide-description">选择您感兴趣的游戏模式开始挑战，点击下方的分享按钮与朋友一起玩吧！</text>
				<button @tap="closeGuide" class="skip-button">关闭引导</button>
			</view>
		</view>

		<!-- 顶部提示区 -->
		<view class="top-tips">
			<view class="tip-card" hover-class="tip-hover">
				<uni-icons type="info" size="20" color="#2979FF"></uni-icons>
				<text class="tip-text">欢迎来到地理知识挑战，选择您感兴趣的游戏模式开始挑战！</text>
			</view>
		</view>

		<!-- 顶部欢迎区 -->
		<view class="welcome-section">
			<view class="header">
				<text class="title">地理知识挑战</text>
				<text class="subtitle">测试你的地理知识，挑战高分！</text>
			</view>
			<view class="stats-bar">
				<view class="stats-item" v-for="(stat, index) in statsData" :key="index">
					<text class="stats-num" :class="{'animate': showStats}">{{stat.value}}</text>
					<text class="stats-label">{{stat.label}}</text>
					<text class="stats-trend" v-if="stat.trend">{{stat.trend > 0 ? '+' : ''}}{{stat.trend}}%</text>
				</view>
			</view>
			
			<!-- 新增：成就进度展示 -->
			<view class="achievement-bar">
				<view class="achievement-item" v-for="(achievement, key) in achievements" :key="key">
					<view class="progress-ring" :style="{ '--progress': `${achievement.progress * 3.6}deg` }">
						<text class="progress-text">{{achievement.progress}}%</text>
						<view class="progress-indicator" :class="{'completed': achievement.progress >= 100}"></view>
					</view>
					<text class="achievement-label">{{achievement.label}}</text>
					<!-- <text class="achievement-next-level">距离下一级：{{100 - achievement.progress}}%</text> -->
				</view>
			</view>
		</view>

		<!-- 新增：分享按钮 -->
		<view class="share-button" @tap="shareContent">
			<uni-icons type="share" size="32" color="#FFFFFF"></uni-icons>
			<text class="share-text">分享</text>
		</view>

		<!-- 增加间距 -->
		<view class="section-spacing"></view>

		<view class="section-title">
			<text class="main">选择游戏</text>
			<text class="sub">选择您感兴趣的挑战模式开始游戏</text>
		</view>

		<view class="search-bar">
			<uni-icons type="search" size="20" color="#666666"></uni-icons>
			<input 
				type="text" 
				v-model="searchKey" 
				placeholder="搜索游戏模式" 
				@input="searchGames"
			/>
		</view>

		<scroll-view scroll-x class="category-scroll">
			<view class="category-tags">
				<view 
					class="category-tag" 
					v-for="(tag, index) in categories" 
					:key="index"
					:class="{'active': currentCategory === tag}"
					@tap="filterByCategory(tag)"
				>
					{{tag}}
				</view>
			</view>
		</scroll-view>

		<view class="game-list">
			<view v-if="filteredGames.length === 0" class="no-games">
				<text>当前分类暂无游戏</text>
			</view>
			
			<view class="game-card" 
				  v-for="game in filteredGames" 
				  :key="game.key"
				  hover-class="card-hover" 
				  @tap="showGameDetails(game.key)">
				<view class="card-left">
					<view :class="['icon-wrapper', getIconColor(game.key), 'pulse']">
						<uni-icons :type="getGameIcon(game.key)" size="32" color="#FFFFFF"></uni-icons>
					</view>
				</view>
				<view class="card-right">
					<text class="game-title">{{game.title}}</text>
					<text class="game-desc">{{game.description}}</text>
					<view class="game-modes">
						<text class="mode-tag" v-for="mode in game.modes" :key="mode.name">
							{{mode.name}}
						</text>
						<view class="difficulty-tag" :class="getDifficultyClass(game.modes[0].difficulty)">
							难度: {{'★'.repeat(game.modes[0].difficulty)}}{{'☆'.repeat(3-game.modes[0].difficulty)}}
						</view>
					</view>
					<text class="game-bonus">首次通关奖励：{{game.rewards.firstWin}}积分</text>
				</view>
				<view class="card-actions">
					<button class="action-btn favorite" @tap.stop="toggleFavorite(game.key)">
						<uni-icons :type="isFavorite(game.key) ? 'star-filled' : 'star'" size="24" 
								 :color="isFavorite(game.key) ? '#FFD700' : '#999'"></uni-icons>
					</button>
					<text class="last-played" v-if="game.lastPlayed">
						上次游玩: {{formatDate(game.lastPlayed)}}
					</text>
				</view>
			</view>
		</view>

		<!-- 游戏模式详细介绍弹窗 -->
		<view v-if="showDetails" class="details-popup">
			<view class="popup-content">
				<text class="popup-title">{{ selectedGame.title }}</text>
				<text class="popup-description">{{ selectedGame.description }}</text>
				<view class="button-group">
					<button class="start-button" @tap="startGame(selectedGame.path)">开始游戏</button>
					<button class="close-button" @tap="closeDetails">关闭</button>
				</view>
			</view>
		</view>

		<!-- 排行榜展示 -->
		<view class="leaderboard">
			<text class="leaderboard-title">排行榜</text>
			<view v-for="(player, index) in leaderboard" :key="index" class="leaderboard-item">
				<text>{{ index + 1 }}. {{ player.name }} - {{ player.score }}</text>
			</view>
		</view>

		<!-- 底部提示区 -->
		<view class="bottom-tips">
			<view class="tip-card" hover-class="tip-hover">
				<uni-icons type="info" size="20" color="#2979FF"></uni-icons>
				<text class="tip-text">每个游戏模式都有独特的玩法和计分规则</text>
			</view>
			<view class="tip-card" hover-class="tip-hover">
				<uni-icons type="star" size="20" color="#FF9500"></uni-icons>
				<text class="tip-text">完成挑战可以获得积分和成就徽章</text>
			</view>
		</view>

		<!-- 帮助中心展示 -->
		<button @tap="openHelp" class="help-button">帮助中心</button> <!-- 添加帮助中心按钮 -->
		<help v-if="showHelp" @close="showHelp = false" /> <!-- 显示帮助中心 -->
		
		<!-- 添加主题切换按钮 -->
		<view class="theme-switch" @tap="toggleTheme">
			<uni-icons :type="isDarkMode ? 'sun' : 'moon'" size="24" :color="isDarkMode ? '#FFFFFF' : '#333333'"></uni-icons>
		</view>

		<!-- 添加返回顶部按钮 -->
		<view class="back-to-top" @tap="scrollToTop">
			<uni-icons type="arrow-up" size="24" color="#FFFFFF"></uni-icons>
		</view>

		<!-- 添加推荐游戏部分 -->
		<view class="recommended-section">
			<view class="section-header">
				<text class="title">推荐游戏</text>
				<text class="subtitle">根据您的游戏习惯推荐</text>
			</view>
			
			<scroll-view scroll-x class="recommended-scroll">
				<view class="recommended-games">
					<view class="recommend-card" 
						  v-for="game in recommendedGames" 
						  :key="game.key"
						  @tap="showGameDetails(game.key)">
						<view class="game-icon" :class="getIconColor(game.key)">
							<uni-icons :type="getGameIcon(game.key)" size="32" color="#FFFFFF"></uni-icons>
						</view>
						<text class="game-name">{{game.title}}</text>
						<text class="match-rate">匹配度 {{game.matchRate}}%</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 添加成就提示组件 -->
		<view v-if="showAchievement" class="achievement-popup">
			<view class="achievement-content">
				<view class="achievement-icon">
					<uni-icons type="star-filled" size="40" color="#FFD700"></uni-icons>
				</view>
				<text class="achievement-title">解锁新成就！</text>
				<text class="achievement-name">{{newAchievement.name}}</text>
				<text class="achievement-desc">{{newAchievement.description}}</text>
			</view>
		</view>

		<!-- 用于生成海报的画布（设置为不可见） -->
		<canvas 
			canvas-id="posterCanvas" 
			:style="{
				width: '750px',
				height: '1334px',
				position: 'fixed',
				left: '-9999px'
			}"
		></canvas>
	</view>
</template>
<script>
import Help from '../help/help.vue'; // 导入帮助中心组件
	export default {
		 components: {
        Help
    },
		data() {
			return {
				showStats: false,
				showDetails: false,
				showGuide: true, // 控制引导的显示
				selectedGame: {},
				achievements: {
					flags: { progress: 80, label: '旗帜大师', nextLevel: '金牌大师' },
					shapes: { progress: 45, label: '地形专家', nextLevel: '地形达人' },
					capitals: { progress: 60, label: '首都通', nextLevel: '首都专家' }
				},
				games: {
					flags: {
						title: '旗帜挑战',
						description: '探索世界各国的旗帜文化，从简单的国旗识别到深入了解旗帜的历史和含义。',
						modes: [
							{
								name: '初级模式',
								desc: '认识基本的国家旗帜',
								difficulty: 1
							},
							{
								name: '高级模式',
								desc: '挑战稀有和相似的旗帜',
								difficulty: 2
							}
						],
						rewards: {
							firstWin: 100,
							streak: '经验翻倍',
							achievement: '旗帜大师'
						},
						path: '/pages/game/flags/index'
					},
					shapes: {
						title: '轮廓挑战',
						description: '通过国家轮廓形状测试你的地理知识，培养空间识别能力。',
						modes: [
							{
								name: '基础认知',
								desc: '学习典型国家轮廓',
								difficulty: 2
							},
							{
								name: '速度挑战',
								desc: '限时识别国家形状',
								difficulty: 3
							}
						],
						rewards: {
							firstWin: 150,
							streak: '积分加成',
							achievement: '形状专家'
						},
						path: '/pages/game/shapes/index'
					},
					capitals: {
						title: '首都挑战',
						description: '测试你对世界各国首都的认知，从基础的首都匹配到深入的历史文化知识。',
						modes: [
							{
								name: '首都配对',
								desc: '将国家与其首都正确匹配',
								difficulty: 2
							},
							{
								name: '文化探索',
								desc: '了解首都的历史和文化特色',
								difficulty: 3
							}
						],
						rewards: {
							firstWin: 120,
							streak: '额外经验值',
							achievement: '首都专家'
						},
						path: '/pages/game/capitals/index'
					},
					timedChallenge: {
						title: '限时挑战',
						description: '在限定时间内回答尽可能多的地理问题，考验你的知识储备和反应速度。',
						modes: [
							{
								name: '快速答题',
								desc: '60秒内答题越多分数越高',
								difficulty: 2
							},
							{
								name: '生存模式',
								desc: '答错即结束，争取最高分',
								difficulty: 3
							}
						],
						rewards: {
							firstWin: 150,
							streak: '时间奖励',
							achievement: '时间大师'
						},
						path: '/pages/game/timedChallenge/index'
					},
					multiplayer: {
						title: '多人对战',
						description: '邀请好友一起参与地理知识竞赛，实时对战模式让学习更有趣。',
						modes: [
							{
								name: '好友对战',
								desc: '与好友进行1v1实时对战',
								difficulty: 2
							},
							{
								name: '团队竞赛',
								desc: '组队进行多人竞赛',
								difficulty: 2
							}
						],
						rewards: {
							firstWin: 200,
							streak: '胜利连击奖励',
							achievement: '对战王者'
						},
						path: '/pages/game/multiplayer/index'
					},
					randomMode: {
						title: '随机模式',
						description: '融合所有题型的随机挑战，每次体验都不同，提升综合地理知识。',
						modes: [
							{
								name: '随机闯关',
								desc: '随机组合各类题型进行挑战',
								difficulty: 3
							},
							{
								name: '每日挑战',
								desc: '每天固定题目组合',
								difficulty: 2
							}
						],
						rewards: {
							firstWin: 180,
							streak: '随机奖励翻倍',
							achievement: '全能达人'
						},
						path: '/pages/game/randomMode/index'
					}
				},
				leaderboard: [], // 存储排行榜数据
				showHelp: false, // 控制帮助中心的显示
				statsData: [
					{ value: '12', label: '游戏模式', trend: 5 },
					{ value: '200+', label: '题目数量', trend: 10 },
					{ value: '10K+', label: '挑战次数', trend: 15 }
				],
				isDarkMode: false,
				searchKey: '',
				filteredGames: [],
				currentCategory: '全部',
				categories: ['全部', '入门', '进阶', '挑战', '多人'],
				scrollTop: 0,
				gameCategories: {
					flags: ['入门', '进阶'],
					shapes: ['进阶', '挑战'],
					capitals: ['入门', '进阶'],
					timedChallenge: ['挑战'],
					multiplayer: ['多人'],
					randomMode: ['挑战', '多人']
				},
				isLoading: false,
				isPulling: false,
				pullText: '下拉刷新',
				recommendedGames: [],
				showAchievement: false,
				newAchievement: null,
				favoriteGames: [],
				recentGames: []
			}
		},
		created() {
			// 确保 games 数据已经加载
			if (this.games) {
				this.initGamesList();
			}
		},
		mounted() {
			this.showStats = true;
			this.checkGuideStatus(); // 检查引导状态
			this.generateRandomLeaderboard(); // 生成随机排行榜数据
		},
		methods: {
			openHelp() {
				this.showHelp = true; // 打开帮助中心
			},
		
			navigateToGame(url) {
					uni.navigateTo({
						url
					})
			},
			async shareContent() {
				try {
					// 生成海报
					const posterUrl = await this.generatePoster();
					
					// 显示分享操作菜单
					uni.showActionSheet({
						itemList: ['分享给好友', '转发到朋友圈', '保存海报到相册'],
						success: (res) => {
							switch (res.tapIndex) {
								case 0:
									uni.showToast({
										title: '请点击右上角分享',
										icon: 'none'
									});
									break;
								case 1:
									// 转发到朋友圈
									if (wx.updateTimelineShareData) {
										wx.updateTimelineShareData({
											title: '地理知识挑战',
											query: '',
											imageUrl: posterUrl,
											success: () => {
												uni.showToast({
													title: '请点击右上角转发到朋友圈',
													icon: 'none'
												});
											}
										});
									} else {
										uni.showToast({
											title: '当前环境不支持转发到朋友圈',
											icon: 'none'
										});
									}
									break;
								case 2:
									this.savePoster(posterUrl);
									break;
							}
						}
					});
				} catch (error) {
					uni.showToast({
						title: '生成海报失败',
						icon: 'none'
					});
					console.error('生成海报失败:', error);
				}
			},

			// 生成海报
			generatePoster() {
				return new Promise((resolve, reject) => {
					const ctx = uni.createCanvasContext('posterCanvas');
					
					// 设置画布大小
					const canvasWidth = 750;
					const canvasHeight = 1334;
					
					// 绘制背景
					ctx.setFillStyle('#FFFFFF');
					ctx.fillRect(0, 0, canvasWidth, canvasHeight);
					
					// 绘制标题
					ctx.setFontSize(48);
					ctx.setFillStyle('#333333');
					ctx.setTextAlign('center');
					ctx.fillText('地理知识挑战', canvasWidth/2, 200);
					
					// 绘制描述
					ctx.setFontSize(32);
					ctx.setFillStyle('#666666');
					ctx.fillText('测试你的地理知识，挑战高分！', canvasWidth/2, 300);
					
					// 绘制统计数据
					this.statsData.forEach((stat, index) => {
						const y = 500 + index * 100;
						ctx.setFontSize(40);
						ctx.setFillStyle('#2979FF');
						ctx.fillText(stat.value, canvasWidth/2, y);
						
						ctx.setFontSize(28);
						ctx.setFillStyle('#666666');
						ctx.fillText(stat.label, canvasWidth/2, y + 40);
					});
					
					// 绘制二维码（如果有）
					// ctx.drawImage('qrcode.png', canvasWidth/2 - 100, 900, 200, 200);
					
					// 绘制底部文字
					ctx.setFontSize(24);
					ctx.setFillStyle('#999999');
					ctx.fillText('长按识别二维码，开始你的地理知识之旅', canvasWidth/2, 1200);
					
					// 执行绘制
					ctx.draw(false, () => {
						// 将画布内容转换为图片
						uni.canvasToTempFilePath({
							canvasId: 'posterCanvas',
							success: (res) => {
								resolve(res.tempFilePath);
							},
							fail: reject
						});
					});
				});
			},

			// 保存海报到相册
			async savePoster(posterUrl) {
				try {
					// 先获取相册授权
					const auth = await this.getPhotoAuth();
					if (!auth) {
						throw new Error('未获得相册权限');
					}
					
					// 获得授权后保存图片
					await uni.saveImageToPhotosAlbum({
						filePath: posterUrl
					});
					
					uni.showToast({
						title: '海报已保存到相册',
						icon: 'success'
					});
					
				} catch (error) {
					uni.showToast({
						title: error.message || '保存失败',
						icon: 'none'
					});
				}
			},

			// 获取相册授权方法
			async getPhotoAuth() {
				try {
					const res = await uni.authorize({
						scope: 'scope.writePhotosAlbum'
					});
					return true;
				} catch (error) {
					// 用户拒绝授权,引导用户去开启
					const confirm = await uni.showModal({
						title: '提示',
						content: '需要您授权保存图片到相册',
						confirmText: '去设置'
					});
					
					if (confirm.confirm) {
						uni.openSetting();
					}
					return false;
				}
			},
			showGameDetails(gameKey) {
				this.selectedGame = this.games[gameKey];
				this.showDetails = true;
			},
			closeDetails() {
				this.showDetails = false;
			},
			startGame(path) {
				this.closeDetails();
				this.navigateToGame(path);
			},
			closeGuide() {
				this.showGuide = false; // 关闭引导
				wx.setStorageSync('guideClosed', 'true'); // 记录用户关闭引导的状态
			},
			checkGuideStatus() {
				const guideStatus = wx.getStorageSync('guideClosed'); // 获取存储的引导状态
				if (guideStatus) {
					this.showGuide = false; // 如果用户关闭过引导，则不再显示
				}
			},
			// 生成随机排行榜数据
			generateRandomLeaderboard() {
				const names = ['玩家1', '玩家2', '玩家3', '玩家4', '玩家5', '玩家6', '玩家7', '玩家8', '玩家9', '玩家10'];
				this.leaderboard = names.map(name => ({
					name: name,
					score: Math.floor(Math.random() * 1000) // 随机生成0到999的分数
				}));
				// 按分数降序排序
				this.leaderboard.sort((a, b) => b.score - a.score);
			},
			// 获取排行榜数据
			fetchLeaderboard() {
				// 假设有一个 API 可以获取排行榜数据
				fetch('/api/leaderboard')
					.then(response => response.json())
					.then(data => {
						this.leaderboard = data; // 更新排行榜数据
					})
					.catch(error => {
						console.error('获取排行榜失败', error);
					});
			},
			// 提交分数到排行榜
			submitScore(playerName, score) {
				// 假设有一个 API 可以提交分数
				fetch('/api/leaderboard', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ name: playerName, score: score })
				})
				.then(response => response.json())
				.then(data => {
					console.log('分数提交成功', data);
					this.fetchLeaderboard(); // 提交后重新获取排行榜
				})
				.catch(error => {
					console.error('提交分数失败', error);
				});
			},
			endGame(score) {
				const playerName = prompt("请输入您的名字"); // 获取玩家名字
				this.submitScore(playerName, score); // 提交分数
			},
			async onPullDownRefresh() {
				this.isPulling = true;
				this.pullText = '刷新中...';
				
				try {
					await Promise.all([
						this.refreshGameData(),
						this.updateAchievements(),
						this.fetchLeaderboard()
					]);
					
					uni.showToast({
						title: '刷新成功',
						icon: 'success'
					});
				} catch (error) {
					uni.showToast({
						title: '刷新失败',
						icon: 'error'
					});
				} finally {
					this.isPulling = false;
					this.pullText = '下拉刷新';
					uni.stopPullDownRefresh();
				}
			},
			onReachBottom() {
				// 加载更多排行榜数据
				if (this.hasMoreLeaderboard) {
					this.loadMoreLeaderboard();
				}
			},
			toggleTheme() {
				this.isDarkMode = !this.isDarkMode;
				// 保存主题设置
				uni.setStorageSync('theme', this.isDarkMode ? 'dark' : 'light');
			},
			searchGames() {
				// 先按分类过滤
				this.filterByCategory(this.currentCategory);
				
				// 如果有搜索关键词，进一步过滤
				if (this.searchKey) {
					this.filteredGames = this.filteredGames.filter(game => 
						game.title.includes(this.searchKey) || 
						game.description.includes(this.searchKey)
					);
				}
			},
			filterByCategory(category) {
				console.log('Filtering by category:', category); // 调试日志
				
				this.currentCategory = category;
				
				// 将 games 对象转换为数组，并添加 key
				const gamesArray = Object.entries(this.games).map(([key, game]) => ({
					...game,
					key
				}));
				
				if (category === '全部') {
					this.filteredGames = gamesArray;
				} else {
					this.filteredGames = gamesArray.filter(game => 
						this.gameCategories[game.key].includes(category)
					);
				}
				
				console.log('Filtered games:', this.filteredGames); // 调试日志
			},
			onPageScroll(e) {
				this.scrollTop = e.scrollTop;
			},
			getIconColor(gameKey) {
				const colorMap = {
					flags: 'blue',
					shapes: 'orange',
					capitals: 'green',
					timedChallenge: 'purple',
					multiplayer: 'red',
					randomMode: 'yellow'
				};
				return colorMap[gameKey] || 'blue';
			},
			getGameIcon(gameKey) {
				const iconMap = {
					flags: 'flag',
					shapes: 'map',
					capitals: 'location',
					timedChallenge: 'calendar',
					multiplayer: 'person',
					randomMode: 'paperplane'
				};
				return iconMap[gameKey] || 'star';
			},
			// 初始化游戏列表
			initGamesList() {
				this.filterByCategory('全部');
			},
			generateRecommendations() {
				const recommendations = Object.entries(this.games)
					.map(([key, game]) => {
						// 计算推荐分数
						let score = 0;
						
						// 根据收藏加分
						if (this.isFavorite(key)) score += 3;
						
						// 根据最近游玩时间加分
						const recentGame = this.recentGames.find(g => g.key === key);
						if (recentGame) {
							const daysSinceLastPlayed = (new Date() - new Date(recentGame.lastPlayed)) / 86400000;
							score += Math.max(0, 5 - daysSinceLastPlayed);
						}
						
						// 根据难度匹配用户水平加分
						const userLevel = this.getUserLevel();
						const difficultyMatch = Math.abs(userLevel - game.modes[0].difficulty);
						score += (3 - difficultyMatch);
						
						return {
							...game,
							key,
							matchRate: Math.min(100, Math.round(score * 20)) // 将分数转换为百分比
						};
					})
					.sort((a, b) => b.matchRate - a.matchRate)
					.slice(0, 3);
					
				this.recommendedGames = recommendations;
			},
			showAchievementPopup(achievement) {
				this.newAchievement = achievement;
				this.showAchievement = true;
				
				setTimeout(() => {
					this.showAchievement = false;
				}, 3000);
			},
			toggleFavorite(gameKey) {
				const index = this.favoriteGames.indexOf(gameKey);
				if (index > -1) {
					this.favoriteGames.splice(index, 1);
					uni.showToast({ title: '已取消收藏', icon: 'none' });
				} else {
					this.favoriteGames.push(gameKey);
					uni.showToast({ title: '已收藏', icon: 'success' });
				}
				// 保存到本地存储
				uni.setStorageSync('favoriteGames', this.favoriteGames);
			},
			
			isFavorite(gameKey) {
				return this.favoriteGames.includes(gameKey);
			},
			updateGameHistory(gameKey) {
				const now = new Date();
				const gameIndex = this.recentGames.findIndex(g => g.key === gameKey);
				
				if (gameIndex > -1) {
					this.recentGames[gameIndex].lastPlayed = now;
				} else {
					this.recentGames.push({
						key: gameKey,
						lastPlayed: now
					});
				}
				
				// 只保留最近的10条记录
				this.recentGames = this.recentGames
					.sort((a, b) => b.lastPlayed - a.lastPlayed)
					.slice(0, 10);
					
				// 保存到本地存储
				uni.setStorageSync('recentGames', this.recentGames);
			},
			
			formatDate(date) {
				const d = new Date(date);
				const now = new Date();
				const diff = now - d;
				
				if (diff < 86400000) { // 24小时内
					return '今天';
				} else if (diff < 172800000) { // 48小时内
					return '昨天';
				} else {
					return `${d.getMonth() + 1}月${d.getDate()}日`;
				}
			},
			async initData() {
				try {
					// 从本地存储加载数据
					const favoriteGames = uni.getStorageSync('favoriteGames') || [];
					const recentGames = uni.getStorageSync('recentGames') || [];
					const userPreferences = uni.getStorageSync('userPreferences') || {};
					
					this.favoriteGames = favoriteGames;
					this.recentGames = recentGames;
					
					// 生成推荐
					this.generateRecommendations();
					
					// 初始化游戏列表
					this.initGamesList();
					
				} catch (error) {
					console.error('初始化数据失败:', error);
					uni.showToast({
						title: '加载数据失败',
						icon: 'none'
					});
				}
			},
			// 添加获取用户等级的方法
			getUserLevel() {
				// 这里可以根据实际需求计算用户等级
				// 暂时返回默认值 1 (初级)
				return 1;
			},
			getDifficultyClass(difficulty) {
				if (difficulty <= 1) return 'easy';
				if (difficulty === 2) return 'medium';
				return 'hard';
			}
		},
		// 添加监听器以便调试
		watch: {
			currentCategory(newVal) {
				console.log('Category changed to:', newVal);
			},
			
			filteredGames(newVal) {
				console.log('Filtered games updated:', newVal);
			}
		},
		// 添加小程序分享方法
		onShareAppMessage() {
			return {
				title: '地理知识挑战',
				desc: '来挑战你的地理知识吧！',
				path: '/pages/index/index',
				imageUrl: '' // 可选，分享显示的图片链接
			}
		},
		// 如果需要分享到朋友圈，还可以添加
		onShareTimeline() {
			return {
				title: '地理知识挑战',
				query: '',
				imageUrl: '' // 可选，分享显示的图片链接
			}
		},
		// 在页面加载时初始化数据
		onLoad() {
			this.initData();
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background: v-bind('isDarkMode ? "#1a1a1a" : "#f5f7fa"');
		color: v-bind('isDarkMode ? "#FFFFFF" : "#333333"');
		transition: all 0.3s ease;
		padding: 30rpx;
		padding-bottom: 120rpx; // 为底部导航留出空间
	}

	.header {
		text-align: center;
		margin: 40rpx 0 60rpx;
	}

	.title {
		font-size: 44rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 16rpx;
		display: block;
	}

	.subtitle {
		font-size: 28rpx;
		color: #666;
	}

	.game-list {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		padding: 20rpx 0;
		margin: 20rpx 0;
	}

	.game-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		display: flex;
		align-items: flex-start;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
		opacity: 0;
		transform: translateY(20rpx);
		
		&.show {
			opacity: 1;
			transform: translateY(0);
		}
		
		@for $i from 1 through 10 {
			&:nth-child(#{$i}) {
				animation: slideIn 0.3s ease forwards;
				animation-delay: #{$i * 0.1}s;
			}
		}
		
		&:active {
			transform: scale(0.98);
			opacity: 0.95;
		}
		
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
			pointer-events: none;
		}
		
		&:hover, &.hover {
			transform: translateY(-4rpx);
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
			
			.icon-wrapper {
				transform: scale(1.05);
			}
		}
		
		.icon-wrapper {
			transition: transform 0.3s ease;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.card-left {
		margin-right: 30rpx;
	}

	.icon-wrapper {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		
		&.blue {
			background: linear-gradient(135deg, #2979FF, #1565C0);
		}
		
		&.orange {
			background: linear-gradient(135deg, #FF9500, #F57C00);
		}
		
		&.green {
			background: linear-gradient(135deg, #34C759, #28A745);
		}

		&.purple {
			background: linear-gradient(135deg, #9C27B0, #7B1FA2);
		}

		&.red {
			background: linear-gradient(135deg, #F44336, #D32F2F);
		}

		&.yellow {
			background: linear-gradient(135deg, #FFEB3B, #FBC02D);
		}
	}

	.card-right {
		flex: 1;
	}

	.game-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
		display: block;
	}

	.game-desc {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 16rpx;
		display: block;
	}

	.game-modes {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 10rpx;
		
		.mode-tag {
			font-size: 24rpx;
			color: #2979FF;
			background: linear-gradient(135deg, rgba(41, 121, 255, 0.1), rgba(41, 121, 255, 0.2));
			border: 1px solid rgba(41, 121, 255, 0.2);
			backdrop-filter: blur(5px);
			padding: 6rpx 16rpx;
			border-radius: 100rpx;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			
			&:hover {
				transform: translateY(-2rpx);
				box-shadow: 0 2rpx 8rpx rgba(41, 121, 255, 0.2);
			}
		}
		
		.difficulty {
			font-size: 24rpx;
			color: #FF9500;
			margin-left: auto;
		}
	}

	.game-bonus {
		font-size: 24rpx;
		color: #34C759;
		margin-top: 8rpx;
	}

	.welcome-section {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	}

	.stats-bar {
		display: flex;
		justify-content: space-around;
		margin-top: 20rpx;
		padding-top: 20rpx;
	}

	.stats-item {
		text-align: center;
	}

	.stats-num {
		font-size: 42rpx;
		font-weight: bold;
		color: #2979FF;
		display: block;
		margin-bottom: 2rpx;
		opacity: 0;
		
		&.animate {
			animation: statsNumberIn 0.6s forwards;
		}
	}

	@keyframes statsNumberIn {
		from {
			opacity: 0;
			transform: translateY(10rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.stats-label {
		font-size: 24rpx;
		color: #666;
	}

	.section-title {
		margin: 40rpx 0 20rpx;
		
		.main {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 8rpx;
			position: relative;
			
			&::after {
				content: '';
				position: absolute;
				bottom: -8rpx;
				left: 0;
				width: 40rpx;
				height: 4rpx;
				background: #2979FF;
				border-radius: 2rpx;
			}
		}
		
		.sub {
			font-size: 26rpx;
			color: #666;
		}
	}

	.bottom-tips {
		margin-top: 40rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.tip-card {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 16rpx;
		padding: 20rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255,255,255,0.1);
		
		.tip-text {
			font-size: 26rpx;
			color: #666;
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.card-hover {
		transform: scale(0.98);
		opacity: 0.95;
		transition: all 0.2s ease;
	}

	.tip-hover {
		transform: translateX(10rpx);
		opacity: 0.8;
	}

	.icon-wrapper {
		&.pulse {
			animation: pulse 2s infinite;
		}
		
		&.blue {
			background: linear-gradient(135deg, #2979FF, #1565C0);
			box-shadow: 0 4rpx 20rpx rgba(41, 121, 255, 0.2);
		}
		
		&.orange {
			background: linear-gradient(135deg, #FF9500, #F57C00);
			box-shadow: 0 4rpx 20rpx rgba(255, 149, 0, 0.2);
		}
		
		&.green {
			background: linear-gradient(135deg, #34C759, #28A745);
			box-shadow: 0 4rpx 20rpx rgba(52, 199, 89, 0.2);
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}

	.game-modes {
		.mode-tag {
			transition: all 0.3s ease;
			
			&:hover {
				background: rgba(41, 121, 255, 0.2);
				transform: translateX(4rpx);
			}
		}
	}

	.achievement-bar {
		display: flex;
		justify-content: space-around;
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 2rpx solid rgba(0, 0, 0, 0.05);
	}

	.achievement-item {
		text-align: center;
	}

	.progress-ring {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: conic-gradient(#2979FF var(--progress), #E8F0FE 0deg);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 10rpx;
		position: relative;
		
		&::before {
			content: '';
			position: absolute;
			width: 70rpx;
			height: 70rpx;
			background: white;
			border-radius: 50%;
		}
	}

	.progress-text {
		font-size: 28rpx;
		font-weight: bold;
		color: #2979FF;
		position: relative;
		z-index: 1;
	}

	.achievement-label {
		font-size: 24rpx;
		color: #666;
		margin-top: 2rpx;
	}

	@keyframes shimmer {
		100% {
			transform: translateX(100%);
		}
	}

	.section-spacing {
		height: 20rpx; // 增加顶部提示区和游戏选择部分之间的间距
	}

	.top-tips {
		margin-bottom: 20rpx; // 提示区底部间距
	}

	.tip-card {
		padding: 15rpx; // 提示卡片内边距
		border-radius: 10rpx; // 圆角
		background: rgba(255, 255, 255, 0.9); // 背景颜色
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1); // 阴影效果
	}

	.top-description {
		margin-bottom: 10rpx; // 描述与提示区之间的间距
		text-align: center; // 文本居中
	}

	.description-text {
		font-size: 28rpx; // 描述文本大小
		color: #333; // 描述文本颜色
		font-weight: bold; // 描述文本加粗
	}

	.share-button {
		background: #2979FF;
		border-radius: 24rpx;
		padding: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 20rpx 0;
		cursor: pointer;
	}

	.share-text {
		color: #FFFFFF;
		font-size: 28rpx;
		margin-left: 10rpx;
	}

	.details-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8); /* 深色背景 */
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.popup-content {
		background: white; /* 白色背景 */
		padding: 30rpx; /* 增加内边距 */
		border-radius: 20rpx; /* 圆角 */
		text-align: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2); /* 阴影效果 */
		max-width: 90%; /* 限制最大宽度 */
	}

	.popup-title {
		font-size: 32rpx; /* 标题字体大小 */
		font-weight: bold;
		color: #2979FF; /* 主题颜色 */
		margin-bottom: 15rpx; /* 底部间距 */
	}

	.popup-description {
		font-size: 26rpx; /* 描述字体大小 */
		color: #333; /* 深色文本 */
		margin-bottom: 25rpx; /* 底部间距 */
		line-height: 1.5; /* 行高 */
	}

	.button-group {
		display: flex; /* 使用 flexbox 布局 */
		justify-content: space-around; /* 按钮之间的间距 */
		margin-top: 20rpx; /* 顶部间距 */
	}

	button {
		color: white; /* 按钮文本颜色 */
		border: none; /* 无边框 */
		padding: 12rpx 20rpx; /* 内边距 */
		border-radius: 5rpx; /* 圆角 */
		cursor: pointer; /* 鼠标指针 */
		flex: 1; /* 按钮均分宽度 */
		transition: background 0.3s; /* 背景颜色过渡效果 */
		margin: 5rpx; /* 按钮间距 */
	}

	.start-button {
		background: #2979FF; /* 开始游戏按钮颜色 */
	}

	.start-button:hover {
		background: #1E88E5; /* 悬停时变色 */
	}

	.close-button {
		background: #FF5722; /* 关闭按钮颜色 */
	}

	.close-button:hover {
		background: #E64A19; /* 悬停时变色 */
	}

	.guide-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8); /* 深色背景 */
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.guide-content {
		background: white; /* 白色背景 */
		padding: 30rpx; /* 增加内边距 */
		border-radius: 20rpx; /* 圆角 */
		text-align: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2); /* 阴影效果 */
		max-width: 90%; /* 限制最大宽度 */
	}

	.guide-title {
		font-size: 32rpx; /* 标题字体大小 */
		font-weight: bold;
		color: #2979FF; /* 主题颜色 */
		margin-bottom: 15rpx; /* 底部间距 */
	}

	.guide-description {
		font-size: 26rpx; /* 描述字体大小 */
		color: #333; /* 深色文本 */
		margin-bottom: 25rpx; /* 底部间距 */
		line-height: 1.5; /* 行高 */
	}

	button {
		background: #2979FF; /* 按钮背景颜色 */
		color: white; /* 按钮文本颜色 */
		border: none; /* 无边框 */
		padding: 12rpx 20rpx; /* 内边距 */
		border-radius: 5rpx; /* 圆角 */
		cursor: pointer; /* 鼠标指针 */
		margin: 5rpx; /* 按钮间距 */
		transition: background 0.3s; /* 背景颜色过渡效果 */
	}

	button:hover {
		background: #1E88E5; /* 悬停时变色 */
	}
	
	.leaderboard {
		background: #fff;
		border-radius: 24rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		margin-top: 20rpx;

		.leaderboard-title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 10rpx;
		}

		.leaderboard-item {
			font-size: 24rpx;
			color: #333;
			margin: 5rpx 0;
		}
	}

	.skip-button {
		background: #2979FF; /* 背景颜色 */
		color: #FFFFFF; /* 字体颜色 */
		padding: 10rpx 20rpx; /* 内边距 */
		border-radius: 24rpx; /* 圆角 */
		margin-top: 10rpx; /* 上边距 */
		border: none; /* 无边框 */
		cursor: pointer; /* 鼠标指针 */
		transition: background 0.3s; /* 背景颜色过渡效果 */
	}

	.skip-button:hover {
		background: #1E88E5; /* 悬停时变色 */
	}

	.help-button {
		background: linear-gradient(135deg, #2979FF, #1E88E5); /* 渐变背景 */
		color: white; /* 字体颜色 */
		padding: 12rpx 24rpx; /* 内边距 */
		border-radius: 30rpx; /* 圆角 */
		border: none; /* 无边框 */
		cursor: pointer; /* 鼠标指针 */
		transition: background 0.3s, transform 0.2s; /* 背景颜色和缩放过渡效果 */
		font-size: 28rpx; /* 字体大小 */
		margin-top: 20rpx; /* 上边距 */
	}

	.help-button:hover {
		background: linear-gradient(135deg, #1E88E5, #1565C0); /* 悬停时变色 */
		transform: scale(1.05); /* 悬停时放大 */
	}

	.theme-switch {
		position: fixed;
		top: 40rpx;
		right: 40rpx;
		z-index: 100;
		padding: 20rpx;
		border-radius: 50%;
		background: v-bind('isDarkMode ? "#333333" : "#FFFFFF"');
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 12rpx;
		background: #FFFFFF;
		padding: 16rpx 24rpx;
		border-radius: 100rpx;
		margin: 20rpx 0;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		
		input {
			flex: 1;
			font-size: 28rpx;
			color: #333333;
		}
	}

	.category-scroll {
		margin: 20rpx 0;
		white-space: nowrap;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		
		&::-webkit-scrollbar {
			display: none;
		}
	}

	.category-tags {
		display: flex;
		flex-wrap: nowrap;
		gap: 16rpx;
		padding: 20rpx;
		overflow-x: auto;
		
		.category-tag {
			padding: 12rpx 24rpx;
			border-radius: 100rpx;
			font-size: 26rpx;
			background: #F5F5F5;
			color: #666666;
			white-space: nowrap;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			
			&.active {
				background: #2979FF;
				color: #FFFFFF;
				transform: scale(1.05);
				font-weight: bold;
			}
			
			&:active {
				transform: scale(0.95);
			}
		}
	}

	.back-to-top {
		position: fixed;
		right: 40rpx;
		bottom: 120rpx;
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #2979FF;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: v-bind('scrollTop > 300 ? 1 : 0');
		transition: opacity 0.3s;
	}

	.loading-wrapper {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
		opacity: 0;
		transition: opacity 0.3s ease;
		
		&.show {
			opacity: 1;
		}
	}

	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid #f3f3f3;
		border-top: 4rpx solid #2979FF;
		border-radius: 50%;
		animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	.pull-tip {
		text-align: center;
		padding: 20rpx;
		color: #666;
		
		.rotating {
			animation: rotate 1s linear infinite;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.recommended-section {
		margin: 20rpx 0;
		padding: 20rpx;
		
		.section-header {
			margin-bottom: 20rpx;
			
			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
			
			.subtitle {
				font-size: 24rpx;
				color: #666;
				margin-left: 10rpx;
			}
		}
	}

	.recommended-scroll {
		white-space: nowrap;
		
		.recommended-games {
			display: inline-flex;
			gap: 20rpx;
			padding: 10rpx;
		}
	}

	.recommend-card {
		background: #FFFFFF;
		padding: 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
		
		.game-icon {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		
		.game-name {
			font-size: 28rpx;
			color: #333;
		}
		
		.match-rate {
			font-size: 24rpx;
			color: #2979FF;
		}
	}

	.achievement-popup {
		position: fixed;
		top: 20%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.8);
		padding: 20rpx 40rpx;
		border-radius: 16rpx;
		color: #FFFFFF;
		animation: slideDown 0.3s ease-out;
		z-index: 1000;
		
		.achievement-content {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10rpx;
		}
		
		.achievement-title {
			font-size: 32rpx;
			font-weight: bold;
		}
		
		.achievement-name {
			font-size: 28rpx;
			color: #FFD700;
		}
		
		.achievement-desc {
			font-size: 24rpx;
			opacity: 0.8;
		}
	}

	@keyframes slideDown {
		from {
			transform: translate(-50%, -100%);
			opacity: 0;
		}
		to {
			transform: translate(-50%, 0);
			opacity: 1;
		}
	}

	.card-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid rgba(0,0,0,0.1);
		
		.action-btn {
			background: none;
			border: none;
			padding: 0;
			margin: 0;
			line-height: 1;
			
			&.favorite {
				transition: transform 0.2s;
				&:active {
					transform: scale(1.2);
				}
			}
		}
		
		.last-played {
			font-size: 24rpx;
			color: #999;
		}
	}

	.difficulty-tag {
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 100rpx;
		margin-left: auto;
		
		&.easy {
			color: #34C759;
			background: rgba(52, 199, 89, 0.1);
		}
		
		&.medium {
			color: #FF9500;
			background: rgba(255, 149, 0, 0.1);
		}
		
		&.hard {
			color: #FF3B30;
			background: rgba(255, 59, 48, 0.1);
		}
	}
</style>
