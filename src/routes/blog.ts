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
         const {title, content, tag} = await c.req.json()
         const userId = c.get('userId')
         
         if(!title && !content && tag ) return c.text('These fields are required',402)
   
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

blogRoute.post('/updateBlog/:blogId', async(c)=>{
    
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
      }).$extends(withAccelerate())

    try {
        const blogId = await c.req.param('blogId')

        console.log(blogId, 'blog')

       
        if(!blogId) return c.text('invalid blog',402)
    
            const userId = await c.get('userId')
        const {content, title} = await c.req.json()
     
        console.log('come')
        if(!(title || content)) return c.text('please provide at least one field to update',402)
    
    
            const updateBlog = await prisma.blog.update({
                where:{
                    id : blogId,
                 AND:[
                    {authorId: userId}
                   ]
                    
                },
                data:{
                    title:title || undefined,
                    content: content || undefined
                },
                include:{
                    author:true,
                    likes:true,
                    comments:true
                }
            })

            if(!updateBlog) return c.text('blog dost not exists with this blogId and UserId',401)
                

                return c.json({
                    success:true,
                    data:updateBlog,
                    message:'blog subbmited successfully',
                    statusCode:200
                  })
    
    } catch (error) {
        
        console.log(error)
        return c.text('error in updating blog ', 500)
    }

   } )

    blogRoute.get('/getBlog/:blogId', async (c)=>{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
          }).$extends(withAccelerate())

         try {
             const userId = c.get('userId')
             const blogId = await c.req.param('blogId')
   
             if(!blogId) return c.text('invalid blog',402)
   
            const blog = await prisma.blog.findFirst({
               where:{
                   id: blogId
               },
               
            })   
             
             
            if(!blog) return c.text('no blog exists with this ID',401)
   
               return c.json({
                   success:true,
                   data:blog,
                   message:'blog fetched successfully',
                   statusCode:200
               })
         } catch (error) {
            
            console.log(error)
            c.text('error in fetching blog', 500)
         }
   })

   blogRoute.delete('/deleteBlog/:blogId', async(c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
      }).$extends(withAccelerate())

   try {
     const blogId = c.req.param('blogId')
     const userId = c.get('userId')
 
     const deletedBlog = await prisma.blog.delete({
         where:{
             id : blogId,
             AND:{authorId:userId}
         }
         
     })
 
     return c.text('blog deleted successfully',200)
   } catch (error) {
    
    console.log(error)
    c.text('error in deleting blog')
   }


   })
