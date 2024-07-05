import PaperclipIcon from '@/icons/Paperclip';
import PlayIcon from '@/icons/Play';
import { MessageType, MetaType } from '@/types';
import { cn } from '@/utils/classnames';
import days from '@/utils/days';
import { get_file_type } from '@/utils/file';
import React, { useMemo } from 'react';

export interface BubbleProps extends MessageType {
  primary?: boolean;
}

const MediaPreview: React.FC<MetaType> = (meta) => {
  const type = get_file_type(meta.mine);

  if (meta.percentage && meta.percentage < 100) {
    return (
      <div className="w-52 h-24 flex items-center justify-center text-sm">
        {meta.percentage}%...
      </div>
    );
  }

  let dom = <></>;

  switch (type) {
    case 'image':
      return (
        <a className="block" href={meta.url} data-fancybox>
          <img className="w-full h-auto" src={meta.url} alt={meta.name} />
        </a>
      );
    case 'video':
      return (
        <a className="block relative text-4xl" href={meta.url} data-fancybox>
          <video src={meta.url} title={meta.name} />
          <span className="absolute z-10 flex items-center justify-center text-4xl inset-0">
            <PlayIcon />
          </span>
        </a>
      );
    default:
      return (
        <a
          href={meta.url}
          download={meta.name}
          className="flex items-center gap-1 p-3 hover:text-blue-600"
        >
          <span className="text-sm">
            <PaperclipIcon />
          </span>
          <span className="break-all">{meta.name}</span>
        </a>
      );
  }
};

const Bubble: React.FC<BubbleProps> = (props) => {
  const dom = useMemo(() => {
    switch (props.type) {
      case 'TEXT':
        return props.content;
      case 'MEDIA':
        return <MediaPreview {...props.meta} />;
      default:
        return <>未知消息类型</>;
    }
  }, [props]);

  return (
    <div
      className={cn(
        'w-full flex flex-col',
        props.primary ? 'items-end' : 'items-start',
      )}
    >
      <div
        className={cn(
          'break-all inline-flex rounded-xl max-w-[90%] overflow-hidden ring-1',
          props.type === 'MEDIA'
            ? 'sm:max-w-sm'
            : 'sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[55%] p-3',
          props.primary
            ? 'rounded-br-none bg-primary text-primary-foreground ring-primary'
            : 'rounded-bl-none bg-slate-100 text-slate-950 ring-slate-100',
        )}
      >
        <div className="text-sm [&>*]:max-w-full">{dom}</div>
      </div>
      <span className="text-xs/7 text-slate-300">
        {days(props.time).format('HH:mm')}
      </span>
    </div>
  );
};

export default Bubble;
