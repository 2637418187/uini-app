<template>
    <!-- 轮播图区域 -->
    <swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true">
      <!-- 循环渲染轮播图的 item 项 -->
      <swiper-item v-for="(item, i) in swiperList" :key="i">
        <navigator class="swiper-item" :url="'/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id">
          <!-- 动态绑定图片的 src 属性 -->
          <image :src="item.image_src"></image>
        </navigator>
      </swiper-item>
    </swiper>
    <!-- 分类导航区域 -->
    <view class="nav-list">
      <view class="nav-item" v-for="(item, i) in navList" :key="i" @click="navClickHandler(item)">
        <image :src="item.image_src" class="nav-img"></image>
      </view>
    </view>
    <!-- 楼层区域 -->
    <view class="floor-list">
      <!-- 楼层 item 项 -->
      <view class="floor-item" v-for="(item, i) in floorList" :key="i">
        <!-- 楼层标题 -->
        <image :src="item.floor_title.image_src" class="floor-title"></image>
        <!-- 楼层图片区域 -->
        <view class="floor-img-box">
          <!-- 左侧大图片的盒子 -->
          <navigator  class="left-img-box" :url="item.product_list[0].url">
            <image :src="item.product_list[0].image_src" :style="{width: item.product_list[0].image_width + 'rpx'}" mode="widthFix"></image>
          </navigator>
          <!-- 右侧 4 个小图片的盒子 -->
          <view class="right-img-box">  
            <navigator class="right-img-item" v-for="(item2, i2) in item.product_list" :key="i2" :url="item2.url">
              <image :src="item2.image_src" mode="widthFix" :style="{width: item2.image_width + 'rpx'}" v-if="i2 !== 0"></image>
            </navigator>
          </view>
        </view>
      </view>
    </view>
</template>

<script>
  import {
    $http
  } from '@escook/request-miniprogram'
  import {
    onMounted,
    reactive,
    ref,
    toRefs
  } from 'vue'
  export default {
    setup() {
      const data = reactive({
        swiperList: [],
        navList: [],
        floorList: [],
      })
      onMounted(() => {
        getSwiperList()
        getNavList()
        getFloorList()
      })
      // 发起网络请求，获取轮播图片
      const getSwiperList = async () => {
        console.log("哈哈哈哈哈");
        const {
          data: res
        } = await $http.get('https://api-hmugo-web.itheima.net/api/public/v1/home/swiperdata')
        // 3.2 请求失败
        if (res.meta.status !== 200) {
          return Toast("数据请求失败！")
        }
        // 3.3 请求成功，为 data 中的数据赋值
        data.swiperList = res.message
        Toast("数据请求成功！")
      }
      // 分类导航区域
      const getNavList = async () => {
          const {
            data: res
          } = await $http.get('https://api-hmugo-web.itheima.net/api/public/v1/home/catitems')
          if (res.meta.status !== 200) return Toast("数据请求失败！")
          data.navList = res.message
          Toast("数据请求成功！")
        }
        // 网络请求状态
       const Toast = (title) => {
          return uni.showToast({
            title,
            duration: 1500,
            icon: 'none',
          })
        }
        //判断是否为分类
        const navClickHandler = (item) => {
          // 判断点击的是哪个 nav
            if (item.name === '分类') {
              uni.switchTab({
                url: '/pages/cate/cate'
              })
            }
        }
        //定义获取楼层列表的方法
        const getFloorList = async () => {
          const { data: res } = await $http.get('https://api-hmugo-web.itheima.net/api/public/v1/home/floordata')
                if (res.meta.status !== 200) return Toast("数据加载失败！！")
                // 通过双层 forEach 循环，处理 URL 地址
                  res.message.forEach(floor => {
                    floor.product_list.forEach(prod => {
                      prod.url = '/subpkg/goods_list/goods_list?' + prod.navigator_url.split('?')[1]
                    })
                  })
                data.floorList = res.message
        }
      return {
        ...toRefs(data),
        Toast,
        getSwiperList,
        getNavList,
        navClickHandler,
        getFloorList
      }
    }
  }
</script>

<style lang="scss">
  swiper {
    height: 330rpx;

    .swiper-item,
    image {
      width: 100%;
      height: 100%;
    }
  }

  .nav-list {
    display: flex;
    justify-content: space-around;
    margin: 15px 0;
  }
  .nav-img {
    width: 128rpx;
    height: 140rpx;
  }
  
  .floor-title {
    height: 60rpx;
    width: 100%;
    display: flex;
  }
  
  .right-img-box {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  
  .floor-img-box {
    display: flex;
    padding-left: 10rpx;
  }
</style>
