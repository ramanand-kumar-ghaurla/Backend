import { Hono } from 'hono'
import {userRoute} from './routes/user'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { blogRoute } from './routes/blog'




const app = new Hono<{
  Bindings:{
    DATABASE_URL: string
  }
}>()

app.route('/api/v1/user', userRoute)
app.route('/api/v1/blog', blogRoute)


app.get('/', (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  
  }).$extends(withAccelerate())

  return c.text("hello users")
})



export default app
