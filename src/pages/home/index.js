require('./index.scss');

const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
const echarts = require('echarts');
require('../../utils/jquery.timelinr-0.9.3');
require('./style.css');


//当前视口宽度
let nowClientWidth = document.documentElement.clientWidth;

// 相对单位
function nowSize(val, initWidth = 1920) {
  return val * (nowClientWidth / initWidth);
}


let makeOthersTranslucent;
// let viewToken = 'e74ce468e2dd43c18964fe6d5cc8581e';
let viewToken = '';
// 声明Viewer及App
let viewer3D;
let app;
let viewAdded = false;
let cameraState = {
  "name": "persp",
  "position": {
    "x": -98198.41785178437,
    "y": -174298.20607429993,
    "z": 82917.81698612121
  },
  "target": {
    "x": 12823.156403469402,
    "y": -16131.683787727838,
    "z": 34584.82924450994
  },
  "up": {
    "x": 0.13940295279124232,
    "y": 0.19859995972778646,
    "z": 0.9701159068633007
  },
  "near": 178516.65234108476,
  "far": 305747.644017375,
  "zoom": 0,
  "version": 1,
  "fov": 45,
  "aspect": 2.1793416572077184,
  "coordinateSystem": "world"
};
const AppKey = 'rQUYzeNwJs4IGZFXCh4PHSO4KDuSGxFR';
const AppSecret = 'EBVdouxXTJpHZpPhiYzldEctSavg2szL';

/*
* bimface获取Access Token
* */
function signature() {
  const base64Str = window.btoa(`${AppKey}:${AppSecret}`);
  return `Basic ${base64Str}`;
}

function getModelToken(accessToken) {
  $.ajax({
    type: 'GET',
    headers: {
      Authorization: `bearer ${accessToken}`
    },
    url: '/api/view/token',
    data: {
      fileId: '2051285170694464',
    },
    success: (data) => {
      if (data && data.code === 'success') {
        viewToken = data.data;
        initBIMInfo(viewToken);
      }
    },
  });
}

function getAccessToken() {
  $.ajax({
    type: 'POST',
    headers: {
      Authorization: signature()
    },
    url: '/api/oauth2/token',
    data: {
      AppKey,
      AppSecret,
    },
    success: (data) => {
      if (data && data.code === 'success') {
        const token = data.data.token;
        if (token) {
          getModelToken(token);
        }
      }
    },
  });
}

// 初始化日期时间
function initTimer() {
  // 日期
  dayjs.extend(isoWeek);
  const weekText = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  let timer = null;
  $('#date').html(dayjs().format('YYYY/MM/DD'));
  $('#week').html(weekText[dayjs().isoWeekday()]);
  clearInterval(timer);
  timer = setInterval(() => {
    $('#time').html(dayjs().format('hh:mm:ss'));
  }, 1000);
}

// ************************** 设置初始位置&自动旋转 **************************
function setCameraStatus(callback) {
  viewer3D.setCameraStatus(cameraState, callback);
}

// ************************** 绕中心旋转场景 **************************
function centerRotate() {
  viewer3D.startAutoRotate(1);
}

//********************根据条件隔离构件*********************
const floorArr = [{
  "levelName": "28/29"
}, {
  "levelName": "F28"
}, {
  "levelName": "F27"
}, {
  "levelName": "F26"
}, {
  "levelName": "F25"
}, {
  "levelName": "F24"
}, {
  "levelName": "F23"
}, {
  "levelName": "F22"
}, {
  "levelName": "F21"
}, {
  "levelName": "F20"
}, {
  "levelName": "F19"
}, {
  "levelName": "F18"
}, {
  "levelName": "F17"
}, {
  "levelName": "F16"
}, {
  "levelName": "F15"
}, {
  "levelName": "F14"
}, {
  "levelName": "F12"
}, {
  "levelName": "F11"
}, {
  "levelName": "F10"
}, {
  "levelName": "F9"
}, {
  "levelName": "F8"
}, {
  "levelName": "F7"
}, {
  "levelName": "F6"
}, {
  "levelName": "F5"
}, {
  "levelName": "F4"
}, {
  "levelName": "F3"
}, {
  "levelName": "F2"
}, {
  "levelName": "F1"
}, {
  "levelName": "B1"
}, {
  "levelName": "B2"
}];

var color1 = "#5373E0";
var color2 = "#6B8FE5";
var color3 = "#83ABE9";
var color4 = "#A9CFF5";
var color5 = "#D1EFFA";
var color6 = "#D0E7ED";
var color7 = "#ECF1E0";
var color8 = "#F9ECB7";
var color9 = "#FFE391";
var color10 = "#F9834F";
var color11 = "#FB5047";
var color12 = "#EE2632";

const colorsMap = {
  colors1: [color1, color2, color6, color7, color8, color9, color10, color11, color12, color11, color10, color9, color8, color7, color9, color10, color11, color12, color11, color10, color9, color8, color7, color7, color6, color5, color4, color11, color10, color9],
  colors2: [color1, color2, color3, color4, color5, color6, color7, color8, color9, color10, color11, color12, color11, color10, color9, color8, color7, color6, color5, color4, color3, color2, color1, color7, color6, color5, color4, color3, color2, color1],
  colors3: [color1, color2, color3, color4, color5, color6, color5, color4, color3, color2, color1, color2, color3, color4, color5, color6, color5, color4, color3, color2, color1, color2, color3, color7, color4, color5, color6, color5, color4, color3],
  colors4: [color8, color7, color6, color5, color4, color3, color2, color1, color2, color3, color4, color5, color6, color7, color8, color9, color10, color11, color12, color11, color10, color9, color8, color7, color6, color5, color4, color3, color2, color1],
  colors5: [color11, color12, color11, color10, color8, color9, color10, color11, color12, color11, color10, color9, color8, color7, color9, color10, color11, color12, color11, color10, color9, color8, color7, color7, color6, color5, color4, color3, color2, color1],
};

function isolateComponentsByData() {
  //设置隔离构件的条件
  viewer3D.isolateComponentsByObjectData(floorArr, makeOthersTranslucent);
  viewer3D.render();
}

// ************************** 着色 **************************
function overrideComponents(data) {
  // 对构件进行着色
  for (let i = 0; i < floorArr.length; i++) {
    var color = new Glodon.Web.Graphics.Color(data[i], 1);
    viewer3D.overrideComponentsColorByObjectData([floorArr[i]], color);
    viewer3D.render();
  }
}

function successCallback() {
  const dom4Show = $('#domId');
  // 设置WebApplication3D的配置项
  const webAppConfig = new Glodon.Bimface.Application.WebApplication3DConfig();
  webAppConfig.domElement = dom4Show.get(0);

  //是否启用右键菜单
  webAppConfig.enableToggleContextMenuDisplay = false;

  // 加载时隐藏Viewhouse
  webAppConfig.enableViewHouse = false;

  //是否设置默认为全透明
  webAppConfig.backgroundColor = [{
    color: new Glodon.Web.Graphics.Color(25, 28, 33, 0)
  }];

  // 创建WebApplication3D，用以显示模型
  app = new Glodon.Bimface.Application.WebApplication3D(webAppConfig);
  app.addView(viewToken);
  viewer3D = app.getViewer();

  // 监听添加view完成的事件
  viewer3D.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded, function () {
    viewAdded = true;
    viewer3D.enableScale(false);//禁止旋转
    viewer3D.enableOrbit(false);//禁止场景缩放
    viewer3D.enableTranslate(false);//禁止平移
    //自适应屏幕大小
    window.onresize = function () {
      viewer3D.resize(document.documentElement.clientWidth, document.documentElement.clientHeight - 40);
    };
    setCameraStatus(centerRotate);
    overrideComponents(colorsMap.colors1);
    makeOthersTranslucent = Glodon.Bimface.Viewer.IsolateOption.MakeOthersTranslucent;
    isolateComponentsByData();
    // 渲染3D模型
    viewer3D.render();
  });
}

function failureCallback(err) {
  console.log(err);
}

// 初始化加载BIM
function initBIMInfo() {
  let loaderConfig = new BimfaceSDKLoaderConfig();
  loaderConfig.viewToken = viewToken;
  BimfaceSDKLoader.load(loaderConfig, successCallback, failureCallback);
}

// 右侧图表
var chartDom = document.getElementById('chart1');
var myChart = echarts.init(chartDom);
var option;
option = {
  title: {
    text: '历史用电分类 kw·h',
    textStyle: {
      color: '#fff',
      fontSize: nowSize(18),
      fontStyle: 'normal'
    },
    left: 'center'
  },
  legend: {
    top: 'bottom',
    textStyle: {
      color: '#aaa',
      fontSize: nowSize(12)
    }
  },
  toolbox: {
    show: false,
  },
  series: [
    {
      name: '面积模式',
      type: 'pie',
      radius: [nowSize(30), nowSize(100)],
      center: ['55%', '42%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 2
      },
      label: {
        color: '#aaa',
        fontSize: nowSize(14)
      },
      labelLine: {},
      data: [
        { value: 1000, name: '电梯' },
        { value: 500, name: '室内设备' },
        { value: 1200, name: '公共区域' },
        { value: 800, name: '其他' },
        { value: 1000, name: '照明' },
        { value: 1800, name: '空调' },
      ]
    }
  ]
};

option && myChart.setOption(option);


// chart2
const chart2Dom = document.getElementById('chart2');
const myChart2 = echarts.init(chart2Dom);
let option2;

option2 = {
  title: {
    text: "历史月度用电对比",
    textStyle: {
      color: '#fff',
      fontSize: nowSize(18),
      fontStyle: 'normal'
    },
    left: 'center',
    top: nowSize(10)
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#aaa'
      }
    }
  },
  toolbox: {
    show: true
  },
  legend: {
    data: ['2019全年', '2020全年'],
    bottom: nowSize(10),
    textStyle: {
      color: '#fff',
      fontSize: nowSize(12)
    }
  },
  xAxis: [
    {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisPointer: {
        show: false,
        type: 'shadow'
      },
      axisLabel: {
        color: '#aaa'
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '用电量(kw·h)',
      nameLocation: 'center',
      nameTextStyle: {
        color: '#aaa'
      },
      min: 0,
      max: 12000,
      interval: 3000,
      axisLabel: {
        formatter: '',
        color: '#aaa'
      },
      axisPointer: {
        show: false,
      }
    },
    {
      type: 'value',
      // name: '温度',
      min: 0,
      max: 14000,
      interval: 3000,
      axisLabel: {
        // formatter: '{value} °C',
        color: '#aaa'
      }
    }
  ],
  series: [
    {
      name: '2019全年',
      type: 'bar',
      data: [6000, 8001, 8901, 9000, 9600, 10200, 11000, 11010, 11300, 8100, 7880, 8600]
    },
    {
      name: '2020全年',
      type: 'line',
      yAxisIndex: 1,
      data: [6500, 10090, 10200, 10900, 11222, 12199, 12993, 13102, 13090, 12000, 11003, 10201]
    }
  ],
  grid: {
    top: '20%',
    left: '6%',
    right: '2%',
    bottom: '15%',
    containLabel: true
  },
};

option2 && myChart2.setOption(option2);


/*
* chart3
* */
const chart3Dom = document.getElementById('chart3');
var myChart3 = echarts.init(chart3Dom);
var option3;

// option3 = {
//   title: {
//     text: "今日用电总量",
//     textStyle: {
//       color: '#fff',
//       fontSize: nowSize(18),
//       fontStyle: 'normal'
//     },
//     left: 'center',
//     top: nowSize(10)
//   },
//   tooltip: {
//     trigger: 'axis',
//     axisPointer: {
//       type: 'cross',
//       label: {
//         backgroundColor: '#6a7985'
//       }
//     }
//   },
//   xAxis: {
//     type: 'category',
//     data: ['0时', '1时', '2时', '3时', '4时', '5时', '6时', '7时', '8时', '9时', '10时', '11时', '12时', '13时', '14时', '15时', '16时', '17时', '18时', '19时', '20时', '21时', '22时', '23时'],
//     axisLabel: {
//       color: '#aaa'
//     },
//     axisPointer: {
//       show: false,
//     },
//   },
//   yAxis: {
//     type: 'value',
//     axisLabel: {
//       color: '#aaa'
//     },
//     axisPointer: {
//       show: false,
//     },
//   },
//   series: [{
//     data: [200, 100, 177, 188, 167, 300, 380, 400, 400, 412, 415, 440, 380, 387, 388, 361, 351, 342, 290, 200, 270, 256, 249, 240,],
//     type: 'line',
//     smooth: false,
//     areaStyle: {
//       opacity: 0.8,
//       color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
//         offset: 0,
//         color: 'rgba(128, 255, 165)'
//       }, {
//         offset: 1,
//         color: 'rgba(1, 191, 236)'
//       }])
//     },
//     lineStyle: {
//       width: 0
//     },
//     showSymbol: false,
//     emphasis: {
//       focus: 'series',
//     },
//     itemStyle: {
//       normal: {
//         lineStyle: {
//           color: 'rgba(1, 191, 236)'
//         }
//       }
//     },
//   }],
//   grid: {
//     top: '20%',
//     left: '6%',
//     right: '2%',
//     bottom: '15%',
//     containLabel: true
//   },
// };

option3 = {
  title: {
    text: '今日用电总量',
    textStyle: {
      color: '#fff',
      fontSize: nowSize(18),
      fontStyle: 'normal'
    },
    left: 'center',
    top: nowSize(10)
  },
  tooltip: {
    show: false,
  },
  toolbox: {
    show: false,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45'],
    axisLabel: {
      color: '#BBBDE6'
    },
    axisPointer: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: false,
    },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#BBBDE6'
    },
    axisPointer: {
      snap: false,
      show: false,
    },
  },
  grid: {
    top: '30%',
    left: '3%',
    right: '2%',
    bottom: '10%',
    containLabel: true
  },
  visualMap: {
    show: false,
    dimension: 0,
    pieces: [{
      lte: 6,
      color: '#5ad8a6'
    }, {
      gt: 6,
      lte: 8,
      color: '#FF4500'
    }, {
      gt: 8,
      lte: 14,
      color: '#5ad8a6'
    }, {
      gt: 14,
      lte: 17,
      color: '#FF4500'
    }, {
      gt: 17,
      color: '#5ad8a6'
    }]
  },
  series: [
    {
      name: '用电量',
      type: 'line',
      smooth: false,
      data: [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
      symbol: 'diamond',
      symbolSize: nowSize(12),
      lineStyle: {
        width: nowSize(2),
      },
      itemStyle: {
        borderWidth: nowSize(2),
      },
      markArea: {
        label: {
          color: '#aaa',
          fontSize: nowSize(14)
        },
        itemStyle: {
          color: 'rgba(232,104,74,.4)',
        },
        data: [[{
          name: '早高峰',
          xAxis: '07:30'
        }, {
          xAxis: '10:00'
        }], [{
          name: '晚高峰',
          xAxis: '17:30'
        }, {
          xAxis: '21:15'
        }]]
      },
      markLine: {
        data: [{
          yAxis: 600,
          coord: [0, 0.3],
          label: {
            formatter: '',
            position: 'insideStart'
          }
        }],
        label: {
          distance: [10, 8]
        }
      }
    }
  ]
};

option3 && myChart3.setOption(option3);

/*
* circle charts
* */
const circleData = [{
  color: '',
  value: 300,
  title: '照明',
  domId: 'chartCircle1',
}, {
  color: '',
  value: 276,
  title: '电梯',
  domId: 'chartCircle2',
}, {
  color: '',
  value: 510,
  title: '空调',
  domId: 'chartCircle3',
}, {
  color: '',
  value: 308,
  title: '室内设备',
  domId: 'chartCircle4',
}, {
  color: '',
  value: 389,
  title: '公共区域',
  domId: 'chartCircle5',
}, {
  color: '',
  value: 279,
  title: '其他',
  domId: 'chartCircle6',
},];
const chartCirleDom = [];
const myChartCircle = [];
const chartCircleOptions = [];
let totalNum = 0;
let chartOption = {
  title: {
    text: "History's Electron",
    textStyle: {
      color: '#aaa',
      fontWeight: 'normal',
      fontSize: nowSize(18)
    }
  },
  series: [{
    type: 'gauge',
    min: 0,
    max: 700,
    center: ["50%", "55%"], // 仪表位置
    radius: "70%", //仪表大小
    pointer: {
      show: false
    },
    progress: {
      show: true,
      width: 14,
      itemStyle: {
        opacity: 1,
        color: {
          type: 'linear',
          x: 10,
          y: 0,
          x2: 100,
          y2: 0,
          colorStops: [{
            offset: 0, color: '#0099FF' // 0% 处的颜色
          },
            {
              offset: 0.25, color: '#00CC99' // 0% 处的颜色
            },
            {
              offset: 0.5, color: '#00CC99' // 0% 处的颜色
            },
            {
              offset: 0.75, color: '#FF6666'
            },
            {
              offset: 1, color: '#FF6633' // 100% 处的颜色
            }],
          global: true // 缺省为 false
        }
      }
    },
    axisLine: {
      lineStyle: {
        width: 14,
      }
    },
    axisTick: {
      show: false
    },
    splitLine: {
      length: 5,
      distance: 5,
      lineStyle: {
        width: 1,
        color: '#999'
      }
    },
    axisLabel: {
      distance: 65,
      color: '#999',
      fontSize: 10,
      show: false
    },
    anchor: {
      show: false,
    },
    title: {
      show: false,
    },
    detail: {
      valueAnimation: true,
      fontSize: 16,
      offsetCenter: [0, '60%'],
      color: 'auto',
    },
    data: [{
      value: 70
    }]
  }],
};


function initCircleChart() {
  circleData.forEach((item, index) => {
    chartCirleDom.push(document.getElementById(item.domId));
    myChartCircle.push(echarts.init(chartCirleDom[index]));
    chartCircleOptions.push({
      ...chartOption,
      title: {
        ...chartOption.title,
        text: item.title,
      },
      series: [{
        ...chartOption.series[0],
        data: [{
          value: item.value
        }]
      }]
    });
    myChartCircle[index].setOption(chartCircleOptions[index]);
    totalNum += item.value;
  });
  // 今日总量
  $('#total').html(`${totalNum}KW·h`);
}


/*
* chart4
* */
const chartDom4 = document.getElementById('chart4');
const myChart4 = echarts.init(chartDom4);
let option4;
option4 = {
  title: {
    text: '各时段用电统计',
    textStyle: {
      fontSize: nowSize(18),
      color: '#fff'
    },
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    show: false,
  },
  legend: {
    data: ['2019', '2020'],
    top: 'bottom',
    bottom: nowSize(10),
    textStyle: {
      color: '#aaa',
      fontSize: nowSize(12)
    }
  },
  toolbox: {
    show: false
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '13%',
    top: '15%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        color: '#aaa'
      },
      data: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',]
    }
  ],
  yAxis: [
    {
      name: 'kw·h',
      type: 'value',
      nameTextStyle: {
        color: '#aaa'
      },
      axisLabel: {
        color: '#aaa'
      },
    }
  ],
  series: [
    {
      name: '2019',
      type: 'line',
      stack: '总量',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [180, 202, 181, 224, 290, 340, 310, 300, 335, 327, 307, 326, 310, 290, 298, 300, 300, 278, 260, 250, 223, 210, 198, 176]
    },
    {
      name: '2020',
      type: 'line',
      stack: '总量',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [220, 212, 191, 234, 280, 330, 320, 340, 355, 347, 347, 336, 330, 310, 321, 310, 310, 290, 280, 267, 230, 220, 200, 190]
    },
  ]
};

option4 && myChart4.setOption(option4);

/*
* viewMap
* */
const chartViewMap = document.getElementById('viewMap');
const myChartViewMap = echarts.init(chartViewMap);
let optionViewMap;
optionViewMap = {
  title: {
    text: '能耗参考值 kw·h',
    textStyle: {
      fontSize: nowSize(14),
      color: '#aaa'
    },
    left: 'center',
    bottom: '30%'
  },
  visualMap: {
    orient: 'horizontal',
    left: 'center',
    top: 'bottom',
    min: 0,
    max: 600,
    text: ['High', 'Low'],
    textStyle: {
      color: '#fff',
      fontSize: nowSize(16)
    },
    dimension: 0,
    itemWidth: nowSize(10),
    itemHeight: nowSize(350),
    inRange: {
      color: ['#5373E0', '#F9ECB7', '#EE2632']
    }
  },
};

optionViewMap && myChartViewMap.setOption(optionViewMap);

/*
* chart5
* */
const chartDom5 = document.getElementById('chart5');
const myChart5 = echarts.init(chartDom5);
let option5;
option5 = {
  title: {
    text: '今日区域用电分类',
    left: 'center',
    top: '2%',
    textStyle: {
      color: '#fff',
      fontSize: nowSize(16)
    }
  },
  tooltip: {
    show: false,
  },
  legend: {
    orient: 'vertical',
    left: 'right',
    top: 'center',
    textStyle: {
      fontSize: nowSize(12),
      color: '#aaa'
    }
  },
  series: [
    {
      name: '',
      type: 'pie',
      radius: '70%',
      label: {
        color: '#aaa',
        fontSize: nowSize(14)
      },
      data: [
        { value: 948, name: '公区' },
        { value: 435, name: '租区' },
        { value: 880, name: '自用区' },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 0,
          shadowOffsetX: 0,
        }
      }
    }
  ]
};

option5 && myChart5.setOption(option5);

/*
* 数据滚动
* */
let circleInterval = null;
let todayInterval = null;
clearInterval(circleInterval);
clearInterval(todayInterval);
circleInterval = setInterval(() => {
  let totalNum = 0;
  chartCircleOptions.forEach((item, index) => {
    item.series[0].data[0].value += Math.round(5 * Math.random());
    myChartCircle[index].setOption(chartCircleOptions[index]);
    totalNum += item.series[0].data[0].value;
  });
  // 今日总量
  $('#total').html(`${totalNum}KW·h`);
}, 5000);

todayInterval = setInterval(() => {
  let temp = [];
  option3.series[0].data.forEach((item, index) => {
    temp[index] = item + Math.round(50 * Math.random());
  });
  option3.series[0].data = temp;
  myChart3.setOption(option3);
}, 6000);

/*
*  clockSet
* */

$(function () {
  initTimer();
  initCircleChart();
  getAccessToken();
  $().timelinr();
  // initBIMInfo();
  $('.clockSet').click(function () {
    const colors = $(this).data().set;
    if (colors) {
      overrideComponents(colorsMap[colors]);
    }
  });
});
