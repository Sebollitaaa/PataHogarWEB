import { useRef } from 'react';
import { CameraIcon, XIcon } from './icons/Icons';
import './photo-picker.css';

const MAX_PHOTOS = 10;

export default function PhotoPicker({ files, onChange }) {
  const inputRef = useRef(null);

  function handleSelect(e) {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected].slice(0, MAX_PHOTOS);
    onChange(combined);
    e.target.value = '';
  }

  function removeAt(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="photo-picker">
      <div className="photo-picker__grid">
        {files.map((file, i) => (
          <div key={i} className="photo-picker__item">
            <img src={URL.createObjectURL(file)} alt="" />
            <button type="button" onClick={() => removeAt(i)} aria-label="Quitar foto"><XIcon size={14} /></button>
          </div>
        ))}
        {files.length < MAX_PHOTOS && (
          <button type="button" className="photo-picker__add" onClick={() => inputRef.current.click()}>
            <CameraIcon size={22} />
            <span>Agregar foto</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef} type="file" accept="image/*" multiple hidden
        onChange={handleSelect}
      />
      <p className="field-hint">{files.length}/{MAX_PHOTOS} fotos · la primera va a ser la portada</p>
    </div>
  );
}
