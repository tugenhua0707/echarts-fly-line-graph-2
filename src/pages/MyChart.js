
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
    Chart,
    Interval,
    Axis,
    Tooltip,
  } from 'bizcharts';

const MyChart = (props) => {
    let {
      datas,
    } = props;
    var china;
    var series = [];
    let [ isFull, setFull ] = useState(false);
    let [ isClick, setClick ] = useState(false);
    let [ data2, setData2 ] = useState([]);
    let [ isVisible, setVisible ] = useState(false);
    let [ isFixed, setFixed ] = useState(false);
    let [ xy_value, setXYValue ] = useState(null); // 保存鼠标在页面上移动的 x / y 轴的坐标值
    let [ line_datas, setLineData ] = useState(null); // 保存飞线图的数据
    let [ currentIndex, setCurrentIndex ] = useState(0); // 当前tab项的索引值，默认为0，第一项
    // 地图数据
    var chinaGeoCoordMap = {};
    
    // 全局保存地图缩放的zoom 默认为1
    var GLOBAL_ZOOM = 1;
  
    // 保存用户是否已经点击了飞线图的状态 默认未点击，点击后，通过该参数锁定
    var isAlreadyClickFlight = false;
  
    // 保存options
    window.GLOBAL_OPTIONS = {};
  
    // 保存 seriesIndex 索引值
    var GLOBAL_SERIES_INDEX = 1;
  
    // 保存 飞线图的宽度，默认为1
    var GLOBAL_LINE_WIDTH = 1;
  
    function convertData(data, formdata, formdataValue) {
      var res = [];
      for(var i = 0; i < data.length; i++) {
          var dataItem = data[i];
          var fromCoord = chinaGeoCoordMap[dataItem[0].name];
  
          if(fromCoord && formdataValue) {
            res.push(
                [ 
              { 
                formName: formdata, 
                coord: formdataValue,
              },
              // 飞线往哪里去
                  { 
                toName: dataItem[0].name, 
                coord: fromCoord, 
                value: dataItem[0].value,
                item: dataItem[0]
              }
                ]
            );
          }
      }
      return res;
    }
    /*
     * @param { formdata } 中心点
     * @param { chinaDatas } 飞行数据
     * @param { formdataValue } 中心点坐标
    */
    function seriesFunc(formdata, chinaDatas, formdataValue) {
      let name = '';
      let color = '';
      let startColor = ''; // 渐变起始颜色
      let levelParams = 0; // 保存判断级别的变量
      if (currentIndex == 0) { // 碳排量
        levelParams = chinaDatas[0][0].totalCarbonEmission;
      } else if (currentIndex == 1) { // 单位公里碳排量
        levelParams = chinaDatas[0][0].unitCarbonEmission;
      }
      if (levelParams >= 9000) {
          name = '9000以上';
          color = '#c51b37';
          startColor = '#b34c5d';
      } else if (levelParams >= 6000 && levelParams < 9000) {
          name = '6000～9000';
          color = '#e28e10';
          startColor = '#886127';
      } else if (levelParams >= 3000 && levelParams < 6000) {
          name = '3000～6000';
          color = '#3f90ff';
          startColor = '#2f5c98';
      } else if (levelParams >= 0 && levelParams < 3000) {
          name = '0～3000';
          color = '#14be8b';
          startColor = '#3d675b';
      }
      if (chinaDatas && chinaDatas.length) {
          [[formdata, chinaDatas]].forEach(function(item, i) {
            series.push(
              {
                type: 'lines',
                name: name,
                coordinateSystem: 'geo',
                zlevel: 2,
                effect: {
                  show: true,
                  period: 8, //箭头指向速度，值越小速度越快
                  trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
                  // symbol: 'image://./images/airline.png', // 箭头图标
                  symbol: 'arrow',
                  // symbolSize: [20, 20], //图标大小
                  symbolSize: 10,
                  color: color, // 图标颜色
                },
                lineStyle: {
                  normal: {
                    show: true,
                    width: 2, //尾迹线条宽度
                    opacity: 0.6, //尾迹线条透明度
                    curveness: 0.3, //尾迹线条曲直度
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      {
                        offset: 0,
                        color: color // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: startColor // 100% 处的颜色
                      }
                    ])
                  },
                },
                data: convertData(item[1], formdata, formdataValue),
              },
              // 出发点
              {
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 2,
                hoverAnimation: true, // 鼠标移动上去后效果
                rippleEffect: { //涟漪特效
                  period: 8, //动画时间，值越小速度越快
                  brushType: 'stroke', //波纹绘制方式 stroke, fill
                  scale: 10 //波纹圆环最大限制，值越大波纹越大
                },
                label: {
                  normal: {
                    show: true,
                    position: 'bottom', //显示位置
                    offset: [6, 6], //偏移设置
                    color: '#a7b9cd',
                    formatter: function(params){ // 圆环显示文字
                      // return '';
                      return params.data.name;
                    },
                    fontSize: 11,
                  },
                  // 高亮时效果
                  emphasis: {
                    show: true,
                    areaColor: 'null',
                  }
                },
                symbol: 'circle',
                symbolSize: function(val) {
                  return 5 + val[2] * 5; // 圆环大小
                },
                itemStyle: {
                  normal: {
                    show: false,
                    color: color,
                  }
                },
                data: [{
                  name: chinaDatas[0][0].isStartAndEnd ? '' : formdata,
                  value: formdataValue,
                }],
              },
              // 到达点
              {
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 2,
                hoverAnimation: true, // 鼠标移动上去后效果
                rippleEffect: { //涟漪特效
                  period: 8, //动画时间，值越小速度越快
                  brushType: 'stroke', //波纹绘制方式 stroke, fill
                  number: 1,
                  scale: 10 //波纹圆环最大限制，值越大波纹越大
                },
                label: {
                  normal: {
                    show: true,
                    position: 'right', //显示位置
                    color: '#a7b9cd',
                    offset: [6, 6], //偏移设置
                    formatter: function(params) { // 圆环显示文字
                      // return '';
                      return params.data.name;
                    },
                    fontSize: 11
                  },
                  // 高亮时效果
                  emphasis: {
                    show: true,
                    areaColor: 'null',
                  }
                },
                symbol: 'circle',
                  symbolSize: function(val) {
                    return 2 + val[2] * 5; // 圆环大小
                  },
                  itemStyle: {
                    normal: {
                      show: false,
                      color: color,
                    }
                  },
                  data: item[1].map(function(dataItem) {
                    return {
                      name: chinaDatas[0][0].isStartAndEnd ? '' : dataItem[0].name,
                      value: chinaGeoCoordMap[dataItem[0].name].concat([dataItem[0].value])
                    };
                  }),
                }
              )
          })
      }
    }
    /*
     * 获取飞行数据的所有原点和终点
     * @return { Array } 返回所有飞行数据的原点和终点
     * 类似数据如下: [{label: '深圳', value: ['经度', '纬度']}, ....依次类推]
    */
    function getFlightOrigins(data) {
      let rets = []; // 保存飞行数据的原点
      let rets2 = []; // 保存飞行数据的终点
      let obj = {};
      let obj2 = {};
      if (data && data.length) {
        data.forEach(item => {
          rets.push({
            label: item.shipment,
            value: item.shipmentCoordinate
          });
          rets2.push({
            label: item.destination,
            value: item.destinationCoordinate,
          })
        })
      }
      const flightOriginsStart = rets.reduce((prev, cur) => {
        obj[cur.label] ? '' : obj[cur.label] = true && prev.push(cur);
        return prev;
      }, []);
      rets2 = rets2.concat(rets);
      const flightOriginsEnd = rets2.reduce((prev, cur) => {
        obj2[cur.label] ? '' : obj2[cur.label] = true && prev.push(cur);
        return prev;
      }, []);
      let obj3 = {};
      if (flightOriginsEnd && flightOriginsEnd.length) {
        flightOriginsEnd.forEach(item => {
          obj3[item.label] = item.value;
        })
      }
      chinaGeoCoordMap = obj3;
      return {
        flightOriginsStart,
        flightOriginsEnd,
      }
    };
  
    // 先克隆一下对象，遍历下，给对象添加新属性，如果原点和目标点相同的话，说明既是原点又是终点
    const { flightOriginsStart } = getFlightOrigins(datas);
    for (let i = 0; i < flightOriginsStart.length; i++) {
      const itemLabel = flightOriginsStart[i].label;
      for (let j = 0; j < datas.length; j++) {
        if (datas[j].destination === itemLabel) {
          datas[j].isStartAndEnd = true;
        } 
      }
    }
    /**
     * 获取飞行数据的所有原点对应的所有终点
     * @param { flightOrigins } 根据飞行数据的所有原点来获取对应的所有终点数据
     * 原起点数据如下 flightOrigins = [{label: '深圳', value: ['经度', '纬度']}, ....依次类推] 
     * @return { Array } 返回所有飞行数据的终点 key对应的飞行原点的label
     * 返回的数据如下：[
     *  {'深圳': [ [[{name: '', value: 0}]], [[{name: '', value: 0}]] ]},
     *  {'东莞': [ [[{name: '', value: 0}]], [[{name: '', value: 0}]] ]}
     *  .... 以此类推
     * ]
     */
    function getFlightEnd(flightOrigins) {
      let rets = [];
      if (flightOrigins && flightOrigins.length) {
        for (let i = 0; i < flightOrigins.length; i++) {
          const itemLabel = flightOrigins[i].label; // 获取飞行数据的原点对应的所有终点数据
          rets.push(getItemFlightEnd(itemLabel, flightOrigins[i].value));
        }
      }
      return rets;
    };
    function getItemFlightEnd(itemLabel, pos) {
      let rets = [];
      let obj = {};
      for (let i = 0; i < datas.length; i++) {
        const item = datas[i];
        if (itemLabel === item.shipment) {
          rets.push([[{
            name: item.destination,
            value: 0,
            unitCarbonEmission: item.unitCarbonEmission,
            totalCarbonEmission: item.totalCarbonEmission,
            totalTruckSize: item.totalTruckSize,
            totalKilometres: item.totalKilometres,
            isStartAndEnd: item.isStartAndEnd || false,
            carSizeData: item.carSizeData,
          }]])
        }
      }
      obj = {
        'label': itemLabel,
        'pos': pos,
        'value': rets,
      }
      return obj;
    }
    /*
     * 定位legend
     * 获取legend的个数
    */
    function getLegendCount() {
      const { series = [] } = window.GLOBAL_OPTIONS;
      let rets = [];
      if (series.length) {
        series.forEach(item => {
          if (item.type === 'lines') {
            rets.push(item.name);
          }
        });
      }
      console.log('----window.GLOBAL_OPTIONS----', window.GLOBAL_OPTIONS);
      return Array.from(new Set(rets));
    }
    function initFlight() {
      // 获取到所有的数据
      const allDatas = getFlightEnd(getFlightOrigins(datas).flightOriginsStart);
      // 初始化飞行数据
      if (allDatas && allDatas.length) {
        for (let init = 0; init < allDatas.length; init++) {
          const formdata = allDatas[init].label;
          const formdataValue = allDatas[init].pos;
          const { value = [] } = allDatas[init];
          if (value && value.length) {
            for (let y = 0; y < value.length; y++) {
              const chinaDatas = value[y];
              seriesFunc(formdata, chinaDatas, formdataValue)
            }
          }
        }
      }
    }
    initFlight();
  
    function openFullScreen() {
      let el = document.getElementById("myChart");
      if (el.requestFullScreen) {
        el.requestFullScreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
      } else if (el.msRequestFullScreen) {
        el.msRequestFullScreen();
      }
    };
    function exitFullScreen() {
      if (document.exitFullScreen) {
        document.exitFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullScreen) {
        document.msExitFullScreen();
      }
    }
    // 是否为全屏
    function isFullScreen() {
      return !!(
        document.fullscreen ||
        document.mozFullScreen || 
        document.webkitIsFullScreen || 
        document.webkitFullScreen || 
        document.msFullScreen
      );
    };
    // 获取鼠标在地图上移动的位置
    function pos(event) {  //鼠标定位赋值函数
      var posX = 0, posY = 0;  //临时变量值
      var e = event || window.event;  //标准化事件对象
      if (e.pageX || e.pageY) {  //获取鼠标指针的当前坐标值
        posX = e.pageX;
        posY = e.pageY;
      } else if (e.clientX || e.clientY) {
        posX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
        posY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
      }
      return {
        x: posX,
        y: posY,
      };
    }
    // 重置 layoutSize
    function resetLayoutSize() {
      // 如果是全屏下
      if (isFullScreen()) {
        window.GLOBAL_OPTIONS.layoutSize = window.screen.height;
        window.GLOBAL_OPTIONS.layoutCenter = ['50%', '50%'];
      } else {
        if (window.screen.height > 950 && window.screen.height < 1200) {
          window.GLOBAL_OPTIONS.layoutSize = 800;
        } else if (window.screen.height > 1200) {
          window.GLOBAL_OPTIONS.layoutSize = 1100;
        } else {
          window.GLOBAL_OPTIONS.layoutSize = 600;
        }
        window.GLOBAL_OPTIONS.layoutCenter = ['50%', '35%'];
      }
      console.log('-----resetLayoutSize---', window.GLOBAL_OPTIONS);
    }
    // 设置legend位置
    function setLegendPos() {
      let left = 340, bottom = window.screen.height > 1200 ? 395 : 345; // 页面初始化的时候，定位在该位置
      const count = getLegendCount().length;
      const datas = getLegendCount();
      let rets = [];
      if (datas && datas.length) {
        datas.forEach(item => {
          rets.push({
            name: item,
            icon: 'rect'
          })
        })
      }
      if (count === 1) {
        if (isFullScreen()) {
          left = 10;
          bottom = 50;
        } else {
          left = 340;
          bottom = window.screen.height > 1200 ? 420 : 370;
        }
      } else if (count === 2) {
        if (isFullScreen()) {
          left = 10;
          bottom = 76;
        } else {
          left = 340;
          bottom = window.screen.height > 1200 ? 446 : 396;
        }
      } else if (count === 3) {
        if (isFullScreen()) {
          left = 10;
          bottom = 100;
        } else {
          left = 340;
          bottom = window.screen.height > 1200 ? 470 : 420;
        }
      } else if (count === 4) {
        if (isFullScreen()) {
          left = 10;
          bottom = 120;
        } else {
          left = 340;
          bottom = window.screen.height > 1200 ? 496 : 446;
        }
      }
      window.GLOBAL_OPTIONS.title[0].left = left;
      window.GLOBAL_OPTIONS.title[0].bottom = bottom;
      window.GLOBAL_OPTIONS.legend.data = rets;
    }
  
    // 获取seriesIndex
    function getSeriesIndex(options, params) {
      const { data = {} } = params;
      const { formName = '', toName = '' } = data;
      const { series = [] } = options;
      let seriesIndex = 0;
      if (series.length) {
        for (let s = 0; s < series.length; s++) {
          const item = series[s];
          if (item.type === 'lines') {
            const sData = item.data;
            const currentFormName = sData[0][0].formName;
            const currentToName = sData[0][1].toName;
            if ((formName === currentFormName) && (toName === currentToName)) {
              seriesIndex = s;
              break;
            }
          }
        }
      }
      return seriesIndex;
    }
    
    var option = {
      layoutCenter: ['50%', '35%'],
      layoutSize: (window.screen.height > 950 && window.screen.height < 1200) ? 800 : (window.screen.height > 1200 ? 1100 : 600),
      title: [
        {
          text: '单位(吨)',
          left: 340,
          bottom: 446,
          width: 100,
          textStyle: {
            fontSize: 12,
            color: 'rgba(255,255,255,0.65)',
          }
        }
      ],
      legend: {
        orient: 'vertical',
        left: 340,
        bottom: window.screen.height > 1200 ? 395 : 345,
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 12,
        data: [
          {
            name: '9000以上',
            icon: 'rect'
          },
          {
            name: '6000～9000',
            icon: 'rect'
          },
          {
            name: '3000～6000',
            icon: 'rect'
          },
          {
            name: '0～3000',
            icon: 'rect'
          }
        ],
        textStyle: {
          color: '#fff'
        },
      },
      color: ["#c51b37", "#e28e10", "#3f90ff", "#14be8b"],
      toolbox: {
        show: true,
        itemGap: 5,
        right: 358,
        top: window.screen.height > 1200 ? 72 : 122,
        itemSize: 32,
        zlevel: 1000000,
        showTitle: false, // 鼠标移动上去不显示标题
        feature: {
          dataView: {
            show: false,
          },
          dataZoom: {
            show: true,
            iconStyle: {
              opacity: 0,
            },
          },
          restore: { show: false },
          saveAsImage: { show: false },
          // 全屏
          myFull: {
            show: true,
            title: '',
            icon: 'image://https://img.alicdn.com/imgextra/i1/O1CN01uVpZCF1V30vM3BxGI_!!6000000002596-2-tps-200-200.png',
            onHover: (e) => {
              console.log('---onHover---', e);
              var opts = e.getOption();
              if (isFullScreen()) {
                opts.toolbox[0].feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i3/O1CN01vgzs4g1xQCDGIka2M_!!6000000006437-2-tps-200-200.png";
              } else {
                opts.toolbox[0].feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i3/O1CN01PPeB6j1pA9PUu5aL3_!!6000000005319-2-tps-200-200.png";
              }
              china.setOption(opts, true);
            },
            onHide: (e) => {
              var opts = e.getOption();
              if (isFullScreen()) {
                opts.toolbox[0].feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i4/O1CN01WjTtjv1xCuj5ZiLyZ_!!6000000006408-2-tps-200-200.png";
              } else {
                opts.toolbox[0].feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i1/O1CN01uVpZCF1V30vM3BxGI_!!6000000002596-2-tps-200-200.png";
              }
              china.setOption(opts, true);
            },
            onclick: (e) => {
              var opts = e.getOption();
              if (isFullScreen()) {
                opts.toolbox[0].feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i1/O1CN01uVpZCF1V30vM3BxGI_!!6000000002596-2-tps-200-200.png";
                opts.toolbox[0].right = 358;
                opts.toolbox[0].top = window.screen.height > 1200 ? 72 : 122;
  
                opts.layoutCenter = ['50%', '35%'];
  
                if (window.screen.height > 950 && window.screen.height < 1200) {
                  opts.layoutSize = 800;
                } else if (window.screen.height > 1200) {
                  opts.layoutSize = 1100;
                } else {
                  opts.layoutSize = 600;
                }
                opts.legend[0].left = 340;
                opts.legend[0].bottom = window.screen.height > 1200 ? 490 : 345;
                // 如果是全屏模式，就退出全屏
                exitFullScreen();
              } else {
                opts.toolbox[0].feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i4/O1CN01WjTtjv1xCuj5ZiLyZ_!!6000000006408-2-tps-200-200.png";
                opts.legend[0].left = 10;
                opts.legend[0].bottom = 20;
  
                opts.layoutCenter = ['50%', '50%'];
                opts.layoutSize = window.screen.height;
  
                opts.toolbox[0].top = 30;
                opts.toolbox[0].right = 30;
                // opts.geo[0].zoom = 1.5;
                // 否则，打开全屏
                openFullScreen();
              }
              if (opts.series[GLOBAL_SERIES_INDEX]) {
                opts.series[GLOBAL_SERIES_INDEX].lineStyle.width = 1;
              }
              let left = 340, bottom = window.screen.height > 1200 ? 395 : 345; // 页面初始化的时候，定位在该位置
              const count = getLegendCount().length;
              if (count === 1) {
                if (isFullScreen()) {
                  left = 340;
                  bottom = window.screen.height > 1200 ? 520 : 370;
                } else {
                  left = 10;
                  bottom = 50;
                }
              } else if (count === 2) {
                if (isFullScreen()) {
                  left = 340;
                  bottom = window.screen.height > 1200 ? 540 : 396;
                } else {
                  left = 10;
                  bottom = 76;
                }
              } else if (count === 3) {
                if (isFullScreen()) {
                  left = 340;
                  bottom = window.screen.height > 1200 ? 565 : 420;
                } else {
                  left = 10;
                  bottom = 100;
                }
              } else if (count === 4) {
                if (isFullScreen()) {
                  left = 340;
                  bottom = window.screen.height > 1200 ? 584 : 446;
                } else {
                  left = 10;
                  bottom = 120;
                }
              }
              opts.title[0].left = left;
              opts.title[0].bottom = bottom;
              console.log('---opts-1223444--', opts);
              window.GLOBAL_OPTIONS = opts;
  
              console.log('--xxx--opts---', opts);
              // 解决窗口缩放事件导致不重新渲染的bug
              setTimeout(() => {
                china.setOption(opts, true);
              }, 350)
            }
          },
        }
      },
      tooltip: {
        show: true,
        // triggerOn: 'click',
        trigger: 'item',
        backgroundColor: 'rgba(27, 28, 33, 0.85)',
        borderColor: 'rgba(27, 28, 33, 0.85)',
        showDelay: 0, // 浮层显示的延迟
        hideDelay: 100, //浮层隐藏的延迟
        enterable: true, // 鼠标是否可进入提示框浮层中
        transitionDuration: 0, // 提示框浮层的移动动画过度时间 设置0的时候会紧跟着鼠标移动
        extraCssText: 'z-index:100000',
        textStyle: {
          color: '#fff',
        },
        formatter: function(params, ticket, callback) {
          const { data = {} } = params;
          const {
            formName = '',
            item = {},
            toName = ''
          } = data;
          if (!formName) {
            return;
          }
          // 如果已经点击了飞线图 就不需要再提示了
          if (isAlreadyClickFlight) {
            return;
          }
          setVisible(false);
          setClick(true);
          const {
            unitCarbonEmission,
            totalCarbonEmission,
            totalTruckSize,
            totalKilometres,
            carSizeData = [],
          } = item;
  
          // 弹窗柱状图显示
          const rets = [];
          carSizeData && carSizeData.length && carSizeData.forEach(item => {
            rets.push({
              label: item[0],
              value: item[1],
            })
          })
  
          if (isFullScreen()) {
            let legend = {};
            let toolbox = {};
    
            if (option.toolbox[0]) {
              toolbox = option.toolbox[0];
            } else {
              toolbox = option.toolbox;
            }
            toolbox.left = null;
            toolbox.top = 40;
            toolbox.right = 30;
            toolbox.bottom = null;
            toolbox.feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i4/O1CN01WjTtjv1xCuj5ZiLyZ_!!6000000006408-2-tps-200-200.png";
    
            // 标题
            option.title[0].left = 10;
            option.title[0].bottom = 120;
            if (option.legend[0]) {
              legend = option.legend[0];
            } else {
              legend = option.legend;
            }
            legend.left = 10;
            legend.bottom = 20;
          } else {
            
            let toolbox = {};
            let legend = {};
            if (option.toolbox[0]) {
              toolbox = option.toolbox[0];
            } else {
              toolbox = option.toolbox;
            }
            toolbox.top = window.screen.height > 1200 ? 72 : 122;
            toolbox.right = 358;
    
            toolbox.feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i1/O1CN01uVpZCF1V30vM3BxGI_!!6000000002596-2-tps-200-200.png";
            
            option.title[0].left = 340;
            option.title[0].bottom = 200;
    
            if (option.legend[0]) {
              legend = option.legend[0];
            } else {
              legend = option.legend;
            }
            legend.left = 340;
            legend.bottom = window.screen.height > 1200 ? 395 : 345;
          }
          setData2(rets);
          //根据业务自己拓展要显示的内容
          var res = "";
          res = "<div class='tool-tip'>" + 
                  "<div class='title'><span>"+formName+"</span>-<span>"+toName+"</span></div>" + 
                  "<div class='t-content'>"+
                    "<div><span class='desc'>单位公里排放量</span><span class='t-content'><i>"+unitCarbonEmission+"</i>吨/公里</span></div>" + 
                    "<div><span class='desc'>碳排量</span><span class='t-content'><i>"+totalCarbonEmission+"</i>吨</span></div>" + 
                    "<div><span class='desc'>总车次</span><span class='t-content'><i>"+totalTruckSize+"</i>次</span></div>" + 
                    "<div><span class='desc'>总公里数</span><span class='t-content'><i>"+totalKilometres+"</i>公里</span></div>" + 
                  "</div>"
                "</div>";
          return res;
        }
      },
      backgroundColor: new echarts.graphic.LinearGradient(0.1, 1, 1, 0.5, [
        {
          offset: 0,
          color: '#0f0f0f', // 0% 处的颜色
        },
        {
          offset: 0.2,
          color: '#272c37', // 0% 处的颜色
        },
        {
          offset: 0.75,
          color: '#272c37', // 0% 处的颜色
        },
        {
          offset: 0.9,
          color: '#0f0f0f', // 0% 处的颜色
        },
        {
          offset: 1,
          color: '#0f0f0f' // 100% 处的颜色
        }
      ], false),
    
      animation: false, // 解决阻止拖拽和缩放时上下图层不同步的问题
      geo: [{
        map: 'china', // 地图名
        zlevel: 2, // geo显示级别，默认是0
        roam: true, // 设置为false，不启动roam缩放
        scaleLimit: { //滚轮缩放的极限控制
          min: 0.5,
          max: 3
        },
        selectedMode: false, // 不让点击
        zoom: 1,
        label: {
          emphasis: {
            show: false,
            areaColor: 'null',
          }
        },
        regions: [
          {
            name: "南海诸岛",
            itemStyle: {
              // 隐藏南海诸岛
              normal: {
                opacity: 0,
              }
            }
          }
        ],
        itemStyle: { // 顶层地图的样式，如地图区域颜色，边框颜色，边框大小等
          normal: {
            borderColor: '#33587F', // 边框颜色
            areaColor:'#31344a', // 地图区域颜色
            borderWidth: 1, // 边框大小
          },
          emphasis: {
            areaColor: 'null',
            color: 'rgba(37, 43, 61, 0)', //悬浮背景
          }
        }
      },{
        map: 'china',
        zoom: 1,
        roam: true,
        selectedMode: false, // 不让点击
        scaleLimit: { //滚轮缩放的极限控制
          min: 0.5,
          max: 3
        },
        label: {
          emphasis: {
            show: false,
            areaColor: 'null',
          }
        },
        regions: [
          {
            name: "南海诸岛",
            itemStyle: {
              // 隐藏南海诸岛
              normal: {
                opacity: 0,
              }
            }
          }
        ],
        itemStyle: { // 地图的样式，如地图区域颜色，边框颜色，边框大小等
          normal: {
           borderColor: '#56b7ec', // 边框颜色
           areaColor:'#31344a', // 地图区域颜色
           borderWidth: 4, // 边框大小
           
           // 边框设置阴影 颜色渐变
           shadowBlur: 10,
           shadowColor: 'rgba(86, 183, 236, .5)',
           shadowOffsetX: 1,
           shadowOffsetY: 1,
          },
          emphasis: {
            color: 'rgba(37, 43, 61, 0)', //悬浮背景
            areaColor: null,
          }
        }
      }],
      series: series,
      zlevel: 1,
    };
    option.series.unshift({
      type: 'map',
      map: 'china',
      selectedMode: false, // 不让点击
      label: {
        show: false,
      },
      roam: true,
      geoIndex: 0,
      data: [],
    })
  
    window.GLOBAL_OPTIONS = option;
    // 首次渲染页面
    useEffect(() => {
      let mapWidth = document.getElementById('myChart').offsetWidth;
    
      var screenWidth = window.screen.width;
      let h = window.screen.height;
      console.log('----window.screen.height---', window.screen.height);
      
      if (window.screen.height > 1200) {
        h = document.body.clientHeight
      } else if (window.screen.height < 900) {
        h = 900;
      }
  
      document.getElementById('china').style.height = h + 'px';
  
      china = echarts.init(document.getElementById('china'));
  
      setLegendPos();
  
      console.log('----初始化---', window.GLOBAL_OPTIONS);
  
      china.setOption(window.GLOBAL_OPTIONS, true);
  
      const ulList = document.getElementById('ul-list');
      const liLists = ulList.getElementsByTagName('li');
  
      // 设置画布的高度
      document.getElementById('myChart').style.height = h - 48 + 'px';
  
      // 监听鼠标滚动的坐标
      document.onmousemove = function (event) {
        const values = pos(event);
        if (!isAlreadyClickFlight) {
          setXYValue(values);
        }
      }
      
      document.onclick = function(event) {
        if (!isFixed) {
          setFixed(false);
        }
        if (!isClick) {
          setClick(false);
        }
        if (!isVisible) {
          setVisible(false);
        }
        isAlreadyClickFlight = false;
        event.stopPropagation();
      }
  
      ulList.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('---window.GLOBAL_OPTIONS---', window.GLOBAL_OPTIONS);
        const target = e.target || e.srcElement;
        const cIndex = target.getAttribute('data-index');
        setCurrentIndex(cIndex);
  
        // 先删除所有的类名
        for (let i = 0; i < liLists.length; i++) {
            liLists[i].classList.remove('current');
        }
        var currentClass = target.getAttribute('class');
        if (currentClass) {
            currentClass = currentClass.concat(" current");
        } else {
            currentClass = "current";
        }
        target.setAttribute("class", currentClass);
        initFlight();
        if (isFullScreen()) {
          let legend = {};
          let toolbox = {};
  
          if (window.GLOBAL_OPTIONS.toolbox[0]) {
            toolbox = window.GLOBAL_OPTIONS.toolbox[0];
          } else {
            toolbox = window.GLOBAL_OPTIONS.toolbox;
          }
          toolbox.left = null;
          toolbox.top = 30;
          toolbox.right = 30;
          toolbox.bottom = null;
          toolbox.feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i4/O1CN01WjTtjv1xCuj5ZiLyZ_!!6000000006408-2-tps-200-200.png";
  
          // 标题
          window.GLOBAL_OPTIONS.title[0].left = 10;
          window.GLOBAL_OPTIONS.title[0].bottom = 120;
          if (window.GLOBAL_OPTIONS.legend[0]) {
            legend = window.GLOBAL_OPTIONS.legend[0];
          } else {
            legend = window.GLOBAL_OPTIONS.legend;
          }
          legend.left = 10;
          legend.bottom = 20;
        } else {
          let toolbox = {};
          let legend = {};
          if (window.GLOBAL_OPTIONS.toolbox[0]) {
            toolbox = window.GLOBAL_OPTIONS.toolbox[0];
          } else {
            toolbox = window.GLOBAL_OPTIONS.toolbox;
          }
          toolbox.top = window.screen.height > 1200 ? 72 : 122;
          toolbox.right = 358;
  
          toolbox.feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i1/O1CN01uVpZCF1V30vM3BxGI_!!6000000002596-2-tps-200-200.png";
          
          window.GLOBAL_OPTIONS.title[0].left = 340;
          window.GLOBAL_OPTIONS.title[0].bottom = 200;
  
          if (window.GLOBAL_OPTIONS.legend[0]) {
            legend = window.GLOBAL_OPTIONS.legend[0];
          } else {
            legend = window.GLOBAL_OPTIONS.legend;
          }
          legend.left = 340;
          legend.bottom = window.screen.height > 1200 ? 395 : 345;
        }
        const { geo = [] } = window.GLOBAL_OPTIONS;
        if (geo && geo.length) {
          geo.forEach(item => {
            item.zoom = GLOBAL_ZOOM;
          });
        };
        setLegendPos();
        resetLayoutSize();
        if (window.GLOBAL_OPTIONS.series[GLOBAL_SERIES_INDEX]) {
          window.GLOBAL_OPTIONS.series[GLOBAL_SERIES_INDEX].lineStyle.normal.width = GLOBAL_LINE_WIDTH;
        }
        console.log('----click---click---window.GLOBAL_OPTIONS----', window.GLOBAL_OPTIONS);
        china.setOption(window.GLOBAL_OPTIONS, true);
      });
  
      window.onresize = function() {
        
        let h;
        let w = mapWidth;
        
        if (isFullScreen()) {
          setFull(true);
          h = window.screen.height;
          w = screenWidth;
        } else {
          setFull(false);
          h = window.screen.height;
          w = mapWidth; // 要加200
        }
        console.log('---h---', h);
        china.resize({
          height: h,
          width: w,
        });
      }
      // 捕捉到georoam事件，使下层的geo随着上层的geo一起缩放拖拽
      china.off('georoam').on('georoam', function(params) {
        var option = china.getOption();
  
        const { geo = [] } = option;
        if (geo && geo.length) {
          GLOBAL_ZOOM = geo[0].zoom || 1;
        }
        if (params.zoom != null && params.zoom != undefined) { // 捕捉到缩放时
          option.geo[1].zoom = option.geo[0].zoom; // 下层geo的缩放跟着上层的geo一起改变
          option.geo[1].center = option.geo[0].center; // 下层的geo的中心位置随着上层的geo一起改变
        } else {
          option.geo[1].center = option.geo[0].center; // 下层的geo的中心位置随着上层的geo一起改变
        }
        china.setOption(option, true);
      });
      china.off('mouseout').on('mouseout', function(params) {
        if (!isAlreadyClickFlight) {
          if (params.data) { // 有数据说明移到了飞线图那个地方
            setVisible(true);
          }
        }
      });
      china.off('click').on('click', { type: 'effectScatter' }, function(params) {
        let {
          data = {},
        } = params;
        initFlight();
        setLegendPos();
        resetLayoutSize();
        console.log('----window.GLOBAL_OPTIONS----', window.GLOBAL_OPTIONS);
        
        const cloneOptions = _.cloneDeep(window.GLOBAL_OPTIONS);
  
        let seriesIndex = getSeriesIndex(cloneOptions, params);
  
        if (cloneOptions.series[seriesIndex] && cloneOptions.series[seriesIndex].lineStyle) {
          GLOBAL_LINE_WIDTH = 6;
          // 改变状态，已经点击了飞线图
          GLOBAL_SERIES_INDEX = seriesIndex;
          setTimeout(() => {
            cloneOptions.series[seriesIndex].lineStyle.normal.width = 6;
            setFixed(true);
            setClick(true);
            setVisible(false);
            isAlreadyClickFlight = true;
          }, 300);
          const datas = params.data ? params.data : null;
          setLineData(datas);
        }
        if (isFullScreen()) {
          let legend = {};
          let toolbox = {};
  
          if (cloneOptions.toolbox[0]) {
            toolbox = cloneOptions.toolbox[0];
          } else {
            toolbox = cloneOptions.toolbox;
          }
          toolbox.left = null;
          toolbox.top = 30;
          toolbox.right = 30;
          toolbox.bottom = null;
          toolbox.feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i4/O1CN01WjTtjv1xCuj5ZiLyZ_!!6000000006408-2-tps-200-200.png";
          
          if (cloneOptions.legend[0]) {
            legend = cloneOptions.legend[0];
          } else {
            legend = cloneOptions.legend;
          }
          legend.left = 10;
          legend.bottom = 20;
        } else {
          
          let toolbox = {};
          let legend = {};
          if (cloneOptions.toolbox[0]) {
            toolbox = cloneOptions.toolbox[0];
          } else {
            toolbox = cloneOptions.toolbox;
          }
          toolbox.top = window.screen.height > 1200 ? 72 : 122;
          toolbox.right = 358;
  
          toolbox.feature.myFull.icon = "image://https://img.alicdn.com/imgextra/i1/O1CN01uVpZCF1V30vM3BxGI_!!6000000002596-2-tps-200-200.png";
  
          if (cloneOptions.legend[0]) {
            legend = cloneOptions.legend[0];
          } else {
            legend = cloneOptions.legend;
          }
          legend.left = 340;
          legend.bottom = window.screen.height > 1200 ? 395 : 345;
        }
        const { geo = [] } = cloneOptions;
        if (geo && geo.length) {
          geo.forEach(item => {
            item.zoom = GLOBAL_ZOOM;
          });
        };
        
        console.log('----isFull--isFull000---', cloneOptions);
        window.GLOBAL_OPTIONS = cloneOptions;
        setTimeout(() => {
          china.setOption(cloneOptions, true);
        }, 350);
        const { item = {} } = data;
        const rets = [];
        const { carSizeData = [] } = item;
        if (carSizeData && carSizeData.length) {
          carSizeData.forEach(item => {
            rets.push({
              label: item[0],
              value: item[1],
            })
          });
          setData2(rets);
        }
        params.event.event.stopPropagation();
      });
      const closed = document.getElementById('closed');
      const showBtn = document.getElementById('show-table-btn');
      closed?.addEventListener('click', function(e) {
        console.log('---closed---');
        setVisible(true);
        e.stopPropagation();
      });
      showBtn?.addEventListener('click', function(e) {
        setVisible(false);
        e.stopPropagation();
      });
    }, [datas]);
    
    console.log(1111);
    return (
      <div>
        <div className="mychart-container" id="myChart">
          <div id="wrapMap" className={ isFull ? '' : (window.screen.height > 1200 ? 'wrapMap current' : 'wrapMap' ) }>
            <div id="china"></div>
            <div className={ isFull ? 'south-sea isfull' : ( window.screen.height > 1200 ? 'south-sea current' : 'south-sea')}></div>
          </div>
          <ul id="ul-list" className={ isFull ? 'ul-list isfull' : 'ul-list'}>
            <li className="current" data-index="0">碳排量</li>
            <li data-index="1">单位公里碳排量</li>
          </ul>
          <div className="show-table-container">
            <div id="show-table" className={
              !isFull ? (isVisible ? "show-table slideOutLeft" : (isClick ? "show-table slideInLeft" : "show-table slideOutLeft none")) : 
              (isVisible ? "show-table slideOutLeft isfull" : (isClick ? "show-table slideInLeft isfull" : "show-table slideOutLeft isfull none"))
            }>
              <div className="closed" id="closed"></div>
              <div className="msg1">车次</div>
              <div className={ isFull ? 'msg2 isfull' : 'msg2'}>单位公里碳排放量(t/km)</div>
              <div className="table-content">
                <Chart height={ isFull ? 233 : 155 } autoFit data={data2} padding={[30, 30, 30, 50]} >
                  <Interval position="label*value" size={8} />
                  <Tooltip visible={false} />
                  <Axis
                    name="value"
                    label={
                      {
                        style: {
                          fill: 'rgba(255,255,255,0.65)',
                        }
                      }
                    }
                    grid={
                      {
                        line: {
                          type: 'line',
                          style: {
                            stroke: '#2b2c38'
                          }
                        }
                      }
                    }
                  />
                  <Axis
                    name="label"
                    // visible={false}
                    label={
                      {
                        style: {
                          fill: 'rgba(255,255,255,0.65)',
                        }
                      }
                    }
                    line={{
                      style: {
                        stroke: '#2b2c38'
                      }
                    }}
                    tickLine={{
                      style: {
                        stroke: '#2b2c38'
                      }
                    }}
                  />
                </Chart>
              </div>
            </div>
          </div>
          <div id="show-table-btn" className={ 
            !isFull ? (isVisible ? 'show-table-btn' : 'show-table-btn none') : (isVisible ? 'show-table-btn isfull' : 'show-table-btn isfull none') 
          }></div>
          <div 
            className={ isFixed ? "alert-pos isFixed" : 'alert-pos' }
            style={{ top: xy_value ? xy_value.y + 'px' : '-9999px', left: xy_value ? xy_value.x + 'px' : '-9999px' }}
          >
            <div className='tool-tip'>
              <div className='title'>
                <span>{line_datas && line_datas.formName}</span>-
                <span>{line_datas && line_datas.toName}</span>
              </div>
              <div className='t-content'>
                <div>
                  <span className='desc'>单位公里排放量</span>
                  <span className='t-content'>
                    <i>{line_datas && line_datas.item && line_datas.item.unitCarbonEmission}</i>吨/公里
                  </span>
                </div>
                <div>
                  <span className='desc'>碳排量</span>
                  <span className='t-content'>
                    <i>{line_datas && line_datas.item && line_datas.item.totalCarbonEmission}</i>吨
                  </span>
                </div>
                <div>
                  <span className='desc'>总车次</span>
                  <span className='t-content'><i>{line_datas && line_datas.item && line_datas.item.totalTruckSize}</i>次</span>
                </div>
                <div>
                  <span className='desc'>总公里数</span>
                  <span className='t-content'><i>{line_datas && line_datas.item && line_datas.item.totalKilometres}</i>公里</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="isFull_default"></div>
        <div className="isShinkage_default"></div>
        <div className="isFull_default_hover"></div>
        <div className="isShinkage_default_hover"></div>
        <div className="show-table-btn-hover"></div>
        <div className="show-table-closed-hover"></div>
      </div>
    );
  };
  
  export default MyChart;