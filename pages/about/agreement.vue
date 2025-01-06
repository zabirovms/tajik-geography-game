<template>
  <view class="agreement-page">
    <view class="content">
      <view class="section">
        <view class="title">用户协议</view>
        <view class="date">更新日期：2024年3月15日</view>

        <view class="paragraph">
          欢迎使用趣味地理挑战小程序。请您仔细阅读以下条款，使用本小程序即表示您同意接受本协议。
        </view>

        <view class="section-item">
          <view class="subtitle">1. 服务内容</view>
          <view class="text">
            趣味地理挑战小程序是一款提供地理知识问答的教育类小程序，为用户提供：
          </view>
          <view class="list">
            <view class="list-item">• 地理知识问答游戏</view>
            <view class="list-item">• 学习进度追踪</view>
            <view class="list-item">• 排行榜</view>
            <view class="list-item">• 相关教育内容</view>
          </view>
        </view>

        <view class="section-item">
          <view class="subtitle">2. 用户行为规范</view>
          <view class="text">用户在使用过程中应：</view>
          <view class="list">
            <view class="list-item">• 遵守相关法律法规</view>
            <view class="list-item">• 保护账号安全</view>
            <view class="list-item">• 不得作弊或使用外挂</view>
            <view class="list-item">• 尊重知识产权</view>
          </view>
        </view>

        <view class="section-item">
          <view class="subtitle">3. 知识产权</view>
          <view class="text">
            本小程序的所有内容，包括但不限于文字、图片、音频、题库等均受著作权法保护，未经许可不得用于商业用途。
          </view>
        </view>

        <view class="section-item">
          <view class="subtitle">4. 免责声明</view>
          <view class="text">
            我们会尽力确保题库内容的准确性，但不对因内容偶然错误导致的损失承担责任。我们保留更新和修改题目内容的权利。
          </view>
        </view>

        <view class="section-item">
          <view class="subtitle">5. 协议修改</view>
          <view class="text">
            我们保留在必要时修改本协议的权利，修改后的协议将在小程序内公布。
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Agreement'
}
</script>

<style lang="scss" scoped>
.agreement-page {
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