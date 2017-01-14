// pages/map/map.js
// 获取应用实例
var app = getApp();

// 获取LeanCloud对象
const AV = require('../../libs/av-weapp.js');

var height; // 屏幕高度，在onLoad中获取
var width; // 屏幕宽度，在onLoad中获取

var mapCtx; // 地图上下文，用于获取或设置中心坐标，在定位成功后初始化

var mapHeight; // 地图控件高度，在onLoad获取页面高度后计算
var mapWidth; // 地图控件宽度，在onLoad获取页面宽度后计算
var MAP_HEIGHT_SCALA = 0.87; // 高度占总高度比例
var MAP_WIDTH_SCALA = 1; // 宽度占总宽度比例

var CENTER_CONTROL_ID = 0; // 中心控件ID
var centerControl = { id: CENTER_CONTROL_ID, }; // 中心控件
var CENTER_CONTROL_RES = '/res/selected.png'; // 中心控件图标

var LOCATION_TYPE = 'gcj02'; // 定位类型，gcj02 返回可用于地图的坐标，wgs84 返回 gps 坐标
var DEFAULT_SCALA = 16; // 默认缩放，范围5-18

var location = {}; // 定位坐标
var LOCATION_MARKER_ID = 0; // 定位点ID
var locationMarker = { id: LOCATION_MARKER_ID }; // 定位标记
var LOCATION_MARKER_RES = '/res/location.png'; // 定位标记图标

var SELECTED_MARKER_ID = 1; // 选取点ID
var selectedMarker = { id: SELECTED_MARKER_ID, }; // 选取标记

// 添加收藏对话框
var collectTitle; // 标题
var collectType; // 类型
var collectContent; // 内容
var PRIVACY_PRIVATE = 1; // 私密
var PRIVACY_PUBLIC = 0; // 公开
var privacy = PRIVACY_PRIVATE; // 私密性

var COLLECTION_MARKER_RES = '/res/collection.png'; // 收藏标记图标

var search; // 搜索框文本

var markers = [
  // 定位标记
  locationMarker,
  // 选取点ID
  selectedMarker,
]; // 地图标记

var controls = [
  // 中心控件
  centerControl,
]; // 地图控件

Page({
  data: {
    collectModalHidden: true, // 添加收藏对话框隐藏
    collectionModalHidden: true, // 收藏信息对话框隐藏
    value: '', // 输入框清空
    privacy: [
      { name: '私密', value: PRIVACY_PRIVATE, checked: 'true' },
      { name: '公开', value: PRIVACY_PUBLIC },
    ] // 私密性单选框选项
  },

  // 显示对话框
  showPrompt: function (content) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
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
        // // 更新定位标记
        // locationMarker = {
        //   id: LOCATION_MARKER_ID,
        //   title: 'location',
        //   iconPath: LOCATION_MARKER_RES,
        //   latitude: res.latitude,
        //   longitude: res.longitude,
        //   width: 100,
        //   height: 100,
        // };
        // markers[LOCATION_MARKER_ID] = locationMarker;
        that.addCenterControl(); // 添加中心控件
        // 更新数据
        that.setData({
          position: location, // 定位坐标
          scala: DEFAULT_SCALA, // 缩放比例[5-18]
          markers: markers, // 标记点
        });
        mapCtx = wx.createMapContext('map');
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

  // 添加地图中心控件
  addCenterControl: function () {
    centerControl = {
      id: CENTER_CONTROL_ID,
      iconPath: CENTER_CONTROL_RES,
      position: {
        left: mapWidth / 2 - 40 / 2,
        top: mapHeight / 2 - 40,
        width: mapWidth * 0.1,
        height: mapWidth * 0.1
      }, // 根据地图宽高和图片尺寸计算位置
      clickable: true
    }
    controls[CENTER_CONTROL_ID] = centerControl;
    this.setData({
      controls: controls,
    })
  },

  // 加载收藏标记
  showCollection: function () {
    var that = this;
    var query = new AV.Query('Collection');
    // 添加条件后，开始查询
    query.equalTo('privacy', PRIVACY_PUBLIC); // 只显示公开的收藏
    query.find()
      .then(function (data) {
        // 查询成功
        that.addCollectionMarker(data);
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
      return;
    }
    var that = this;
    // 新建查询
    // 标题中包含搜索值
    var titleLike = new AV.Query('Collection');
    titleLike.contains('title', search);
    // 类型中包含搜索值
    var typeLike = new AV.Query('Collection');
    typeLike.contains('type', search);
    // 公开类型
    var publicType = new AV.Query('Collection');
    publicType.equalTo('privacy', PRIVACY_PUBLIC);
    // 公开条件
    var publicCondition = AV.Query.or(titleLike, typeLike);
    // 公开搜索
    var publicQuery = AV.Query.and(publicType, publicCondition);

    // 标题等于搜索值
    var titleEqual= new AV.Query('Collection');
    titleEqual.equalTo('title', search);
    // 类型等于搜索值
    var typeEqual = new AV.Query('Collection');
    typeEqual.equalTo('type', search);
    // 私密类型
    var privateType = new AV.Query('Collection');
    privateType.equalTo('privacy', PRIVACY_PRIVATE); 
    // 私密条件：标题完全匹配或类型完全匹配
    var privateCondition = AV.Query.or(titleEqual, typeEqual);
    // 私密搜索
    var privateQuery = AV.Query.and(privateType, privateCondition);

    // 公开搜索和私密搜索都显示
    var query = AV.Query.or(publicQuery, privateQuery);
    query.find()
      .then(function (data) {
        // 查询成功
        // 清空原收藏标记
        that.clearCollectionMarker();
        // 添加收藏标记
        that.addCollectionMarker(data);
      }, function (error) {
        // 查询失败
        console.error('Failed to save in LeanCloud:' + error.message);
        that.showPrompt('加载收藏失败');
      });
  },
  // 取消搜索按钮点击事件
  onCancelSearchTap: function (e) {
    var that = this;
    // 清空原收藏标记
    this.clearCollectionMarker();
    // 清空搜索框
    this.setData({
      searchValue: '',
      markers: markers,
    });
    search = '';
    var query = new AV.Query('Collection');
    // 添加条件后，开始查询
    query.equalTo('privacy', PRIVACY_PUBLIC); // 只显示公开的收藏
    query.find()
      .then(function (data) {
        // 添加收藏标记
        that.addCollectionMarker(data);
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
        var point = {
          latitude: res.latitude,
          longitude: res.longitude,
        };
        that.setData({
          position: point // 设置中心位置为选定点
        });
      },
      cancel: function () {
        // 选取取消
      },
      fail: function () {
        // 选取失败
        // that.showPrompt('选取失败');
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
    if (!mapCtx) {
      this.showPrompt('还未定位成功');
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
    if (!mapCtx) {
      that.showPrompt('还未定位成功');
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

    mapCtx.getCenterLocation({
      success: function (center) {
        var collection = AV.Object.extend('Collection');
        var col = new collection();
        col.set('title', collectTitle);
        col.set('type', collectType);
        col.set('content', collectContent);
        col.set('latitude', center.latitude);
        col.set('longitude', center.longitude);
        col.set('privacy', privacy);
        col.save().then(function (success) {
          // 添加成功
          that.showPrompt('添加成功');
          markers.push({
            id: markers.length,
            title: collectTitle,
            iconPath: COLLECTION_MARKER_RES,
            latitude: center.latitude,
            longitude: center.longitude,
            width: mapWidth * 0.1,
            height: mapWidth * 0.1
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
      }
    })
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
  // 私密性单选框更改事件
  onPrivacyChange: function (e) {
    privacy = parseInt(e.detail.value);
  },

  // 将收藏点添加到标记中
  addCollectionMarker: function (colFromCloud) {
    for (var i = 0; i < colFromCloud.length; ++i) {
      // 添加标记
      markers.push({
        id: markers.length,
        title: colFromCloud[i].get('title'),
        iconPath: COLLECTION_MARKER_RES,
        latitude: colFromCloud[i].get('latitude'),
        longitude: colFromCloud[i].get('longitude'),
        width: mapWidth * 0.1,
        height: mapWidth * 0.1,
        type: colFromCloud[i].get('type'),
        content: colFromCloud[i].get('content'),
      });
    }
    this.setData({
      markers: markers,
    });
  },

  // 清空收藏标记
  clearCollectionMarker: function () {
    markers = [
      locationMarker,
      selectedMarker,
    ];
    this.setData({
      markers: markers,
    });
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        // 获取页面大小
        height = res.windowHeight;
        width = res.windowWidth;

        // 设置地图大小
        mapHeight = height * MAP_HEIGHT_SCALA;
        mapWidth = width * MAP_WIDTH_SCALA;
        that.setData({
          mapHeight: mapHeight + 'px',
          mapWidth: mapWidth + 'px'
        })
      }
    });
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