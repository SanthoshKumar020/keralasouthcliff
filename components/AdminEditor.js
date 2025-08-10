'use client'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

function TipTap({ value, onChange }){
  const editor = useEditor({ extensions: [StarterKit, ImageExtension], content: value||'<p></p>', onUpdate: ({editor})=>onChange(editor.getHTML()) })
  return <EditorContent editor={editor} />
}

export default function AdminEditor(){
  const [site, setSite] = useState({ name:'', description:'', gallery:[], rooms:[] })
  const [loading, setLoading] = useState(true)
  const [src, setSrc] = useState(null)
  const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 16/9 })
  const imgRef = useRef(null)

  useEffect(()=>{ fetchSite() },[])
  async function fetchSite(){ const res = await axios.get('/api/content/site'); setSite(res.data||{}); setLoading(false) }

  async function saveSite(updatedSite){
    try{ await axios.post('/api/content/site', updatedSite) }catch(e){ console.error('save failed', e) }
  }

  async function save(){ await saveSite(site); alert('Saved') }

  function onDragEnd(result){
    if(!result.destination) return
    const items = Array.from(site.gallery || [])
    const [moved] = items.splice(result.source.index,1)
    items.splice(result.destination.index,0,moved)
    const newSite = {...site, gallery: items}
    setSite(newSite)
    // auto-save order
    saveSite(newSite)
  }

  function handleFileSelect(e){
    const file = e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = () => setSrc(reader.result)
    reader.readAsDataURL(file)
  }

  // create cropped blob from canvas
  function getCroppedImg(){ return new Promise((resolve, reject)=>{
    const image = imgRef.current
    if(!image) return reject('No image ref')
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const pixelCrop = {
      x: (crop.x || 0) * scaleX / 100,
      y: (crop.y || 0) * scaleY / 100,
      width: (crop.width || 0) * scaleX / 100,
      height: (crop.height || 0) * scaleY / 100
    }
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => {
      resolve(blob)
    }, 'image/jpeg', 0.95)
  }) }

  async function uploadCropped(){
    try{
      const blob = await getCroppedImg()
      const form = new FormData()
      form.append('file', blob, 'cropped.jpg')
      const res = await axios.post('/api/upload-cropped', form, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: e => console.log('progress', Math.round((e.loaded*100)/e.total)) })
      const url = res.data.url
      setSite(s=>({...s, gallery: [...(s.gallery||[]), url]}))
      // auto-save after successful upload
      await saveSite({...site, gallery: [...(site.gallery||[]), url]})
      setSrc(null)
    }catch(e){ console.error('upload failed', e); alert('Upload failed') }
  }

  if(loading) return <div>Loading...</div>
  return (
    <div className="space-y-4">
      <input className="w-full p-2 border" value={site.name||''} onChange={e=>setSite({...site, name:e.target.value})} />

      <div className="border p-2"><TipTap value={site.description} onChange={(val)=>setSite({...site, description:val})} /></div>

      <div>
        <h3>Upload & Crop</h3>
        <input type="file" accept="image/*" onChange={handleFileSelect} />
        {src && (
          <div>
            <ReactCrop crop={crop} onChange={(c)=>setCrop(c)}>
              <img ref={imgRef} src={src} alt="Source" style={{ maxWidth: '100%' }} />
            </ReactCrop>
            <div className="mt-2">
              <button onClick={uploadCropped} className="px-3 py-1 bg-blue-600 text-white rounded">Upload cropped</button>
              <button onClick={()=>setSrc(null)} className="ml-2 px-3 py-1 border rounded">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3>Gallery (drag to reorder)</h3>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="gallery" direction="horizontal">
            {(provided)=>(
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-2 mt-3 overflow-auto">
                { (site.gallery||[]).map((g,i)=>(
                  <Draggable key={g} draggableId={g} index={i}>
                    {(p)=>(
                      <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="w-40 h-28 relative rounded overflow-hidden border">
                        <img src={g} className="w-full h-full object-cover" />
                        <button onClick={async ()=>{ const newGallery = site.gallery.filter((_,idx)=>idx!==i); setSite({...site, gallery: newGallery}); await saveSite({...site, gallery: newGallery}) }} className="absolute top-1 right-1 bg-white/80 rounded px-1">X</button>
                      </div>
                    )}
                  </Draggable>
                )) }
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div>
        <h3>Rooms</h3>
        { (site.rooms||[]).map((r,idx)=>(
          <div key={idx} className="p-2 border rounded mb-2">
            <input className="w-full p-1 border mb-1" value={r.title||''} onChange={e=>{ const rooms=[...site.rooms]; rooms[idx].title=e.target.value; setSite({...site, rooms}) }} />
            <textarea className="w-full p-1 border mb-1" value={r.description||''} onChange={e=>{ const rooms=[...site.rooms]; rooms[idx].description=e.target.value; setSite({...site, rooms}) }} />
            <input className="w-full p-1 border" placeholder="Image URL" value={r.image||''} onChange={e=>{ const rooms=[...site.rooms]; rooms[idx].image=e.target.value; setSite({...site, rooms}) }} />
          </div>
        )) }
        <button onClick={()=>setSite(s=>({...s, rooms:[...(s.rooms||[]), { title:'New Room', description:'', image:'' }]}))} className="px-3 py-1 bg-black text-white rounded">Add room</button>
      </div>

      <div><button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Save</button></div>
    </div>
  )
}
