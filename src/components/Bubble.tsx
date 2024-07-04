import { MessageType } from '@/types';
import { cn } from '@/utils/classnames';
import React, { useMemo } from 'react';

export interface BubbleProps extends MessageType {
  primary?: boolean;
}

const Bubble: React.FC<BubbleProps> = (props) => {
  const dom = useMemo(() => {
    switch (props.type) {
      case 'TEXT':
        return props.content;
      case 'MEDIA':
        return <>file</>;
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
      <div className="self-center py-4">
        <span className="text-xs text-slate-400 leading-relaxed">刚刚</span>
      </div>
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
        <div className="text-sm [&>img]:max-w-full [&>img]:h-auto">{dom}</div>
      </div>
    </div>
  );
};

export default Bubble;
