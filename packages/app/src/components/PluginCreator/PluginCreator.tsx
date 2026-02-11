import React, { useState } from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

type Props = {
  onCreated?: () => void;
};

export default function PluginCreator({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const configApi = useApi(configApiRef);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('creating');
    try {
      const backendBaseUrl = configApi.getString('backend.baseUrl');
      const resp = await fetch(`${backendBaseUrl}/api/plugin-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const contentType = resp.headers.get('content-type') || '';
      const raw = await resp.text();
      const data = contentType.includes('application/json')
        ? (() => {
            try {
              return JSON.parse(raw);
            } catch {
              return undefined;
            }
          })()
        : undefined;

      if (!resp.ok) {
        const msg =
          (data as any)?.message ||
          (raw && raw.trim().startsWith('<')
            ? `Server returned HTML (${resp.status}). Is the backend route '/api/plugin-create' registered?`
            : raw || `Request failed (${resp.status})`);
        throw new Error(msg);
      }

      setStatus('done: ' + ((data as any)?.message || 'Plugin created'));
      setName('');
      // Give the filesystem a moment to reflect the new plugin
      setTimeout(() => {
        onCreated?.();
      }, 1000);
    } catch (err: any) {
      setStatus('error: ' + (err.message || String(err)));
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h3>Create a plugin</h3>
      <p>Enter a plugin id/name and click Create. The backend must expose <code>/api/plugin-create</code>.</p>
      <p><strong>Note:</strong> <i>you must need to perform <code>yarn install</code> and restart the app after creating the plugin.</i></p>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="my-plugin"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button type="submit">Create</button>
        </div>
      </form>
      <div style={{ marginTop: 8 }}>
        <strong>Status:</strong> {status ?? 'idle'}
      </div>
    </div>
  );
}
