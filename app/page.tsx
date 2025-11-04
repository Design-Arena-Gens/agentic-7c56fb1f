"use client";

import { MqttProvider, useMqtt } from '../components/MqttProvider';
import { MetricCard } from '../components/MetricCard';
import { ToggleCard } from '../components/ToggleCard';
import { EnergyChart } from '../components/EnergyChart';
import { ShieldCheckIcon, ShieldExclamationIcon, WifiIcon } from '@heroicons/react/24/outline';

function ConnectionBadge() {
  const { connected, useMock } = useMqtt();
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <WifiIcon className={`h-4 w-4 ${connected ? 'text-emerald-500' : 'text-slate-400'}`} />
      {connected ? 'Conectado' : 'Desconectado'}
      <span className="text-slate-400">{useMock ? '(Simulado)' : ''}</span>
    </div>
  );
}

function SecurityCard() {
  const { subscribe, publish } = useMqtt();
  const [armed, setArmed] = React.useState(false);
  React.useEffect(() => {
    const off = subscribe('home/security/alarm', (p) => setArmed(p === 'ARMED'));
    return off;
  }, [subscribe]);
  const toggle = () => publish('home/security/alarm/set', armed ? 'DISARM' : 'ARM');
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {armed ? (
            <ShieldExclamationIcon className="h-8 w-8 text-amber-500" />
          ) : (
            <ShieldCheckIcon className="h-8 w-8 text-emerald-500" />
          )}
          <div>
            <div className="text-slate-500 text-sm">Seguridad</div>
            <div className="mt-1 text-xl font-semibold">{armed ? 'Alarma activada' : 'Alarma desactivada'}</div>
          </div>
        </div>
        <button
          onClick={toggle}
          className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50 text-sm"
        >
          {armed ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <MqttProvider>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-slate-700">Bienvenido a tu hogar inteligente</div>
        <ConnectionBadge />
      </div>

      <div className="container-grid">
        <div className="col-span-12 md:col-span-3">
          <MetricCard title="Temperatura" topic="home/telemetry/temperature" unit="?C" />
        </div>
        <div className="col-span-12 md:col-span-3">
          <MetricCard title="Humedad" topic="home/telemetry/humidity" unit="%" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <EnergyChart />
        </div>

        <div className="col-span-12 md:col-span-3">
          <ToggleCard title="Luz sala" stateTopic="home/lights/sala" setTopic="home/lights/sala/set" />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ToggleCard title="Luz cocina" stateTopic="home/lights/cocina" setTopic="home/lights/cocina/set" />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ToggleCard title="Luz dormitorio" stateTopic="home/lights/dormitorio" setTopic="home/lights/dormitorio/set" />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ToggleCard title="Luz estudio" stateTopic="home/lights/estudio" setTopic="home/lights/estudio/set" />
        </div>

        <div className="col-span-12">
          <SecurityCard />
        </div>
      </div>
    </MqttProvider>
  );
}
