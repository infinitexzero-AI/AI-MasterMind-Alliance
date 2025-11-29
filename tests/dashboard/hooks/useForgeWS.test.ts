/**
 * Hook test: we will shallow render a component that uses useForgeWS and mock WebSocket in global.
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useForgeWS } from '../../../dashboard/components/hooks/useForgeWS';

class MockWS {
  onopen: any = null;
  onmessage: any = null;
  onerror: any = null;
  onclose: any = null;
  readyState = 1;
  send = jest.fn();
  close = jest.fn();
  constructor(url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen({} as any);
    }, 10);
  }
}

(global as any).WebSocket = MockWS;

test('useForgeWS connects and can send', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useForgeWS('/api/forge/ws'));
  // wait for onopen
  await new Promise((r) => setTimeout(r, 20));
  expect(result.current.connected).toBe(true);
  const ok = result.current.send({ foo: 'bar' });
  expect(ok).toBe(true);
});
