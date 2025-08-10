import { createUploadthing } from 'uploadthing/server'
import dbConnect from '../../../lib/mongodb'
import Site from '../../../models/Site'
const f = createUploadthing()

export const uploadRouter = {
  image: f(['image']).onUploadComplete(async ({ metadata, file }) => {
    try{
      await dbConnect()
      const site = await Site.findOne() || new Site({})
      if(metadata && metadata.saveTo === 'gallery'){
        site.gallery = site.gallery || []
        site.gallery.push(file.url)
        await site.save()
      }else if(metadata && metadata.saveTo === 'room' && metadata.roomIndex !== undefined){
        site.rooms = site.rooms || []
        const idx = Number(metadata.roomIndex)
        if(!site.rooms[idx]) site.rooms[idx] = { title:'', description:'', image: file.url }
        else site.rooms[idx].image = file.url
        await site.save()
      }
    }catch(e){ console.error('Persist upload error', e) }
    return { url: file.url }
  }),
}

export type UploadRouter = typeof uploadRouter
