import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

import { jwt,decode,verify,sign} from "hono/jwt";



export const userRoute = new Hono<{
    Bindings:{
        DATABASE_URL: string,
        JWT_SECRET:string,
        
    }
}>()



userRoute.post('/register',async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    
    /**
     * fetch the details
     * if any require field missing throw error
     * check if the user already exists
     * make entry in database
     * return resposnse
     */

    try {

         const {username,email,password} = await c.req.json()

         if(!username && !password && !email){
             c.status(403)
             return c.text("all fields are required");
              }
       
              

              const alreadyExistUser = await prisma.user.findFirst({
                where:{
                   OR:[
                    {username:username},
                    {email:email}
                   ]
                }
              })
        if(alreadyExistUser){
            c.status(411)
            return c.text(`User with this ${email} or ${username} already exists`);
             }

        const user= await prisma.user.create({
          data:{
            username:username,
            email:email,
            password:password
          }
         })

         const jwt = await sign({
          id:user.id,
          username:user.username,
          role:user.role,
          exp: Math.floor(Date.now()/1000)+60*5
         }, c.env.JWT_SECRET)

         console.log(user)
         return c.json({
          success:true,
          data:{username: user.username, email:user.email,id:user.id, accessToken:jwt},
          message:'user created successfully'
         })
        
         
    } catch (error) {
      c.status(500)
      console.error(error);
      
      return c.json({
        sucess:false,
        message:"error in registring user"
      })
        
    }
  
   
  })