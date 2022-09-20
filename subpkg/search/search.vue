<template>
  <view>
    <view class="search-box">
      <!-- 使用 uni-ui 提供的搜索组件 -->
      <uni-search-bar @input="input" :radius="100" cancelButton="none"></uni-search-bar>
    </view>
    
    <!-- 搜索建议列表 -->
    <view class="sugg-list">
      <view class="sugg-item" v-for="(item, i) in searchResults" :key="i" @click="gotoDetail(item.goods_id)">
        <view class="goods-name" v-html="item.goods_name"></view>
        <uni-icons type="arrowright" size="16"></uni-icons>
      </view>
      <!-- 搜索为空时显示 -->
      <view v-show="nullSearchFlag" class="nosearch-box" :style="{height: wh+'px'}">
          <image src="../../static/nosearch/nulls.png" mode="heightFix"></image>
          空空如也~
      </view>
      <!-- 搜索历史 -->
      <view class="history-box" v-show="historyRecordFlag">
        <view class="history-title">
          <text style="font-weight: bold;">搜索历史</text>
          <uni-icons type="trash" size="20" @click="cleanHistory"></uni-icons>
        </view>
        <view class="history-list">
          <view class="unitag-box" v-for="(item, i) in historyList" :key="i" @click="gotoGoodsList(item)">
            <uni-tag :text="item"></uni-tag>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import {reactive,toRefs,onMounted} from 'vue'
  import {$http} from '@escook/request-miniprogram'
  export default {
    setup() {
      const data = reactive({
        // 延时器的 timerId
        timer: null,
        wh: 0,
        // 搜索信息为空
        nullSearchFlag: false,
        historyRecordFlag: true,
        // 搜索关键词
        kw: '',
        // 搜索结果列表
        searchResults: [],
        // 搜索关键词的历史记录
        historyList: ['秋季新款','夏季新款','冬季新款'],
        ancss: 'history-box',
      })
      onMounted(()=>{
        getWindowHeight()
        data.historyList = JSON.parse(uni.getStorageSync('kw') || '[]')
      })
      // 输入触发
      const input = (e) => {
        // 清除 timer 对应的延时器
          clearTimeout(data.timer)
          // 重新启动一个延时器，并把 timerId 赋值给 data.timer
          data.timer = setTimeout(() => {
            // 如果 500 毫秒内，没有触发新的输入事件，则为搜索关键词赋值
            data.kw = e
            // 根据关键词，查询搜索建议列表
            getSearchList()
            console.log(data.kw)
          }, 500)
      }
      
      // 根据搜索关键词，搜索商品建议列表
       const getSearchList = async () => {
        // 判断关键词是否为空
        if (data.kw === '') {
          data.searchResults = []
          data.nullSearchFlag = false
          data.historyRecordFlag = true
          return
        }
        // 发起请求，获取搜索建议列表
        const { data: res } = await $http.get('https://api-hmugo-web.itheima.net/api/public/v1/goods/qsearch', { query: data.kw })
        if (res.meta.status !== 200) return Toast("数据加载失败！！")
        data.searchResults = res.message
        saveSearchHistory()
        data.kw.split('').forEach(ta => {
          data.searchResults.forEach(its => {
            console.log(its);
            if(its.goods_name.indexOf(ta) == -1) return;
            let hightStr = `<span style="color:red;">${ta}</span>`
            let str = new RegExp(ta,'gi')
            its.goods_name = its.goods_name.replace(str,hightStr)
          })
        })
        data.nullSearchFlag = data.searchResults.length ? false : true
        data.historyRecordFlag = data.searchResults.length ? true : false
      }
      // 清空历史记录
      const cleanHistory = () => {
        // 清空 data 中保存的搜索历史
          data.historyList = []
          // 清空本地存储中记录的搜索历史
          uni.setStorageSync('kw', '[]')
      }
      //保存关键字
      const saveSearchHistory = () => {
        if(data.kw.length>20){
          let s = data.kw.slice(0,20)+'…'
          data.historyList.unshift(s)
        }else{
          data.historyList.unshift(data.kw)
        }  
        data.historyList = [...new Set(data.historyList)]
        // 调用 uni.setStorageSync(key, value) 将搜索历史记录持久化存储到本地
        uni.setStorageSync('kw', JSON.stringify(data.historyList))
      }
      // 搜索链接跳转
      const gotoDetail = (goods_id) => {
        uni.navigateTo({
          // 指定详情页面的 URL 地址，并传递 goods_id 参数
          url: '/subpkg/goods_detail/goods_detail?goods_id=' + goods_id
        })
      }
      // 点击搜索历史跳转
      const gotoGoodsList = (kw) => {
        uni.navigateTo({
            url: '/subpkg/goods_list/goods_list?query=' + kw
          })
      }
      // 获取当前可用窗口的高度
      const getWindowHeight = () => {
       let sysInfo = uni.getSystemInfoSync()
         // 可用高度 = 屏幕高度 - navigationBar高度 - tabBar高度 - 自定义的search组件高度
        data.wh = sysInfo.windowHeight - 80
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
        getSearchList,
        input,
        Toast,
        gotoDetail,
        getWindowHeight,
        saveSearchHistory,
        cleanHistory,
        gotoGoodsList
      }
    }
  }
</script>

<style lang="scss">
  page{
    background-color: #ffffff;
  }
  .nosearch-box {
    width: 100%;
    // border: 1px solid red;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
.uni-searchbar {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  position: relative;
  padding: 16rpx;
  /* 将默认的 #FFFFFF 改为 #C00000 */
  background-color: #c00000;
}
.search-box {
  position: sticky;
  top: 0;
  z-index: 999;
}
   
.sugg-list {
  padding: 0 5px;

  .sugg-item {
    font-size: 12px;
    padding: 13px 0;
    border-bottom: 1px solid #efefef;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .goods-name {
      // 文字不允许换行（单行文本）
      white-space: nowrap;
      // 溢出部分隐藏
      overflow: hidden;
      // 文本溢出后，使用 ... 代替
      text-overflow: ellipsis;
      margin-right: 3px;
    }
  }
}

.history-box {
  padding: 0 5px;
  width: 100%;
  // border: 1px solid red;
  // height: 400rpx;
  box-sizing: border-box;

  .history-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    font-size: 13px;
    border-bottom: 2px solid #efefef;
    margin-bottom: 5px;
  }

  .history-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    // height: 60%;
    box-sizing: border-box;
    // border: 1px solid orange;
    
    .unitag-box {
      height: 21px;
      // border: 1px solid #000000;
      margin-bottom: 10px;
    }
    .uni-tag {
      margin-top: 5px;
      margin-right: 5px;
    }
  }
}
</style>
