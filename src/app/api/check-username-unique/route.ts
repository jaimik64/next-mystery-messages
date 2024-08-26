import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from 'zod';
import { userNameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: userNameValidation
})

export async function GET(req: Request){

    await dbConnect();

    try {
        const {searchParams} = new URL(req.url);
        const queryParams = {
            username: searchParams.get('userName'),
        };


        // Validate User name
        const result = UsernameQuerySchema.safeParse(queryParams); 
        
        /** 
         * Check There's any error in the schema
         */
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            
            return Response.json({
                success: false,
                message: usernameErrors.length > 0 ? usernameErrors.join(', ') : 'Invalid Request Params',
            }, {status: 400});
        }

        const {username} = result.data;

        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true});

        if(existingVerifiedUser){
            return Response.json({
                success: false,
                message: "Username already taken"
            },{status:400});
        }

        return Response.json({
            success: true,
            message: "Username unique"
        },{status:201});
        
    } catch (error) {
        console.error("Error while checking username: " + error);       

        return Response.json({
            success: false,
            message: "Error while checking username"
        }, 
        {status: 500});
    }
}