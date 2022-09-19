<template>
  <view>
    <view class="scroll-view-container">
          <!-- 左侧的滚动视图区域 -->
          <scroll-view class="left-scroll-view" scroll-y :style="{height: wh + 'px'}">
            <block v-for="(item, i) in cateList" :key="i">
                <view :class="['left-scroll-view-item', i === active ? 'active' : '']" @click="activeChanged(i)">{{item.cat_name}}</view>
              </block>
          </scroll-view>
          <!-- 右侧的滚动视图区域 -->
          <scroll-view class="right-scroll-view" scroll-y :style="{height: wh + 'px'}" :scroll-top="scrollTop">
            <view class="cate-lv2" v-for="(item2, i2) in cateLevel2" :key="i2">
                <view class="cate-lv2-title">/ {{item2.cat_name}} /</view>
                <!-- 动态渲染三级分类的列表数据 -->
                    <view class="cate-lv3-list">
                      <view class="cate-lv3-item" v-for="(item3, i3) in item2.children" :key="i3" @click="gotoGoodsList(item3)">
                        <!-- 图片 -->
                        <image :src="item3.cat_icon"></image>
                        <text>{{item3.cat_name}}</text>
                      </view>
                    </view>
            </view>
          </scroll-view>
        </view>
  </view>
</template>

<script>
  import {$http} from '@escook/request-miniprogram'
  import {onMounted,reactive,ref,toRefs} from 'vue'
  export default {
    setup() {
      const data = reactive({
         // 窗口的可用高度 = 屏幕高度 - navigationBar高度 - tabBar 高度
        wh: 0,
        // 分类数据列表
        cateList: [],
        // 二级分类列表
        cateLevel2: [],
        active: 0,
        // 滚动条距离顶部的距离
        scrollTop: 0
      })
      
      onMounted(() => {
        getWindowHeight()
        getCateList()
      })
      // 获取当前可用窗口的高度
      const getWindowHeight = () => {
        let sysInfo = uni.getSystemInfoSync()
        // 为 wh 窗口可用高度动态赋值
        data.wh = sysInfo.windowHeight
      }
       const getCateList = async () => {
          // 发起请求
          const { data: res } = await $http.get('https://api-hmugo-web.itheima.net/api/public/v1/categories')
          // 判断是否获取失败
          if (res.meta.status !== 200) return Toast("数据请求失败！！！")
          // 转存数据
          data.cateList = res.message
          // 为二级分类赋值
          data.cateLevel2 = res.message[0].children
        }
        // 激活状态
        const activeChanged = (i) => {
          data.active = i
          data.cateLevel2 = data.cateList[i].children
          // 让 scrollTop 的值在 0 与 1 之间切换
            data.scrollTop = data.scrollTop === 0 ? 1 : 0
          
            // 可以简化为如下的代码：
            // this.scrollTop = this.scrollTop ? 0 : 1
        }
        
        // 跳转三级列表
        const gotoGoodsList = (item3) => {
          uni.navigateTo({
              url: '/subpkg/goods_list/goods_list?cid=' + item3.cat_id
            })
        }
        // 网络请求状态
        const Toast = (title) => {
           return uni.showToast({
             title,
             duration: 1500,
             icon: 'none',
           })
         }
      return {
        ...toRefs(data),
        getWindowHeight,
        Toast,
        getCateList,
        activeChanged,
        gotoGoodsList
      }
    }
  }
</script>

<style lang="scss">
.scroll-view-container {
  display: flex;

  .left-scroll-view {
    width: 120px;

    .left-scroll-view-item {
      line-height: 60px;
      background-color: #f7f7f7;
      text-align: center;
      font-size: 12px;

      // 激活项的样式
      &.active {
        background-color: #ffffff;
        position: relative;

        // 渲染激活项左侧的红色指示边线
        &::before {
          content: ' ';
          display: block;
          width: 3px;
          height: 30px;
          background-color: #c00000;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
  }
}

.cate-lv2-title {
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  padding: 15px 0;
}

.cate-lv3-list {
  display: flex;
  flex-wrap: wrap;

  .cate-lv3-item {
    width: 33.33%;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;

    image {
      width: 60px;
      height: 60px;
    }

    text {
      font-size: 12px;
    }
  }
}
</style>
