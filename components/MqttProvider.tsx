"use client";

import { Client, Message } from 'paho-mqtt';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createMockIoT } from '../lib/mockData';

export type MqttContextValue = {
  connected: boolean;
  useMock: boolean;
  subscribe: (topic: string, handler: (payload: string) => void) => () => void;
  publish: (topic: string, payload: string) => void;
};

const MqttContext = createContext<MqttContextValue | null>(null);

function makeClientId() {
  return `webclient_${Math.random().toString(16).slice(2)}`;
}

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const url = process.env.NEXT_PUBLIC_MQTT_URL;
  const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
  const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

  const shouldUseMock = !url;
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const mock = useMemo(() => createMockIoT(), []);

  useEffect(() => {
    if (shouldUseMock) {
      setConnected(true);
      return;
    }
    try {
      const parsed = new URL(url as string);
      const client = new Client(parsed.host, Number(parsed.port || (parsed.protocol === 'wss:' ? 443 : 80)), parsed.pathname.replace(/^\//, '') || '/mqtt', makeClientId());
      clientRef.current = client;
      client.onConnectionLost = () => setConnected(false);
      client.onMessageArrived = (message) => {
        // Dispatch to mock bus so subscribers get messages uniformly
        mock.emit(message.destinationName, message.payloadString ?? '');
      };
      client.connect({
        useSSL: parsed.protocol === 'wss:',
        userName: username || undefined,
        password: password || undefined,
        onSuccess: () => setConnected(true),
        onFailure: () => setConnected(false),
      });
    } catch (e) {
      setConnected(false);
    }
    return () => {
      try {
        clientRef.current?.disconnect();
      } catch {}
    };
  }, [shouldUseMock, url, username, password, mock]);

  const subscribe = useCallback((topic: string, handler: (payload: string) => void) => {
    const off = mock.on(topic, handler);
    if (!shouldUseMock && clientRef.current && connected) {
      try {
        clientRef.current.subscribe(topic);
      } catch {}
    }
    return () => {
      off();
      if (!shouldUseMock && clientRef.current && connected) {
        try {
          clientRef.current.unsubscribe(topic);
        } catch {}
      }
    };
  }, [connected, shouldUseMock, mock]);

  const publish = useCallback((topic: string, payload: string) => {
    if (!shouldUseMock && clientRef.current && connected) {
      const message = new Message(payload);
      message.destinationName = topic;
      clientRef.current.send(message);
    }
    mock.emit(topic, payload);
  }, [connected, shouldUseMock, mock]);

  const value: MqttContextValue = useMemo(() => ({ connected, useMock: shouldUseMock, subscribe, publish }), [connected, shouldUseMock, subscribe, publish]);

  return (
    <MqttContext.Provider value={value}>{children}</MqttContext.Provider>
  );
}

export function useMqtt() {
  const ctx = useContext(MqttContext);
  if (!ctx) throw new Error('useMqtt must be used within MqttProvider');
  return ctx;
}
