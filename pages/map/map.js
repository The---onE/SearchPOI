// pages/map/map.js

var LOCATION_TYPE = 'gcj02';
var DEFAULT_SCALA = 16;

var location = {}; // 定位坐标
var LOCATION_MARKER_ID = 0; //定位点ID

var selected; // 选取坐标
var SELECTED_MARKER_ID = 1; //选取点ID

var markers = [
  //定位标记
  {
    id: LOCATION_MARKER_ID,
  },
  //选取点ID
  {
    id: SELECTED_MARKER_ID,
  }
]; // 地图标记

Page({
  data: {},

  //定位
  getLocation: function () {
    var that = this;
    // 开始定位
    wx.getLocation({
      type: LOCATION_TYPE, // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        // 定位成功
        console.info(res);
        // 定位坐标
        location = {
          latitude: res.latitude,
          longitude: res.longitude,
        }
        // 更新定位标记
        markers[LOCATION_MARKER_ID] = {
          id: LOCATION_MARKER_ID,
          title: 'location',
          iconPath: "/res/gps_point.png",
          latitude: res.latitude,
          longitude: res.longitude,
          width: 100,
          height: 100
        };
        // 更新数据
        that.setData({
          position: location, // 定位坐标
          scala: DEFAULT_SCALA, // 缩放比例[5-18]
          markers: markers, // 标记点
        });
      },
      fail: function () {
        // 定位失败
        wx.showModal({
          title: '提示',
          content: '定位失败',
        })
      },
      complete: function () {
        // 定位完成
      }
    })
  },

  // 标记点点击事件
  onMarkerTap: function (e) {
    if (e.markerId == LOCATION_MARKER_ID) {
      wx.showToast({
        title: '当前定位',
        icon: 'success',
      })
    }
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
    var that = this;
    that.getLocation(); // 定位
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})