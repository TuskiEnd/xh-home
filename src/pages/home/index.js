import './index.scss';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

$(function () {
  // 日期
  dayjs.extend(isoWeek);
  const weekText = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  let timer = null;
  $('#date').html(dayjs().format('YYYY/MM/DD'));
  $('#week').html(weekText[dayjs().isoWeekday()]);
  clearInterval(timer);
  timer = setInterval(() => {
    $('#time').html(dayjs().format('HH:MM:ss'));
  }, 1000);
});
