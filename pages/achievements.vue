<template>
	<view class="container">
		<view class="header">
			<text class="title">我的成就</text>
			<text class="subtitle">查看您的游戏进度和成就</text>
			<view class="overall-progress">
				<text class="progress-text">总体完成度：{{ overallProgress }}%</text>
				<view class="overall-progress-bar">
					<view class="overall-progress-fill" :style="{ width: `${overallProgress}%` }"></view>
				</view>
			</view>
		</view>

		<view class="filter-section">
			<view class="categories">
				<text 
					v-for="category in categories" 
					:key="category.id"
					:class="['category-tag', { active: currentCategory === category.id }]"
					@tap="selectCategory(category.id)"
				>
					{{ category.name }}
				</text>
			</view>
			<view class="search-box">
				<input 
					type="text" 
					v-model="searchQuery" 
					placeholder="搜索成就..."
					@input="handleSearch"
				/>
			</view>
		</view>

		<view class="recent-achievements" v-if="recentUnlocked.length">
			<text class="section-title">最近获得</text>
			<scroll-view scroll-x class="recent-scroll">
				<view 
					v-for="achievement in recentUnlocked" 
					:key="achievement.title"
					class="recent-achievement-item"
				>
					<text class="recent-title">{{ achievement.title }}</text>
					<text class="unlock-time">{{ achievement.unlockTime }}</text>
				</view>
			</scroll-view>
		</view>

		<view class="achievement-list">
			<view 
				class="achievement-item" 
				v-for="(achievement, index) in filteredAchievements" 
				:key="index"
				:class="{ 'achievement-unlocked': achievement.progress >= 100 }"
			>
				<view class="achievement-content">
					<text class="achievement-title">{{ achievement.title }}</text>
					<text class="achievement-description">{{ achievement.description }}</text>
					<view class="progress-bar">
						<view 
							class="progress-fill"
							:style="{ width: `${Math.min(achievement.progress, 100)}%` }"
						></view>
					</view>
				</view>
				<view class="achievement-info">
					<text class="achievement-progress">{{ achievement.progress }}%</text>
					<text class="achievement-status">
						{{ achievement.progress >= 100 ? '已完成' : '进行中' }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchQuery: '',
				currentCategory: 'all',
				categories: [
					{ id: 'all', name: '全部' },
					{ id: 'flags', name: '国旗' },
					{ id: 'capitals', name: '首都' },
					{ id: 'geography', name: '地理' },
					{ id: 'culture', name: '文化' }
				],
				recentUnlocked: [
					{
						title: '文化探索者',
						unlockTime: '2024-03-20'
					},
					{
						title: '旗帜大师',
						unlockTime: '2024-03-19'
					}
				],
				achievements: [
					{ 
						title: '旗帜大师', 
						progress: 80,
						description: '认识100面国旗' 
					},
					{ 
						title: '地形专家', 
						progress: 45,
						description: '完成所有地形相关的挑战' 
					},
					{ 
						title: '首都通', 
						progress: 60,
						description: '正确回答50个首都相关的问题'
					},
					{ 
						title: '知识达人', 
						progress: 90,
						description: '累计答对1000道地理知识题'
					},
					{ 
						title: '挑战者', 
						progress: 70,
						description: '完成30个限时挑战任务'
					},
					{ 
						title: '地理小能手', 
						progress: 85,
						description: '在每个大洲获得至少一枚金牌'
					},
					{ 
						title: '世界旅行者', 
						progress: 75,
						description: '探索完成所有大洲的地理知识'
					},
					{ 
						title: '文化探索者', 
						progress: 50,
						description: '了解20个不同国家的文化特色'
					}
				]
			}
		},
		computed: {
			overallProgress() {
				const total = this.achievements.length;
				const completed = this.achievements.filter(a => a.progress >= 100).length;
				return Math.round((completed / total) * 100);
			},
			filteredAchievements() {
				return this.achievements.filter(achievement => {
					const matchesSearch = achievement.title.toLowerCase().includes(this.searchQuery.toLowerCase());
					const matchesCategory = this.currentCategory === 'all' || achievement.category === this.currentCategory;
					return matchesSearch && matchesCategory;
				});
			}
		},
		methods: {
			selectCategory(categoryId) {
				this.currentCategory = categoryId;
			},
			handleSearch() {
				// 处理搜索逻辑
			}
		}
	}
</script>

<style lang="scss" scoped>
.container {
	padding: 30rpx;
	background: linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%);
	min-height: 100vh;
}

.header {
	text-align: center;
	margin-bottom: 40rpx;
	padding: 40rpx 30rpx;
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
	
	.title {
		font-size: 56rpx;
		font-weight: bold;
		background: linear-gradient(45deg, #2980b9, #3498db);
		-webkit-background-clip: text;
		color: transparent;
		margin-bottom: 10rpx;
	}
	
	.subtitle {
		font-size: 28rpx;
		color: #94a3b8;
		margin-bottom: 30rpx;
	}
	
	.overall-progress {
		.progress-text {
			font-size: 30rpx;
			color: #475569;
			font-weight: 500;
			margin-bottom: 15rpx;
		}
		
		.overall-progress-bar {
			height: 12rpx;
			background: #e2e8f0;
			border-radius: 6rpx;
			overflow: hidden;
			
			.overall-progress-fill {
				height: 100%;
				background: linear-gradient(90deg, #3498db, #2ecc71);
				border-radius: 6rpx;
				transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
			}
		}
	}
}

.filter-section {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10rpx);
	border-radius: 16rpx;
	padding: 25rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	
	.categories {
		margin-bottom: 25rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
		
		.category-tag {
			padding: 12rpx 24rpx;
			background: #f1f5f9;
			border-radius: 30rpx;
			font-size: 26rpx;
			color: #64748b;
			transition: all 0.3s ease;
			
			&.active {
				background: #3498db;
				color: #fff;
				box-shadow: 0 4rpx 12rpx rgba(52, 152, 219, 0.3);
				transform: translateY(-2rpx);
			}
			
			&:active {
				transform: scale(0.95);
			}
		}
	}
	
	.search-box {
		input {
			width: calc(100% - 70rpx);
			height: 80rpx;
			border-radius: 40rpx;
			background: #f8fafc;
			padding: 0 35rpx;
			font-size: 28rpx;
			border: 2rpx solid #e2e8f0;
			transition: all 0.3s ease;
			box-sizing: border-box;
			
			&:focus {
				border-color: #3498db;
				box-shadow: 0 0 0 4rpx rgba(52, 152, 219, 0.1);
			}
		}
	}
}

.recent-achievements {
	margin: 30rpx 0;
	
	.section-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #334155;
		margin-bottom: 20rpx;
		padding: 0 10rpx;
	}
	
	.recent-scroll {
		padding: 10rpx 5rpx;
		
		.recent-achievement-item {
			display: inline-block;
			padding: 25rpx;
			background: #ffffff;
			border-radius: 16rpx;
			margin-right: 20rpx;
			min-width: 240rpx;
			box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
			transition: transform 0.3s ease;
			
			&:hover {
				transform: translateY(-4rpx);
			}
			
			.recent-title {
				font-size: 28rpx;
				color: #3498db;
				font-weight: 500;
			}
			
			.unlock-time {
				font-size: 24rpx;
				color: #94a3b8;
				margin-top: 8rpx;
			}
		}
	}
}

.achievement-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300rpx, 1fr));
	gap: 20rpx;
	padding: 10rpx;
}

.achievement-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
	
	&:hover {
		transform: translateY(-4rpx);
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
	}
	
	.achievement-content {
		.achievement-title {
			font-size: 30rpx;
			color: #334155;
			font-weight: 600;
			margin-bottom: 8rpx;
		}
		
		.achievement-description {
			font-size: 26rpx;
			color: #64748b;
			margin-bottom: 20rpx;
			line-height: 1.5;
		}
		
		.progress-bar {
			height: 8rpx;
			background: #f1f5f9;
			border-radius: 4rpx;
			overflow: hidden;
			
			.progress-fill {
				height: 100%;
				background: linear-gradient(90deg, #3498db, #2ecc71);
				border-radius: 4rpx;
				transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
			}
		}
	}
	
	.achievement-info {
		margin-top: 15rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.achievement-progress {
			font-size: 26rpx;
			color: #64748b;
			font-weight: 500;
		}
		
		.achievement-status {
			font-size: 24rpx;
			padding: 6rpx 16rpx;
			border-radius: 20rpx;
			background: #f1f5f9;
			color: #64748b;
		}
	}
	
	&.achievement-unlocked {
		background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
		border: 2rpx solid #2ecc71;
		
		.achievement-title {
			color: #2ecc71;
		}
		
		.achievement-status {
			background: #2ecc71;
			color: #ffffff;
		}
	}
}
</style> 