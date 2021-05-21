const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** @class */
export default class DateHelper {
  /**
   * @returns {string} The current time in "ddd MMM D HH:mm:ss UTC YYYY" format.
   */
  static getNowString() {
    const now = new Date();

    const weekDay = weekNames[now.getUTCDay()];
    const month = monthNames[now.getUTCMonth()];
    const day = now.getUTCDate();

    let hours = now.getUTCHours();
    let strHours, strMinutes, strSeconds;
    if (hours < 10) {
      strHours = `0${hours}`;
    } else {
      strHours = `${hours}`;
    }

    let minutes = now.getUTCMinutes();
    if (minutes < 10) {
      strMinutes = `0${minutes}`;
    } else {
      strMinutes = `${minutes}`;
    }

    let seconds = now.getUTCSeconds();
    if (seconds < 10) {
      strSeconds = `0${seconds}`;
    } else {
      strSeconds = `${seconds}`;
    }

    const year = now.getUTCFullYear();

    // ddd MMM D HH:mm:ss UTC YYYY
    const dateNow = `${weekDay} ${month} ${day} ${strHours}:${strMinutes}:${strSeconds} UTC ${year}`;

    return dateNow;
  }
}
