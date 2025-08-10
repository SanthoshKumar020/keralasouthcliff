import formidable from 'formidable'
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'
import dbConnect from '../../lib/mongodb'
import Site from '../../models/Site'

export const config = { api: { bodyParser: false } }

async function uploadToUploadThing(buffer, filename, mimetype){
  const form = new FormData()
  form.append('file', buffer, { filename, contentType: mimetype })
  const res = await fetch('https://uploadthing.com/api/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.UPLOADTHING_TOKEN}` },
    body: form
  })
  if(!res.ok) throw new Error('UploadThing upload failed: ' + res.statusText)
  const json = await res.json()
  // Attempt to read URL
  const url = json?.url || json?.data?.url || (json?.files && json.files[0] && json.files[0].url)
  return { ok: true, url, raw: json }
}

async function uploadToCloudinary(buffer, filename){
  if(!process.env.CLOUDINARY_CLOUD_NAME) throw new Error('No cloudinary configured')
  // unsigned upload using api key requires using signature; here we use upload API with basic auth
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const form = new FormData()
  form.append('file', buffer.toString('base64'))
  form.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
    headers: { Authorization: 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64') }
  })
  if(!res.ok) throw new Error('Cloudinary upload failed: ' + res.statusText)
  const json = await res.json()
  return { ok: true, url: json.secure_url, raw: json }
}

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if(err) return res.status(500).json({ error: 'Form parse error' })
    try{
      const file = files.file
      if(!file) return res.status(400).json({ error: 'No file' })
      const buffer = fs.readFileSync(file.filepath)
      // try UploadThing
      try{
        const r = await uploadToUploadThing(buffer, file.originalFilename, file.mimetype)
        const url = r.url || (r.raw && r.raw.files && r.raw.files[0] && r.raw.files[0].url)
        await dbConnect()
        const site = await Site.findOne() || new Site({})
        site.gallery = site.gallery || []
        site.gallery.push(url)
        await site.save()
        return res.status(200).json({ url, raw: r.raw })
      }catch(e){
        console.error('UploadThing failed, falling back to Cloudinary', e.message)
        try{
          const c = await uploadToCloudinary(buffer, file.originalFilename)
          const url = c.url
          await dbConnect()
          const site = await Site.findOne() || new Site({})
          site.gallery = site.gallery || []
          site.gallery.push(url)
          await site.save()
          return res.status(200).json({ url, raw: c.raw })
        }catch(err){
          console.error('Cloudinary failed', err)
          return res.status(500).json({ error: 'Both upload providers failed', detail: String(err) })
        }
      }
    }catch(e){
      console.error(e)
      return res.status(500).json({ error: 'Upload failed', detail: String(e) })
    }
  })
}
