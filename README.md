# pull-refresh
JavaScript 下拉刷新

## 如何使用
### 下载编译
clone 当前库
```
git clone https://github.com/zhongqc/pull-refresh.git
```
进入当前目录并执行
```
npm run build
```
编译好的js文件将会放置在dist目录下
### 使用
使用方法非常简单，只需要引用编译好的js文件后创建一个新的pullRefresh对象既可
```javascript
let params = {
    selector: string, //触发下拉刷新的对象的选择器
    allowScrollElement: string, //需要滚动的元素选择器，默认为body，防止需要正常滚动的元素无法正常向下拖动
    pullHeight: number, //触发刷新时间的移动高度，移动距离大于此高度的情况下才会刷新，下拉显示条的最大高度，刷新时会回弹到此高度，默认为44
    pullMessage: string, //下拉时显示的信息，可以为文本或html，默认为'下拉以刷新数据...'
    holdMessage: string, //移动距离大于触发高度时显示的文本，同样可为文本或html，默认'松开刷新'
    refreshMessage: string, //刷新时显示的信息，文本或html，默认'刷新中...'
    refreshEndMessage: string, //刷新结束时显示的信息，文本或html，默认'刷新完成'
    transitionDuration: string //下拉对象及消息条的弹回时间，为带时间单位的字符串，默认'200ms'
}

function refreshing (endEvent) { //刷新时触发的方法，参数类型为function，为刷新结束的回调函数，需要在刷新结束时触发该函数
    //your codes here
    /*
    //example
    setTimeout(function () {
    				endEvent();
    			}, 1000);
    */
    //异步调用需要在异步的函数中执行endEvent
}
let refresh = new pullRefresh(params, refreshing); //传入设置参数及刷新时触发的方法
```