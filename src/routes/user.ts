import { Context, Hono, Next } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import{setCookie,getCookie, deleteCookie} from 'hono/cookie'
import { jwt,decode,verify,sign} from "hono/jwt";




export const userRoute = new Hono<{
    Bindings:{
        DATABASE_URL: string,
        JWT_SECRET:string,
        
        
    },
    Variables:{
      userId:string,
     
    },
    
    
}>()

 export const verifyUser =  async (c:Context,next:Next)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())


  try {
    const accessToken = await getCookie(c,'Access-Token') || c.req?.header("authorization")?.replace("Bearer","") 
    console.log('cookie token' ,accessToken)
  
    if(!accessToken) return c.text('unauthorized request login please',402)
  
   const decodedToken= await verify(accessToken, c.env.JWT_SECRET)
   
   if(!decodedToken) return c.text('invalid token', 402)
  
    const user = await prisma.user.findFirst({
      where:{
        id: decodedToken?.id || ''
      }
    })

    if(!user) return c.text('unauthorized user register  please')

      c.set('userId',user.id)
     

      await next()
  } catch (error) {
    
    console.log(error)
    c.text('error in verifying user', 500)
  }
}



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

         const {username,email,password,fullName} = await c.req.json()

         if(!username && !password && !email && !fullName){
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
            password:password,
            fullName:fullName
          }
         })

         const accessToken = await sign({
          id:user.id,
          username:user.username,
          role:user.role,
          exp: Math.floor(Date.now()/1000)+60*5
         }, c.env.JWT_SECRET)

         await setCookie(c,'Access-Token',accessToken,{
          httpOnly:true,
          secure:true,
          maxAge:1000
         })

         console.log(user)
         return c.json({
          success:true,
          data:{username: user.username, email:user.email,id:user.id, fullName:user.fullName},
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

  userRoute.post('/login', async (c)=>{

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    // fetch the user details

   try {
     const { email,username, password} = await c.req.json()
 
     if(!(email || username) && !password) {
       
       return c.text('All fields are required', 402)
     }
 
     const foundUser = await prisma.user.findFirst({
      where:{
        OR:[
          {username:username},
          {email:email}
        ],
       
      }
     }
     )
 
     if(!foundUser){
       return c.text("User with this username or email does not exists", 404)
     }

     const verify =  foundUser.password === password
 
     if(!verify) {
      return c.text("invalid password", 404)
    }
     const accessToken = await sign({
       id:foundUser.id,
       username:foundUser.username,
       role:foundUser.role,
       exp: Math.floor(Date.now()/1000)+60*50
      }, c.env.JWT_SECRET)
     
      await setCookie(c,'Access-Token',accessToken,{
       httpOnly:true,
       secure:true,
       maxAge:1000
      })
 
      return c.json({
        success:true,
        data:{
          id:foundUser.id,
          username:foundUser.username,
          email:foundUser.email,
          fullName:foundUser.fullName

        }
      },
    200)
   } catch (error) {
    
    console.log(error)
    return c.text("error in loogging in user", 500)
   }
  })

  userRoute.post('/logout', verifyUser,async(c)=>{
   try {

    await deleteCookie(c, 'Access-Token',{
      secure:true,
      httpOnly:true,

    })

    return c.text('user logout succesfully', 200)

    
   } catch (error) {
    
    console.log(error)
    c.text('error in logging out the user',500)
   }
  })

  userRoute.post('/updateAccountDetails' , verifyUser, async(c)=>{
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {

      const {fullName , username} = await c.req.json()

      const userId = await c.get('userId')
      

      if(!(username || fullName)) return  c.text('provide at least one field to update',402)

        const updatedUser = await prisma.user.update({
         where:{
          id:userId
          
         },
         
         data:{
       
        username:username || undefined,
        fullName: fullName || undefined
        }
        
         
         }
        )

       

       return c.json({
        success:true,
        data:{
          id:updatedUser.id,
          fullName:updatedUser.fullName,
          username:updatedUser.username,
          email:updatedUser.email

        },
        message:" user's account details updated successfully",
        statusCode: 200
       })
       

    } catch (error) {
      
      console.log(error)
      return c.text('error in updating user account details', 500)
    }
  })