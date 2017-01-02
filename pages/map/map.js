// pages/map/map.js
// 获取应用实例
var app = getApp();

// 获取LeanCloud对象
const AV = require('../../libs/av-weapp.js');

var LOCATION_TYPE = 'gcj02';
var DEFAULT_SCALA = 16;

var location = {}; // 定位坐标
var LOCATION_MARKER_ID = 0; // 定位点ID
var locationMarker = { id: LOCATION_MARKER_ID }; //定位标记
var LOCATION_MARKER_RES = '/res/location.png'; // 定位标记图标

var selected; // 选取坐标
var SELECTED_MARKER_ID = 1; // 选取点ID
var selectedMarker = { id: SELECTED_MARKER_ID, }; //选取标记
var SELECTED_MARKER_RES = '/res/selected.png'; // 选取标记图标

// 添加收藏对话框
var collectTitle; // 标题
var collectType; // 类型
var collectContent; // 内容

var COLLECTION_MARKER_RES = '/res/collection.png'; // 收藏标记图标

var search; //搜索框文本

var markers = [
  // 定位标记
  locationMarker,
  // 选取点ID
  selectedMarker,
]; // 地图标记

Page({
  data: {
    collectModalHidden: true, // 添加收藏对话框隐藏
    collectionModalHidden: true, // 收藏信息对话框隐藏
    value: '' // 输入框清空
  },

  // 显示对话框
  showPrompt: function (content) {
    wx.showModal({
      title: '提示',
      content: content,
    });
  },

  // 定位
  getLocation: function () {
    var that = this;
    // 开始定位
    wx.getLocation({
      type: LOCATION_TYPE, // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        // 定位成功
        // 定位坐标
        location = {
          latitude: res.latitude,
          longitude: res.longitude,
        }
        // 更新定位标记
        locationMarker = {
          id: LOCATION_MARKER_ID,
          title: 'location',
          iconPath: LOCATION_MARKER_RES,
          latitude: res.latitude,
          longitude: res.longitude,
          width: 100,
          height: 100,
        };
        markers[LOCATION_MARKER_ID] = locationMarker;
        // 更新数据
        that.setData({
          position: location, // 定位坐标
          scala: DEFAULT_SCALA, // 缩放比例[5-18]
          markers: markers, // 标记点
        });
      },
      fail: function () {
        // 定位失败
        that.showPrompt('定位失败');
      },
      complete: function () {
        // 定位完成
      }
    })
  },

  // 加载收藏标记
  showCollection: function () {
    var that = this;
    var query = new AV.Query('Collection');
    // 添加条件后，开始查询
    query.find()
      .then(function (data) {
        // 查询成功
        for (var i = 0; i < data.length; ++i) {
          // 添加标记
          markers.push({
            id: markers.length,
            title: data[i].get('title'),
            iconPath: COLLECTION_MARKER_RES,
            latitude: data[i].get('latitude'),
            longitude: data[i].get('longitude'),
            width: 40,
            height: 40,
            type: data[i].get('type'),
            content: data[i].get('content'),
          });
        }
        that.setData({
          markers: markers,
        });
      }, function (error) {
        // 查询失败
        console.error('Failed to save in LeanCloud:' + error.message);
        that.showPrompt('加载收藏失败');
      });
  },
  // 搜索框输入事件
  onSearchInput: function (e) {
    search = e.detail.value;
  },
  // 搜索按钮点击事件
  onSearchTap: function (e) {
    if (!search || search.length == 0) {
      this.showPrompt('搜索值不能为空');
    }
    var that = this;
    // 新建查询
    var query = new AV.Query('Collection');
    query.contains('type', search);
    query.find()
      .then(function (data) {
        // 查询成功
        // 清空收藏标记
        markers = [
          locationMarker,
          selectedMarker,
        ];
        for (var i = 0; i < data.length; ++i) {
          // 添加标记
          markers.push({
            id: markers.length,
            title: data[i].get('title'),
            iconPath: COLLECTION_MARKER_RES,
            latitude: data[i].get('latitude'),
            longitude: data[i].get('longitude'),
            width: 40,
            height: 40,
            type: data[i].get('type'),
            content: data[i].get('content'),
          });
        }
        that.setData({
          markers: markers,
        });
      }, function (error) {
        // 查询失败
        console.error('Failed to save in LeanCloud:' + error.message);
        that.showPrompt('加载收藏失败');
      });
  },
  // 取消搜索按钮点击事件
  onCancelSearchTap: function (e) {
    var that = this;
    // 清空收藏标记
    markers = [
      locationMarker,
      selectedMarker,
    ];
    // 清空搜索框
    this.setData({
      searchValue: '',
      markers: markers,
    });
    var query = new AV.Query('Collection');
    query.find()
      .then(function (data) {
        // 查询成功
        for (var i = 0; i < data.length; ++i) {
          // 添加标记
          markers.push({
            id: markers.length,
            title: data[i].get('title'),
            iconPath: COLLECTION_MARKER_RES,
            latitude: data[i].get('latitude'),
            longitude: data[i].get('longitude'),
            width: 40,
            height: 40,
            type: data[i].get('type'),
            content: data[i].get('content'),
          });
        }
        that.setData({
          markers: markers,
        });
      }, function (error) {
        // 查询失败
        console.error('Failed to save in LeanCloud:' + error.message);
        that.showPrompt('加载收藏失败');
      });
  },

  // 地图非标记点点击事件
  onMapTap: function (e) {
    var that = this;
    // 显示加载中
    wx.showToast({
      title: '加载选取工具',
      icon: 'loading',
      duration: 2000
    });
    // 跳转选取位置
    wx.chooseLocation({
      success: function (res) {
        // 选取成功
        // 更新选取点
        selected = {
          latitude: res.latitude,
          longitude: res.longitude,
        };
        // 更新选取点标记
        selectedMarker = {
          id: SELECTED_MARKER_ID,
          title: 'selected',
          iconPath: SELECTED_MARKER_RES,
          latitude: res.latitude,
          longitude: res.longitude,
          width: 30,
          height: 30
        };
        markers[SELECTED_MARKER_ID] = selectedMarker;
        that.setData({
          markers: markers,
        });
      },
      cancel: function () {
        // 选取取消
      },
      fail: function () {
        // 选取失败
        this.showPrompt('选取失败');
      },
      complete: function () {
        // 选取完成
      }
    })
  },

  // 标记点点击事件
  onMarkerTap: function (e) {
    // 定位标记
    if (e.markerId == LOCATION_MARKER_ID) {
      wx.showToast({
        title: '当前定位',
        icon: 'success',
      });
    } else if (e.markerId == SELECTED_MARKER_ID) {
      // 选取标记
      wx.showToast({
        title: '选取位置',
        icon: 'success',
      });
    } else {
      // 收藏标记
      var marker = markers[e.markerId];
      var collection = {
        title: marker.title,
        type: marker.type,
        content: marker.content,
      };
      // 弹出添加收藏对话框
      this.setData({
        collectionModalHidden: false,
        collection: collection
      });
    }
  },
  // 点击收藏信息对话框确认按钮
  onCollectionTap: function () {
    this.setData({
      collectionModalHidden: true,
    });
  },

  // 点击添加收藏按钮事件
  onCollectTap: function () {
    if (!selected) {
      this.showPrompt('还未选取点')
      return;
    }
    // 弹出添加收藏对话框
    this.setData({
      collectModalHidden: false
    });
  },
  // 点击确认添加收藏事件
  onConfirmCollectTap: function () {
    var that = this;
    if (!selected) {
      that.showPrompt('还未选取点');
      return;
    }
    // 输入校验
    if (!collectTitle || collectTitle.length == 0) {
      that.showPrompt('标题不能为空');
      return;
    }
    if (!collectType || collectType.length == 0) {
      that.showPrompt('类型不能为空');
      return;
    }
    if (!collectContent) {
      collectContent = '';
    }

    var collection = AV.Object.extend('Collection');
    var col = new collection();
    col.set('title', collectTitle);
    col.set('type', collectType);
    col.set('content', collectContent);
    col.set('latitude', selected.latitude);
    col.set('longitude', selected.longitude);
    col.save().then(function (success) {
      // 添加成功
      that.showPrompt('添加成功');
      markers.push({
        id: markers.length,
        title: collectTitle,
        iconPath: COLLECTION_MARKER_RES,
        latitude: selected.latitude,
        longitude: selected.longitude,
        width: 40,
        height: 40
      });
      that.setData({
        markers: markers,
      });
      // 隐藏添加收藏对话框
      that.setData({
        collectModalHidden: true,
        value: '', // 清空输入框内容
      });
    }, function (error) {
      // 添加失败
      console.error('Failed to save in LeanCloud:' + error.message);
      that.showPrompt('添加失败');
    });
  },
  // 点击取消添加收藏事件
  onCancelCollectTap: function () {
    //隐藏添加收藏对话框
    this.setData({
      collectModalHidden: true,
      value: '', // 清空输入框内容
    });
  },
  // 标题输入事件
  onCollectTitleInput: function (e) {
    collectTitle = e.detail.value;
  },
  // 类型输入事件
  onCollectTypeInput: function (e) {
    collectType = e.detail.value;
  },
  // 内容输入事件
  onCollectContentInput: function (e) {
    collectContent = e.detail.value;
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
    this.getLocation(); // 定位
    this.showCollection(); // 显示收藏点
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