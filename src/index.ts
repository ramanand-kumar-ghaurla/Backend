import { Hono } from 'hono'
import {userRoute} from './routes/user'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'



const app = new Hono<{
  Bindings:{
    DATABASE_URL: string
  }
}>()

app.route('/api/v1/user', userRoute)


app.get('/', (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  
  }).$extends(withAccelerate())

  return c.text('Hello kfhsf!')
})



export default app
