import { useState } from 'react';
import { uploadSpec } from '../api/spec';

export default function UploadSpec({ onUploaded }) {
    const [file, setFile] = useState(null);
    const [config, setConfig] = useState('edexcel-ial-physics'); // change per board
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    async function handleUpload(e) {
        e.preventDefault();
        if (!file) return;
        setLoading(true); setMsg('');
        try {
            const res = await uploadSpec({ file, config });
            setMsg(`Uploaded ✓ Sections: ${res.sections}`);
            onUploaded?.(config);
        } catch (err) {
            setMsg(err?.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card">
            <h2 className="text-xl font-semibold mb-2">Upload specification PDF</h2>
            <form onSubmit={handleUpload} className="flex gap-3 items-center">
                <select className="select w-56 rounded-md p-2 text-center" value={config} onChange={e=>setConfig(e.target.value)}>
                    <option value="edexcel-ial-physics">Edexcel</option>
                    <option value="cambridge-alevel-cs">Cambridge</option>
                    {/* add more configs here */}
                </select>
                <input type="file" className="input" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0])}/>
                <button className="btn" disabled={loading || !file}>{loading ? 'Uploading…' : 'Upload'}</button>
            </form>
            {!!msg && <p className="text-sm mt-2">{msg}</p>}
        </div>
    );
}
