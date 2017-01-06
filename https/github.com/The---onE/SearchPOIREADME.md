# 微信小程序地图选点收藏Demo
### 本程序是用于测试微信小程序地图功能及与LeanCloud数据存储管理功能的Demo。
### 本程序目前未添加AppID无法进行真机调试，欢迎已经申请到资格的朋友测试反馈。
##### 本程序数据管理功能基于LeanCloud提供的数据存储功能，在开发程序前需要在云端创建应用，并将对应信息初始化到程序中
## 代码结构
将本程序代码直接使用微信开发者工具打开即可编译调试
### 根目录
#### app.js
初始化小程序，获取用户信息等基本信息，**初始化LeanCloud对象，设置对应的信息**
#### app.json
设置基本配置项，**pages属性设置程序所有页面**
#### app.wxss
公共样式库
### libs目录
引入的外部文件
### res目录
图片等资源文件
### utils目录
常用工具文件
### pages目录
.wxml文件:基本页面，类似html文件  
.wxss文件:样式文件，类似css文件  
.js文件:脚本文件  
.json文件:数据文件  
#### index目录
首页，引导打开地图页面
#### logs目录
自动生成的用于显示日志的调试文件
#### map目录
地图功能的主目录，首页选择【打开地图】选项进入，集成程序的主要功能，包括显示地图、定位、选点、收藏等主要功能  
选点方式为地图中心为选定点，拖动地图选点。点击地图打开微信选点工具直接移动到特定点
#### map2目录
地图页面的备份目录，首页选择【打开地图(旧)】选项进入，基本功能与新地图一致，选点方式为另一方式  
选点方式为点击地图打开微信选点工具选点
## 实现功能
### 首页
可点击按钮进入地图页，两个地图页的选点方式不同，其余功能一致
![image](https://github.com/The---onE/SearchPOI/blob/master/res/introduction-index.png)
### 定位
进入地图页后程序默认直接开始定位，定位成功后在当前位置显示标记，并将地图中心设为当前位置
![image](https://github.com/The---onE/SearchPOI/blob/master/res/introduction-location.png)
### 添加收藏
地图定位成功后可进行选点，新旧版本分别为拖动地图选点和打开微信选点工具选点，选点成功后可点击添加收藏按钮弹出添加收藏对话框，输入对应信息后可将选定点及相关信息添加到收藏，收藏信息转化为LeanStorage对象保存至LeanCloud服务器
![image](https://github.com/The---onE/SearchPOI/blob/master/res/introduction-collect.png)
### 搜索收藏
地图上会为收藏点显示标记，在没有搜索的情况下，会默认显示所有公开的收藏，输入搜索条件并点击搜索按钮后会进行搜索，搜索规则为：可以搜索到所有标题或类型**包含**搜索条件的**公开**收藏**及**所有标题或类型与搜索条件**完全一致**的**私密**收藏
![image](https://github.com/The---onE/SearchPOI/blob/master/res/introduction-search.png)
### 收藏信息
点击地图上的收藏标记会打开收藏信息对话框，其中包含收藏的详细信息
![image](https://github.com/The---onE/SearchPOI/blob/master/res/introduction-information.png)
