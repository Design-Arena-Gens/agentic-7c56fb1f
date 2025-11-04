"use client";

import { useEffect, useState } from 'react';
import { useMqtt } from './MqttProvider';
import clsx from 'classnames';

export function ToggleCard({
  title,
  stateTopic,
  setTopic,
  onLabel = 'Encendido',
  offLabel = 'Apagado',
}: {
  title: string;
  stateTopic: string;
  setTopic: string;
  onLabel?: string;
  offLabel?: string;
}) {
  const { subscribe, publish } = useMqtt();
  const [on, setOn] = useState<boolean>(false);

  useEffect(() => {
    const off = subscribe(stateTopic, (payload) => setOn(payload === 'ON' || payload === 'ARMED'));
    return off;
  }, [subscribe, stateTopic]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    publish(setTopic, next ? 'ON' : 'OFF');
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-500 text-sm">{title}</div>
          <div className="mt-1 text-xl font-semibold">{on ? onLabel : offLabel}</div>
        </div>
        <button
          onClick={toggle}
          className={clsx(
            'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
            on ? 'bg-emerald-500' : 'bg-slate-300'
          )}
          aria-pressed={on}
        >
          <span
            className={clsx(
              'inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform',
              on ? 'translate-x-7' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    </div>
  );
}
