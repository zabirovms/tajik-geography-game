<template>
  <view class="privacy-page">
    <view class="content">
      <view class="section">
        <view class="title">隐私政策</view>
        <view class="date">更新日期：2024年3月15日</view>
        
        <view class="paragraph">
          欢迎使用趣味地理挑战小程序。我们非常重视您的个人隐私和数据安全，并致力于维护您对我们的信任。
        </view>

        <view class="section-item">
          <view class="subtitle">1. 信息收集</view>
          <view class="text">我们可能收集以下信息：</view>
          <view class="list">
            <view class="list-item">• 基本用户信息：微信头像、昵称（仅在您授权后）</view>
            <view class="list-item">• 游戏数据：答题记录、得分统计</view>
            <view class="list-item">• 使用数据：登录时间、使用时长等</view>
          </view>
        </view>

        <view class="section-item">
          <view class="subtitle">2. 信息使用</view>
          <view class="text">我们使用收集的信息：</view>
          <view class="list">
            <view class="list-item">• 提供地理知识问答服务</view>
            <view class="list-item">• 记录和统计答题成绩</view>
            <view class="list-item">• 优化游戏体验和内容</view>
            <view class="list-item">• 提供排行榜等社交功能</view>
          </view>
        </view>

        <view class="section-item">
          <view class="subtitle">3. 信息保护</view>
          <view class="text">
            我们采取适当的技术和组织措施来保护您的个人信息，防止未经授权的访问、使用或泄露。
          </view>
        </view>

        <view class="section-item">
          <view class="subtitle">4. 信息共享</view>
          <view class="text">
            除非获得您的明确同意或法律要求，我们不会与第三方分享您的个人信息。
          </view>
        </view>

        <view class="section-item">
          <view class="subtitle">5. 儿童隐私</view>
          <view class="text">
            我们的服务面向所有年龄段用户，对于未满14周岁的用户，请在监护人指导下使用本小程序。
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Privacy'
}
</script>

<style lang="scss" scoped>
.privacy-page {
  padding: 30rpx;
  background: #fff;
}

.content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.date {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.section-item {
  margin-bottom: 40rpx;
}

.subtitle {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
  margin-top: 30rpx;
}

.paragraph {
  margin-bottom: 30rpx;
}

.list {
  padding-left: 20rpx;
}

.list-item {
  margin-bottom: 10rpx;
  color: #666;
}
</style> 