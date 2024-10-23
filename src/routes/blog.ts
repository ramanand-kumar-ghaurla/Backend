import { Context, Hono, Next } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verifyUser } from "./user";

 export const blogRoute = new Hono<{
    Bindings:{
        DATABASE_URL: string,
        
    },
    Variables:{
        userId:string
    }
}>()

blogRoute.use('/*',verifyUser)

blogRoute.post('writeBlog', async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
      }).$extends(withAccelerate())

     try {
         const {title, content, tag,} = await c.req.json()
         const userId = c.get('userId')
         
         if(!title && !content && !tag) return c.text('These fields are required',402)
   
           const blog = await prisma.blog.create({
               data:{
                   title:title,
                   content:content,
                   tag:tag,
                   authorId:userId
               }
           })
   
           
   
         return c.json({
           success:true,
           data:blog,
           message:'blog subbmited successfully',
           statusCode:200
         })
     } catch (error) {
        
        console.log(error)
        c.text('error in creating blog',500)
     }
})

