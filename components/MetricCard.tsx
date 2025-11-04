"use client";

import { useEffect, useState } from 'react';
import { useMqtt } from './MqttProvider';

export function MetricCard({ title, topic, unit }: { title: string; topic: string; unit?: string }) {
  const { subscribe } = useMqtt();
  const [value, setValue] = useState<string>('?');

  useEffect(() => {
    const off = subscribe(topic, (payload) => setValue(payload));
    return off;
  }, [subscribe, topic]);

  return (
    <div className="card">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="mt-1 text-3xl font-semibold">
        {value}
        {unit ? <span className="text-base font-normal text-slate-500 ml-1">{unit}</span> : null}
      </div>
    </div>
  );
}
