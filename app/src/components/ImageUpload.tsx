import { useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, firebaseReady } from '../firebase';
import { useApp } from '../store';

interface Props {
  id: string;
  value: string | null;
  placeholder: string;
  onChange: (url: string) => void;
  height?: number | string;
}

// Replaces the prototype's <image-slot> web component with a real uploader:
// click or drag a photo in, it lands in Firebase Storage (or a local data URL
// in guest mode) and the resulting URL is handed back to the caller.
export function ImageUpload({ id, value, placeholder, onChange, height }: Props) {
  const uid = useApp(s => s.uid);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      if (firebaseReady && storage) {
        const path = `uploads/${uid ?? 'guest'}/${id}-${Date.now()}-${file.name}`;
        const r = ref(storage, path);
        await uploadBytes(r, file);
        const url = await getDownloadURL(r);
        onChange(url);
      } else {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        onChange(dataUrl);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) void handleFile(f);
      }}
      style={{
        width: '100%', height: height ?? '100%', cursor: 'pointer', position: 'relative',
        background: value ? `#000 url(${JSON.stringify(value).slice(1, -1)}) center/cover no-repeat` : '#f0ece6',
        display: 'grid', placeItems: 'center', outline: dragOver ? '2px dashed #fa8317' : 'none',
        outlineOffset: -2,
      }}
    >
      <input
        ref={inputRef} type="file" accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.currentTarget.value = ''; }}
      />
      {!value && !busy && (
        <span style={{ font: "600 8px/1 'Archivo',sans-serif", letterSpacing: '.08em', color: '#8f8b85', textAlign: 'center', padding: 4 }}>
          {placeholder.toUpperCase()}
        </span>
      )}
      {busy && (
        <span style={{ font: "600 8px/1 'Archivo',sans-serif", letterSpacing: '.08em', color: '#fa8317' }}>…</span>
      )}
    </div>
  );
}
