//index.js

//获取LeanCloud对象
const AV = require('../../libs/av-weapp.js');

//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //打开地图
  openMapTap: function () {
    wx.navigateTo({
      url: '../map/map'
    })
  },
  //打开地图(旧)
  openMap2Tap: function () {
    wx.navigateTo({
      url: '../map2/map2'
    })
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  }
})
