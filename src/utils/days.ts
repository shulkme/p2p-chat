import dayjs from 'dayjs';
import zh_cn from 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale(zh_cn);
dayjs.extend(relativeTime);

const days = dayjs;

export default days;
