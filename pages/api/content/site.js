import dbConnect from '../../lib/mongodb'
import Site from '../../models/Site'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
function requireAuth(req){
  const cookies = cookie.parse(req.headers.cookie||'')
  const token = cookies.sb_access
  if(!token) throw new Error('Unauthorized')
  return jwt.verify(token, ACCESS_SECRET)
}
export default async function handler(req,res){
  await dbConnect()
  if(req.method==='GET'){ const site = await Site.findOne(); return res.status(200).json(site||{}) }
  if(req.method==='POST'){ try{ requireAuth(req) }catch(e){ return res.status(401).json({ error: 'Unauthorized' }) } const body = req.body; let site = await Site.findOne(); if(!site) site = new Site(body); else Object.assign(site, body); await site.save(); return res.status(200).json(site) }
  res.status(405).end()
}
