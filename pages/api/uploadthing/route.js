import { createRouteHandler } from 'uploadthing/next-legacy'
import { uploadRouter } from './core'
export default createRouteHandler({ router: uploadRouter })
